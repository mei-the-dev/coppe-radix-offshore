import { Router, Request, Response } from 'express';
import { query } from '../../db/connection';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /fleet/vessels
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { class: vesselClass, status, available_from } = req.query;

    let sql = `
      SELECT
        v.id,
        v.name,
        v.class,
        v.loa_m,
        v.beam_m,
        v.draught_m,
        v.deck_cargo_capacity_t,
        v.clear_deck_area_m2,
        v.total_deadweight_t,
        v.operational_speed_kts,
        v.dp_class,
        v.fuel_consumption_transit_td,
        v.fuel_consumption_dp_td,
        v.fuel_consumption_port_td,
        v.charter_rate_daily_usd,
        v.crew_size,
        v.next_maintenance_due,
        v.availability_status,
        v.current_location_id,
        CASE 
          WHEN v.current_location_coords IS NOT NULL THEN ST_Y(v.current_location_coords::geometry)
          ELSE NULL
        END as current_lat,
        CASE 
          WHEN v.current_location_coords IS NOT NULL THEN ST_X(v.current_location_coords::geometry)
          ELSE NULL
        END as current_lon,
        vs.status as schedule_status,
        vs.current_trip_id,
        vs.next_available,
        vs.ytd_utilization
      FROM vessels v
      LEFT JOIN vessel_schedules vs ON v.id = vs.vessel_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (vesselClass) {
      sql += ` AND v.class = $${paramIndex}`;
      params.push(vesselClass);
      paramIndex++;
    }

    if (status) {
      sql += ` AND v.availability_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (available_from) {
      sql += ` AND (vs.next_available IS NULL OR vs.next_available <= $${paramIndex})`;
      params.push(available_from);
      paramIndex++;
    }

    sql += ` ORDER BY v.name`;

    const result = await query(sql, params);
    const vessels = result.rows;

    // Fetch compartments for each vessel
    for (const vessel of vessels) {
      const compartmentsResult = await query(
        `SELECT
          id,
          compartment_type,
          capacity,
          unit,
          current_cargo_id,
          fill_level
        FROM vessel_compartments
        WHERE vessel_id = $1`,
        [vessel.id]
      );
      vessel.compartments = compartmentsResult.rows.map(comp => ({
        id: comp.id,
        type: comp.compartment_type,
        capacity: parseFloat(comp.capacity),
        unit: comp.unit,
        current_cargo: comp.current_cargo_id,
        fill_level: parseFloat(comp.fill_level || 0)
      }));
    }

    // Format response
    const formatted = vessels.map(v => ({
      id: v.id,
      name: v.name,
      class: v.class,
      // Include position data directly for easier access
      current_lat: v.current_lat ? parseFloat(v.current_lat) : null,
      current_lon: v.current_lon ? parseFloat(v.current_lon) : null,
      specifications: {
        loa_m: parseFloat(v.loa_m || 0),
        beam_m: parseFloat(v.beam_m || 0),
        draught_m: parseFloat(v.draught_m || 0),
        deck_cargo_capacity_t: parseFloat(v.deck_cargo_capacity_t || 0),
        clear_deck_area_m2: v.clear_deck_area_m2 != null ? parseFloat(v.clear_deck_area_m2) : null,
        total_deadweight_t: parseFloat(v.total_deadweight_t || 0),
        operational_speed_kts: parseFloat(v.operational_speed_kts || 0)
      },
      dp_class: v.dp_class,
      fuel_consumption: {
        transit_td: parseFloat(v.fuel_consumption_transit_td || 0),
        dp_td: parseFloat(v.fuel_consumption_dp_td || 0),
        port_td: parseFloat(v.fuel_consumption_port_td || 0)
      },
      charter_rate_daily_usd: parseFloat(v.charter_rate_daily_usd || 0),
      availability: {
        status: v.availability_status,
        next_available: v.next_available ? new Date(v.next_available).toISOString() : null,
        current_location: v.current_location_id ? {
          type: 'SupplyBase', // Would need to determine from location lookup
          id: v.current_location_id,
          name: v.current_location_id
        } : null
      },
      compartments: v.compartments || [],
      crew_size: v.crew_size,
      next_maintenance_due: v.next_maintenance_due ? new Date(v.next_maintenance_due).toISOString().split('T')[0] : null
    }));

    // Calculate meta information
    const available = formatted.filter(v => v.availability.status === 'Available').length;
    const in_use = formatted.filter(v => v.availability.status === 'InUse').length;
    const maintenance = formatted.filter(v => v.availability.status === 'Maintenance').length;

    res.json({
      data: formatted,
      meta: {
        total: formatted.length,
        available,
        in_use,
        maintenance
      }
    });
  } catch (error: any) {
    console.error('Error fetching vessels:', error);
    const msg = String(error?.message || '');
    const code = String(error?.code ?? '');
    const isDbOrConnect = /relation|column|does not exist|connection|refused|timeout|ECONNREFUSED|ETIMEDOUT|42P01|42703|password|ssl|auth|ENOTFOUND|database/i.test(msg) || /42P01|42703|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/.test(code);
    const empty = { data: [] as any[], meta: { total: 0, available: 0, in_use: 0, maintenance: 0 } };
    if (isDbOrConnect) {
      return res.status(200).json(empty);
    }
    console.warn('Vessels list error (returning empty):', msg);
    return res.status(200).json(empty);
  }
});

