import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /installations
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, active, include_storage } = req.query;

    let sql = `
      SELECT
        i.id,
        i.name,
        i.type,
        ST_Y(i.location::geometry) as latitude,
        ST_X(i.location::geometry) as longitude,
        i.water_depth_m,
        i.distance_from_base_nm,
        i.production_capacity_bpd,
        i.max_simultaneous_vessels,
        i.max_wind_ms,
        i.max_wave_m,
        i.max_current_kts
      FROM installations i
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      sql += ` AND i.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Note: 'active' status would need to be defined in the schema
    // For now, we'll return all installations

    sql += ` ORDER BY i.name`;

    const result = await query(sql, params);
    const installations = result.rows;

    // If include_storage is requested, fetch storage data
    if (include_storage === 'true') {
      for (const inst of installations) {
        const storageResult = await query(
          `SELECT
            cargo_type_id,
            max_capacity,
            current_level,
            safety_stock,
            unit,
            CASE
              WHEN current_level < safety_stock THEN 'Critical'
              WHEN current_level < reorder_point THEN 'Low'
              ELSE 'Normal'
            END as status
          FROM installation_storage
          WHERE installation_id = $1`,
          [inst.id]
        );
        inst.storage = storageResult.rows;
      }
    }

    // Format response according to API spec
    const formatted = installations.map(inst => ({
      id: inst.id,
      name: inst.name,
      type: inst.type,
      location: {
        latitude: parseFloat(inst.latitude),
        longitude: parseFloat(inst.longitude),
        water_depth_m: parseFloat(inst.water_depth_m)
      },
      distance_from_base_nm: parseFloat(inst.distance_from_base_nm),
      production_capacity_bpd: parseFloat(inst.production_capacity_bpd),
      operational_limits: {
        max_wind_ms: parseFloat(inst.max_wind_ms),
        max_wave_m: parseFloat(inst.max_wave_m),
        max_current_kts: parseFloat(inst.max_current_kts),
        max_simultaneous_vessels: inst.max_simultaneous_vessels
      },
      ...(inst.storage && { storage: inst.storage })
    }));

    res.json({
      data: formatted,
      meta: {
        total: formatted.length,
        page: 1,
        per_page: 10
      }
    });
  } catch (error: any) {
    console.error('Error fetching installations:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// GET /installations/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        i.*,
        ST_Y(i.location::geometry) as latitude,
        ST_X(i.location::geometry) as longitude
      FROM installations i
      WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: `Installation with id '${id}' not found`
      });
    }

    const inst = result.rows[0];

    // Get storage levels
    const storageResult = await query(
      `SELECT
        cargo_type_id,
        max_capacity,
        current_level,
        safety_stock,
        reorder_point,
        unit
      FROM installation_storage
      WHERE installation_id = $1`,
      [id]
    );

    // Get consumption profiles
    const consumptionResult = await query(
      `SELECT
        cargo_type_id,
        daily_consumption,
        unit,
        scenario_normal_factor,
        scenario_drilling_factor
      FROM consumption_profiles
      WHERE installation_id = $1`,
      [id]
    );

    const response = {
      id: inst.id,
      name: inst.name,
      type: inst.type,
      location: {
        latitude: parseFloat(inst.latitude),
        longitude: parseFloat(inst.longitude),
        water_depth_m: parseFloat(inst.water_depth_m)
      },
      distance_from_base_nm: parseFloat(inst.distance_from_base_nm),
      production_capacity_bpd: parseFloat(inst.production_capacity_bpd),
      current_production_bpd: null, // Would need to be calculated from production data
      storage_capacity_bbl: parseFloat(inst.oil_storage_capacity_bbl || 0),
      crane_specs: {
        count: inst.num_cranes || 0,
        capacity_t: parseFloat(inst.crane_capacity_t || 0)
      },
      operational_status: 'Active', // Would need status field in schema
      next_maintenance: null, // Would need maintenance schedule
      storage_levels: storageResult.rows,
      consumption_profile: consumptionResult.rows,
      upcoming_demands: [] // Would need to query demands table
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching installation:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// PUT /installations/:id/inventory
router.put('/:id/inventory', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { cargo_type_id, new_level, unit, reason, recorded_by } = req.body;

    if (!cargo_type_id || new_level === undefined) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'cargo_type_id and new_level are required'
      });
    }

    // Get current level
    const currentResult = await query(
      `SELECT current_level, safety_stock, reorder_point
      FROM installation_storage
      WHERE installation_id = $1 AND cargo_type_id = $2`,
      [id, cargo_type_id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Storage record not found for this installation and cargo type'
      });
    }

    const previous_level = currentResult.rows[0].current_level;
    const safety_stock = currentResult.rows[0].safety_stock;
    const reorder_point = currentResult.rows[0].reorder_point;

    // Update inventory level
    await query(
      `UPDATE installation_storage
      SET current_level = $1, last_updated = CURRENT_TIMESTAMP
      WHERE installation_id = $2 AND cargo_type_id = $3`,
      [new_level, id, cargo_type_id]
    );

    // Determine status
    let status = 'Normal';
    if (new_level < safety_stock) {
      status = 'Critical';
    } else if (new_level < reorder_point) {
      status = 'Low';
    }

    res.json({
      success: true,
      installation_id: id,
      cargo_type_id,
      previous_level: parseFloat(previous_level),
      new_level: parseFloat(new_level),
      safety_stock: parseFloat(safety_stock),
      reorder_point: parseFloat(reorder_point),
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
