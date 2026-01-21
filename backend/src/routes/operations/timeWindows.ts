import { Router, Request, Response } from 'express';
import { query } from '../../db/connection';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /operations/time-windows
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { installation_id, from_date, to_date, operation_type } = req.query;

    if (!installation_id || !from_date || !to_date) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'installation_id, from_date, and to_date are required'
      });
    }

    const result = await query(
      `SELECT
        date,
        start_time,
        end_time,
        available,
        conflict_type,
        preference_score
      FROM time_windows
      WHERE installation_id = $1
      AND date BETWEEN $2 AND $3
      ORDER BY date, start_time`,
      [installation_id, from_date, to_date]
    );

    // Group by date
    const windowsByDate: any = {};
    result.rows.forEach(row => {
      const date = row.date.toISOString().split('T')[0];
      if (!windowsByDate[date]) {
        windowsByDate[date] = [];
      }
      windowsByDate[date].push({
        start: row.start_time,
        end: row.end_time,
        preference_score: parseFloat(row.preference_score || 1.0),
        conflicts: row.conflict_type ? [row.conflict_type] : []
      });
    });

    const windows = Object.keys(windowsByDate).map(date => ({
      date,
      available_slots: windowsByDate[date]
    }));

    res.json({
      installation_id,
      date_range: {
        from: from_date,
        to: to_date
      },
      windows
    });
  } catch (error: any) {
    console.error('Error fetching time windows:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
