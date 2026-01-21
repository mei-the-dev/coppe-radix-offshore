import { Router, Request, Response } from 'express';
import { query } from '../../db/connection';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /demands
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { installation_id, status, priority, from_date, to_date } = req.query;

    let sql = `
      SELECT
        d.id,
        d.installation_id,
        i.name as installation_name,
        d.cargo_type_id,
        ct.name as cargo_name,
        d.quantity,
        d.unit,
        d.earliest_delivery,
        d.latest_delivery,
        d.priority,
        d.scenario,
        d.status,
        d.penalty_late_per_day,
        d.forecast_accuracy
      FROM demands d
      JOIN installations i ON d.installation_id = i.id
      JOIN cargo_types ct ON d.cargo_type_id = ct.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (installation_id) {
      sql += ` AND d.installation_id = $${paramIndex}`;
      params.push(installation_id);
      paramIndex++;
    }

    if (status) {
      sql += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      sql += ` AND d.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (from_date) {
      sql += ` AND d.latest_delivery >= $${paramIndex}`;
      params.push(from_date);
      paramIndex++;
    }

    if (to_date) {
      sql += ` AND d.latest_delivery <= $${paramIndex}`;
      params.push(to_date);
      paramIndex++;
    }

    sql += ` ORDER BY
      CASE d.priority
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        WHEN 'Normal' THEN 3
        WHEN 'Low' THEN 4
      END,
      d.earliest_delivery`;

    const result = await query(sql, params);

    // Get current inventory levels for each demand
    const formatted = await Promise.all(
      result.rows.map(async (row) => {
        const inventoryResult = await query(
          `SELECT current_level, safety_stock
          FROM installation_storage
          WHERE installation_id = $1 AND cargo_type_id = $2`,
          [row.installation_id, row.cargo_type_id]
        );

        const inventory = inventoryResult.rows[0];
        const current_inventory = inventory ? parseFloat(inventory.current_level) : 0;
        const safety_stock = inventory ? parseFloat(inventory.safety_stock) : 0;
        const daily_consumption = 0; // Would need to get from consumption_profiles
        const days_of_supply = daily_consumption > 0
          ? current_inventory / daily_consumption
          : null;

        return {
          id: row.id,
          installation_id: row.installation_id,
          installation_name: row.installation_name,
          cargo_type_id: row.cargo_type_id,
          cargo_name: row.cargo_name,
          quantity: parseFloat(row.quantity),
          unit: row.unit,
          time_window: {
            earliest: new Date(row.earliest_delivery).toISOString(),
            latest: new Date(row.latest_delivery).toISOString()
          },
          priority: row.priority,
          scenario: row.scenario,
          status: row.status,
          penalty_late_per_day: parseFloat(row.penalty_late_per_day || 0),
          current_inventory,
          safety_stock,
          days_of_supply,
          forecast_accuracy: parseFloat(row.forecast_accuracy || 0.85)
        };
      })
    );

    // Calculate meta
    const critical = formatted.filter(d => d.priority === 'Critical').length;
    const high = formatted.filter(d => d.priority === 'High').length;
    const normal = formatted.filter(d => d.priority === 'Normal').length;
    const low = formatted.filter(d => d.priority === 'Low').length;

    res.json({
      data: formatted,
      meta: {
        total: formatted.length,
        critical,
        high,
        normal,
        low
      }
    });
  } catch (error: any) {
    console.error('Error fetching demands:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// POST /demands
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      installation_id,
      cargo_type_id,
      quantity,
      unit,
      earliest_delivery,
      latest_delivery,
      priority,
      scenario,
      notes,
      penalty_late_per_day
    } = req.body;

    // Validation
    if (!installation_id || !cargo_type_id || !quantity || !earliest_delivery || !latest_delivery) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Missing required fields',
        details: {
          installation_id: !installation_id ? 'Required' : undefined,
          cargo_type_id: !cargo_type_id ? 'Required' : undefined,
          quantity: !quantity ? 'Must be greater than 0' : undefined,
          earliest_delivery: !earliest_delivery ? 'Required' : undefined,
          latest_delivery: !latest_delivery ? 'Required' : undefined
        }
      });
    }

    if (new Date(earliest_delivery) > new Date(latest_delivery)) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'earliest_delivery must be before latest_delivery'
      });
    }

    // Insert demand
    const result = await query(
      `INSERT INTO demands (
        id, installation_id, cargo_type_id, quantity, unit,
        earliest_delivery, latest_delivery, priority, scenario,
        penalty_late_per_day, status, forecast_accuracy
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Planned', 0.85
      ) RETURNING id, created_at`,
      [
        `demand_${Date.now()}`,
        installation_id,
        cargo_type_id,
        quantity,
        unit || 'm3',
        earliest_delivery,
        latest_delivery,
        priority || 'Normal',
        scenario || 'Normal',
        penalty_late_per_day || 0
      ]
    );

    const demand = result.rows[0];

    // TODO: Calculate estimated_order_date and recommended_vessel using optimization
    // For now, return mock values
    res.status(201).json({
      id: demand.id,
      status: 'Planned',
      created_at: new Date(demand.created_at).toISOString(),
      estimated_order_date: earliest_delivery,
      recommended_vessel: null, // Would need optimization
      estimated_cost: null // Would need cost calculation
    });
  } catch (error: any) {
    console.error('Error creating demand:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
