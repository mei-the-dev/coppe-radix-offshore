import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /network/distances
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query;

    let sql = `
      SELECT
        dm.from_location_id,
        dm.to_location_id,
        dm.distance_nm,
        dm.distance_km,
        dm.time_12kts_h,
        dm.time_14kts_h,
        dm.weather_factor_good,
        dm.weather_factor_moderate,
        dm.weather_factor_rough,
        COALESCE(sb_from.name, inst_from.name) as from_name,
        COALESCE(sb_to.name, inst_to.name) as to_name
      FROM distance_matrix dm
      LEFT JOIN supply_bases sb_from ON dm.from_location_id = sb_from.id
      LEFT JOIN installations inst_from ON dm.from_location_id = inst_from.id
      LEFT JOIN supply_bases sb_to ON dm.to_location_id = sb_to.id
      LEFT JOIN installations inst_to ON dm.to_location_id = inst_to.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (from) {
      sql += ` AND dm.from_location_id = $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      sql += ` AND dm.to_location_id = $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    sql += ` ORDER BY dm.from_location_id, dm.to_location_id`;

    const result = await query(sql, params);

    const formatted = result.rows.map(row => ({
      from_location_id: row.from_location_id,
      from_name: row.from_name,
      to_location_id: row.to_location_id,
      to_name: row.to_name,
      distance_nm: parseFloat(row.distance_nm),
      distance_km: parseFloat(row.distance_km),
      time_12kts_h: parseFloat(row.time_12kts_h || 0),
      time_14kts_h: parseFloat(row.time_14kts_h || 0),
      weather_factors: {
        good: parseFloat(row.weather_factor_good || 1.0),
        moderate: parseFloat(row.weather_factor_moderate || 1.15),
        rough: parseFloat(row.weather_factor_rough || 1.3)
      }
    }));

    res.json({ data: formatted });
  } catch (error: any) {
    console.error('Error fetching distances:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
