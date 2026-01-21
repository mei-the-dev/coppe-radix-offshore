import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /weather/forecasts
router.get('/forecasts', async (req: AuthRequest, res: Response) => {
  try {
    const { location_id, from_time, to_time, horizon } = req.query;

    if (!location_id || !from_time || !to_time) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'location_id, from_time, and to_time are required'
      });
    }

    const result = await query(
      `SELECT
        location_id,
        timestamp,
        forecast_horizon_h,
        wave_height_min_m,
        wave_height_mean_m,
        wave_height_max_m,
        wind_speed_min_ms,
        wind_speed_mean_ms,
        wind_speed_max_ms,
        wind_direction,
        current_speed_kts,
        visibility_nm,
        forecast_accuracy,
        weather_state
      FROM weather_forecasts
      WHERE location_id = $1
      AND timestamp BETWEEN $2 AND $3
      ORDER BY timestamp, forecast_horizon_h`,
      [location_id, from_time, to_time]
    );

    // Get location name
    const locationResult = await query(
      `SELECT name FROM installations WHERE id = $1
      UNION
      SELECT name FROM supply_bases WHERE id = $1`,
      [location_id]
    );

    const formatted = result.rows.map(row => ({
      timestamp: new Date(row.timestamp).toISOString(),
      forecast_horizon_h: row.forecast_horizon_h,
      conditions: {
        wave_height: {
          min_m: parseFloat(row.wave_height_min_m || 0),
          mean_m: parseFloat(row.wave_height_mean_m || 0),
          max_m: parseFloat(row.wave_height_max_m || 0)
        },
        wind_speed: {
          min_ms: parseFloat(row.wind_speed_min_ms || 0),
          mean_ms: parseFloat(row.wind_speed_mean_ms || 0),
          max_ms: parseFloat(row.wind_speed_max_ms || 0)
        },
        wind_direction: row.wind_direction,
        current_speed_kts: parseFloat(row.current_speed_kts || 0),
        visibility_nm: parseFloat(row.visibility_nm || 0)
      },
      weather_state: row.weather_state || 'Moderate',
      forecast_accuracy: parseFloat(row.forecast_accuracy || 0.85),
      operational_impact: {
        crane_operations: 'Suitable', // Would need to calculate
        liquid_discharge: 'Suitable',
        transit: 'Suitable'
      }
    }));

    res.json({
      location_id,
      location_name: locationResult.rows[0]?.name || location_id,
      forecasts: formatted
    });
  } catch (error: any) {
    console.error('Error fetching weather forecasts:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// GET /weather/windows
router.get('/windows', async (req: AuthRequest, res: Response) => {
  try {
    const { location_id, operation_type, from_time, duration_h } = req.query;

    if (!location_id || !operation_type || !from_time || !duration_h) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'location_id, operation_type, from_time, and duration_h are required'
      });
    }

    const result = await query(
      `SELECT
        start_time,
        end_time,
        duration_h,
        confidence,
        condition_wave_m,
        condition_wind_ms,
        condition_current_kts,
        condition_visibility_nm,
        suitable
      FROM weather_windows
      WHERE location_id = $1
      AND operation_type = $2
      AND start_time >= $3
      AND duration_h >= $4
      AND suitable = true
      ORDER BY start_time`,
      [location_id, operation_type, from_time, duration_h]
    );

    const formatted = result.rows.map(row => ({
      start_time: new Date(row.start_time).toISOString(),
      end_time: new Date(row.end_time).toISOString(),
      duration_h: parseFloat(row.duration_h),
      confidence: parseFloat(row.confidence || 0.8),
      conditions: {
        wave_m: parseFloat(row.condition_wave_m || 0),
        wind_ms: parseFloat(row.condition_wind_ms || 0),
        current_kts: parseFloat(row.condition_current_kts || 0),
        visibility_nm: parseFloat(row.condition_visibility_nm || 0)
      },
      suitable: row.suitable,
      risk_level: 'Low' // Would need to calculate
    }));

    res.json({
      location_id,
      operation_type,
      requested_duration_h: parseFloat(duration_h as string),
      windows: formatted
    });
  } catch (error: any) {
    console.error('Error fetching weather windows:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