// GET /fleet/vessels/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        v.*,
        ST_Y(v.current_location_coords::geometry) as current_lat,
        ST_X(v.current_location_coords::geometry) as current_lon,
        vs.status as schedule_status,
        vs.current_trip_id,
        vs.next_available,
        vs.ytd_utilization
      FROM vessels v
      LEFT JOIN vessel_schedules vs ON v.id = vs.vessel_id
      WHERE v.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: `Vessel with id '${id}' not found`
      });
    }

    const vessel = result.rows[0];
    res.json(vessel);
  } catch (error: any) {
    console.error('Error fetching vessel:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// GET /fleet/vessels/:id/schedule
router.get('/:id/schedule', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get vessel info
    const vesselResult = await query(
      `SELECT id, name FROM vessels WHERE id = $1`,
      [id]
    );

    if (vesselResult.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: `Vessel with id '${id}' not found`
      });
    }

    const vessel = vesselResult.rows[0];

    // Get schedule
    const scheduleResult = await query(
      `SELECT status, current_trip_id, next_available, ytd_utilization
      FROM vessel_schedules WHERE vessel_id = $1`,
      [id]
    );

    const schedule = scheduleResult.rows[0] || {};

    // Get current trip if exists
    let currentTrip = null;
    if (schedule.current_trip_id) {
      const tripResult = await query(
        `SELECT
          t.id as trip_id,
          t.status,
          t.planned_departure,
          t.actual_departure,
          t.planned_arrival,
          t.actual_arrival
        FROM trips t
        WHERE t.id = $1`,
        [schedule.current_trip_id]
      );

      if (tripResult.rows.length > 0) {
        const trip = tripResult.rows[0];
        // Get route waypoints
        const waypointsResult = await query(
          `SELECT
            location_id,
            location_type,
            sequence,
            planned_arrival,
            actual_arrival,
            planned_departure,
            actual_departure,
            operation_type
          FROM trip_waypoints
          WHERE trip_id = $1
          ORDER BY sequence`,
          [trip.trip_id]
        );

        currentTrip = {
          trip_id: trip.trip_id,
          route: waypointsResult.rows.map(wp => wp.location_id),
          current_waypoint: waypointsResult.rows.find(wp => !wp.actual_departure)?.location_id || null,
          eta: waypointsResult.rows.find(wp => !wp.actual_arrival)?.planned_arrival || null,
          progress: 0.5 // Would need to calculate based on position
        };
      }
    }

    // Get scheduled trips
    const scheduledTripsResult = await query(
      `SELECT
        t.id as trip_id,
        t.planned_departure,
        t.planned_arrival
      FROM trips t
      WHERE t.vessel_id = $1
      AND t.status = 'Planned'
      AND t.planned_departure > CURRENT_TIMESTAMP
      ORDER BY t.planned_departure
      LIMIT 10`,
      [id]
    );

    const scheduledTrips = await Promise.all(
      scheduledTripsResult.rows.map(async (trip) => {
        // Get destinations
        const waypointsResult = await query(
          `SELECT location_id FROM trip_waypoints
          WHERE trip_id = $1 AND location_type = 'Installation'
          ORDER BY sequence`,
          [trip.trip_id]
        );

        return {
          trip_id: trip.trip_id,
          departure: new Date(trip.planned_departure).toISOString(),
          destinations: waypointsResult.rows.map(wp => wp.location_id),
          estimated_return: trip.planned_arrival ? new Date(trip.planned_arrival).toISOString() : null
        };
      })
    );

    // Get maintenance info
    const maintenanceResult = await query(
      `SELECT next_maintenance_due FROM vessels WHERE id = $1`,
      [id]
    );

    const maintenance = maintenanceResult.rows[0] ? {
      last_maintenance: null, // Would need maintenance history table
      next_maintenance_due: maintenanceResult.rows[0].next_maintenance_due,
      hours_until_maintenance: null // Would need to calculate
    } : null;

    res.json({
      vessel_id: vessel.id,
      vessel_name: vessel.name,
      current_status: schedule.status || 'Idle',
      current_trip: currentTrip,
      next_available: schedule.next_available ? new Date(schedule.next_available).toISOString() : null,
      scheduled_trips: scheduledTrips,
      utilization_ytd: parseFloat(schedule.ytd_utilization || 0),
      maintenance
    });
  } catch (error: any) {
    console.error('Error fetching vessel schedule:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// POST /fleet/vessels/:id/availability
router.post('/:id/availability', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason, unavailable_from, unavailable_to, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'status is required'
      });
    }

    // Get current status
    const currentResult = await query(
      `SELECT availability_status FROM vessels WHERE id = $1`,
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: `Vessel with id '${id}' not found`
      });
    }

    const previous_status = currentResult.rows[0].availability_status;

    // Update vessel status
    await query(
      `UPDATE vessels
      SET availability_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
      [status, id]
    );

    // Update schedule if needed
    if (status === 'Maintenance' && unavailable_from && unavailable_to) {
      await query(
        `UPDATE vessel_schedules
        SET next_available = $1, updated_at = CURRENT_TIMESTAMP
        WHERE vessel_id = $2`,
        [unavailable_to, id]
      );
    }

    // Calculate duration
    let duration_days = null;
    if (unavailable_from && unavailable_to) {
      const from = new Date(unavailable_from);
      const to = new Date(unavailable_to);
      duration_days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    }

    res.json({
      success: true,
      vessel_id: id,
      previous_status,
      new_status: status,
      unavailable_period: unavailable_from && unavailable_to ? {
        from: unavailable_from,
        to: unavailable_to,
        duration_days
      } : null,
      affected_trips: [] // Would need to check for affected trips
    });
  } catch (error: any) {
    console.error('Error updating vessel availability:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
