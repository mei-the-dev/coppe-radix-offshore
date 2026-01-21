import { Router, Request, Response } from 'express';
import { query } from '../../db/connection';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /cargo/types
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;

    let sql = `
      SELECT
        ct.id,
        ct.name,
        ct.category,
        ct.density_kg_m3,
        ct.unit,
        ct.segregation_required,
        ct.loading_rate_m3h,
        ct.discharging_rate_m3h,
        ct.weather_sensitive,
        ct.handling_cost_per_unit
      FROM cargo_types ct
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND ct.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    sql += ` ORDER BY ct.category, ct.name`;

    const result = await query(sql, params);

    // Get incompatibility data for each cargo type
    const formatted = await Promise.all(
      result.rows.map(async (row) => {
        const incompatibleResult = await query(
          `SELECT
            CASE
              WHEN cargo_type_id_1 = $1 THEN cargo_type_id_2
              ELSE cargo_type_id_1
            END as incompatible_type
          FROM cargo_incompatibility
          WHERE cargo_type_id_1 = $1 OR cargo_type_id_2 = $1`,
          [row.id]
        );

        return {
          id: row.id,
          name: row.name,
          category: row.category,
          density_kg_m3: parseFloat(row.density_kg_m3 || 0),
          unit: row.unit,
          segregation_required: row.segregation_required || false,
          transfer_rates: {
            loading_m3h: parseFloat(row.loading_rate_m3h || 0),
            discharging_m3h: parseFloat(row.discharging_rate_m3h || 0)
          },
          weather_sensitive: row.weather_sensitive || false,
          handling_cost_per_unit: parseFloat(row.handling_cost_per_unit || 0),
          incompatible_with: incompatibleResult.rows.map(r => r.incompatible_type)
        };
      })
    );

    res.json({ data: formatted });
  } catch (error: any) {
    console.error('Error fetching cargo types:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
