import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /trips
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { vessel_id, status, from_date, to_date } = req.query;

    let sql = `
      SELECT
        t.id,
        t.vessel_id,
        v.name as vessel_name,
        t.status,
        t.planned_departure,
        t.actual_departure,
        t.planned_arrival,
        t.actual_arrival,
        t.total_distance_nm,
        t.total_duration_h,
        t.fuel_consumed_t,
        t.total_cost_usd
      FROM trips t
      JOIN vessels v ON t.vessel_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (vessel_id) {
      sql += ` AND t.vessel_id = $${paramIndex}`;
      params.push(vessel_id);
      paramIndex++;
    }

    if (status) {
      sql += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (from_date) {
      sql += ` AND t.planned_departure >= $${paramIndex}`;
      params.push(from_date);
      paramIndex++;
    }

    if (to_date) {
      sql += ` AND t.planned_departure <= $${paramIndex}`;
      params.push(to_date);
      paramIndex++;
    }

    sql += ` ORDER BY t.planned_departure DESC`;

    const result = await query(sql, params);

    // Get route waypoints and cargo manifest for each trip
    const formatted = await Promise.all(
      result.rows.map(async (trip) => {
        const waypointsResult = await query(
          `SELECT
            tw.sequence,
            tw.location_id,
            COALESCE(sb.name, inst.name) as location_name,
            tw.location_type,
            tw.planned_arrival,
            tw.actual_arrival,
            tw.planned_departure,
            tw.actual_departure,
            tw.operation_type,
            tw.service_time_h,
            tw.weather_delay_h
          FROM trip_waypoints tw
          LEFT JOIN supply_bases sb ON tw.location_id = sb.id AND tw.location_type = 'SupplyBase'
          LEFT JOIN installations inst ON tw.location_id = inst.id AND tw.location_type = 'Installation'
          WHERE tw.trip_id = $1
          ORDER BY tw.sequence`,
          [trip.id]
        );

        const cargoResult = await query(
          `SELECT
            tcm.cargo_type_id,
            ct.name as cargo_name,
            tcm.quantity,
            tcm.unit,
            tcm.action,
            tw.sequence as waypoint_sequence
          FROM trip_cargo_manifest tcm
          JOIN cargo_types ct ON tcm.cargo_type_id = ct.id
          JOIN trip_waypoints tw ON tcm.waypoint_id = tw.id
          WHERE tcm.trip_id = $1`,
          [trip.id]
        );

        const delaysResult = await query(
          `SELECT reason, delay_type, duration_h, location
          FROM trip_delays
          WHERE trip_id = $1`,
          [trip.id]
        );

        return {
          id: trip.id,
          vessel_id: trip.vessel_id,
          vessel_name: trip.vessel_name,
          status: trip.status,
          route: waypointsResult.rows.map(wp => ({
            sequence: wp.sequence,
            location_id: wp.location_id,
            location_name: wp.location_name,
            type: wp.location_type,
            planned_arrival: wp.planned_arrival ? new Date(wp.planned_arrival).toISOString() : null,
            actual_arrival: wp.actual_arrival ? new Date(wp.actual_arrival).toISOString() : null,
            planned_departure: wp.planned_departure ? new Date(wp.planned_departure).toISOString() : null,
            actual_departure: wp.actual_departure ? new Date(wp.actual_departure).toISOString() : null,
            operations: wp.operation_type ? [wp.operation_type] : []
          })),
          cargo_manifest: cargoResult.rows,
          metrics: {
            total_distance_nm: parseFloat(trip.total_distance_nm || 0),
            total_duration_h: parseFloat(trip.total_duration_h || 0),
            fuel_consumed_t: parseFloat(trip.fuel_consumed_t || 0),
            total_cost_usd: parseFloat(trip.total_cost_usd || 0)
          },
          delays: delaysResult.rows,
          weather_impact: 'Moderate' // Would need to calculate from weather data
        };
      })
    );

    res.json({ data: formatted });
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// GET /trips/:id/tracking
router.get('/:id/tracking', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tripResult = await query(
      `SELECT
        t.id,
        t.vessel_id,
        v.name as vessel_name,
        t.status
      FROM trips t
      JOIN vessels v ON t.vessel_id = v.id
      WHERE t.id = $1`,
      [id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: `Trip with id '${id}' not found`
      });
    }

    const trip = tripResult.rows[0];

    // Get current waypoint
    const waypointResult = await query(
      `SELECT
        sequence,
        location_id,
        planned_arrival,
        actual_arrival
      FROM trip_waypoints
      WHERE trip_id = $1
      AND actual_departure IS NULL
      ORDER BY sequence
      LIMIT 1`,
      [id]
    );

    const currentWaypoint = waypointResult.rows[0];

    // Mock current position (would come from AIS/GPS in production)
    res.json({
      trip_id: trip.id,
      vessel_id: trip.vessel_id,
      vessel_name: trip.vessel_name,
      status: trip.status,
      current_position: {
        latitude: -22.4523,
        longitude: -40.1876,
        timestamp: new Date().toISOString(),
        speed_kts: 12.3,
        heading: 245,
        distance_to_next_waypoint_nm: 8.5
      },
      current_waypoint: currentWaypoint ? {
        sequence: currentWaypoint.sequence,
        location_id: currentWaypoint.location_id,
        eta: currentWaypoint.planned_arrival ? new Date(currentWaypoint.planned_arrival).toISOString() : null,
        eta_updated: new Date().toISOString()
      } : null,
      progress: 0.68,
      weather_current: {
        wave_height_m: 2.1,
        wind_speed_ms: 12,
        visibility_nm: 8
      }
    });
  } catch (error: any) {
    console.error('Error fetching trip tracking:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// POST /trips
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { vessel_id, planned_departure, route, cargo_manifest } = req.body;

    if (!vessel_id || !planned_departure || !route || !Array.isArray(route)) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'vessel_id, planned_departure, and route are required'
      });
    }

    const tripId = `trip_${Date.now()}`;

    // Create trip
    await query(
      `INSERT INTO trips (id, vessel_id, status, planned_departure)
      VALUES ($1, $2, 'Planned', $3)`,
      [tripId, vessel_id, planned_departure]
    );

    // Create waypoints
    for (const waypoint of route) {
      await query(
        `INSERT INTO trip_waypoints (
          id, trip_id, sequence, location_id, location_type,
          planned_arrival, planned_departure, operation_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          `wp_${Date.now()}_${waypoint.sequence}`,
          tripId,
          waypoint.sequence,
          waypoint.location_id,
          waypoint.location_type || 'Installation',
          waypoint.planned_arrival,
          waypoint.planned_departure,
          waypoint.operation_type
        ]
      );
    }

    // TODO: Calculate estimated metrics
    res.status(201).json({
      id: tripId,
      status: 'Planned',
      vessel_id,
      created_at: new Date().toISOString(),
      estimated_metrics: {
        total_distance_nm: 0,
        total_duration_h: 0,
        estimated_fuel_t: 0,
        estimated_cost_usd: 0
      },
      weather_forecast: 'Good conditions expected'
    });
  } catch (error: any) {
    console.error('Error creating trip:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
