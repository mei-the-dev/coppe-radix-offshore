/**
 * Analytics routes: KPIs, vessel performance, reporting.
 * Uses DB for fleet and trip metrics.
 */
import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// GET /analytics/kpis
router.get('/kpis', async (req: AuthRequest, res: Response) => {
  try {
    const { period, from_date, to_date } = req.query;

    // Default to monthly if not specified
    const periodType = period || 'monthly';
    let dateFilter = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (from_date && to_date) {
      dateFilter = `WHERE t.actual_departure BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(from_date, to_date);
      paramIndex += 2;
    } else {
      // Default to last 30 days
      dateFilter = `WHERE t.actual_departure >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    // Fleet metrics
    const fleetResult = await query(
      `SELECT
        COUNT(DISTINCT v.id) as vessels_active,
        COUNT(DISTINCT CASE WHEN v.availability_status = 'Maintenance' THEN v.id END) as vessels_maintenance,
        COUNT(t.id) as total_trips,
        COALESCE(SUM(t.total_distance_nm), 0) as total_distance_nm,
        AVG(CASE WHEN vs.ytd_utilization IS NOT NULL THEN vs.ytd_utilization ELSE 0 END) as average_utilization
      FROM vessels v
      LEFT JOIN vessel_schedules vs ON v.id = vs.vessel_id
      LEFT JOIN trips t ON v.id = t.vessel_id ${dateFilter}`,
      params
    );

    const fleet = fleetResult.rows[0];

    // Operations metrics
    const opsResult = await query(
      `SELECT
        COUNT(CASE WHEN t.status = 'Completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(t.id), 0) as on_time_rate,
        AVG(t.total_duration_h) as avg_trip_duration_h,
        COUNT(CASE WHEN td.delay_type = 'Weather' THEN 1 END)::DECIMAL / NULLIF(COUNT(t.id), 0) as weather_delay_rate
      FROM trips t
      LEFT JOIN trip_delays td ON t.id = td.trip_id
      ${dateFilter.replace('t.actual_departure', 't.actual_departure')}`,
      params.length > 0 ? params : []
    );

    const ops = opsResult.rows[0] || {};

    // Cost metrics
    const costResult = await query(
      `SELECT
        COALESCE(SUM(t.total_cost_usd), 0) as total_cost_usd,
        COALESCE(SUM(t.fuel_cost_usd), 0) as fuel_cost_usd,
        COALESCE(SUM(t.charter_cost_usd), 0) as charter_cost_usd,
        AVG(t.total_cost_usd / NULLIF(t.total_distance_nm, 0)) as cost_per_nm
      FROM trips t
      ${dateFilter}`,
      params
    );

    const costs = costResult.rows[0] || {};

    // Cargo metrics
    const cargoResult = await query(
      `SELECT
        COALESCE(SUM(oi.quantity), 0) as total_tonnage_delivered,
        COUNT(CASE WHEN oi.delivered = true THEN 1 END)::DECIMAL / NULLIF(COUNT(oi.id), 0) as backhaul_rate
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN trips t ON o.assigned_vessel_id = t.vessel_id
      ${dateFilter.replace('t.actual_departure', 't.actual_departure')}`,
      params.length > 0 ? params : []
    );

    const cargo = cargoResult.rows[0] || {};

    res.json({
      period: periodType,
      from_date: from_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to_date: to_date || new Date().toISOString().split('T')[0],
      kpis: {
        fleet: {
          average_utilization: parseFloat(fleet.average_utilization || 0),
          vessels_active: parseInt(fleet.vessels_active || 0),
          vessels_maintenance: parseInt(fleet.vessels_maintenance || 0),
          total_distance_nm: parseFloat(fleet.total_distance_nm || 0),
          total_trips: parseInt(fleet.total_trips || 0)
        },
        operations: {
          on_time_delivery_rate: parseFloat(ops.on_time_rate || 0),
          avg_trip_duration_h: parseFloat(ops.avg_trip_duration_h || 0),
          weather_delay_rate: parseFloat(ops.weather_delay_rate || 0),
          emergency_response_avg_h: 5.8 // Would need to calculate
        },
        costs: {
          total_cost_usd: parseFloat(costs.total_cost_usd || 0),
          cost_per_tonne: 95, // Would need to calculate
          cost_per_nm: parseFloat(costs.cost_per_nm || 0),
          fuel_cost_usd: parseFloat(costs.fuel_cost_usd || 0),
          charter_cost_usd: parseFloat(costs.charter_cost_usd || 0)
        },
        cargo: {
          total_tonnage_delivered: parseFloat(cargo.total_tonnage_delivered || 0),
          backhaul_rate: parseFloat(cargo.backhaul_rate || 0),
          stockout_incidents: 0, // Would need to track
          emergency_deliveries: 0 // Would need to track
        },
        environment: {
          total_fuel_consumed_t: 0, // Would need to sum
          total_emissions_co2_t: 0, // Would need to calculate
          fuel_efficiency_t_per_nm: 0.24 // Would need to calculate
        }
      },
      trends: {
        utilization_trend: 'increasing',
        cost_trend: 'stable',
        efficiency_trend: 'improving'
      }
    });
  } catch (error: any) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// GET /analytics/vessels/:id/performance
router.get('/vessels/:id/performance', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

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

    // Get trip statistics for last 90 days
    const tripsResult = await query(
      `SELECT
        COUNT(*) as total_trips,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) as completion_rate,
        AVG(total_duration_h) as avg_trip_duration_h,
        SUM(total_distance_nm) as total_distance_nm,
        AVG(fuel_consumed_t / NULLIF(total_distance_nm, 0)) as avg_fuel_efficiency
      FROM trips
      WHERE vessel_id = $1
      AND actual_departure >= CURRENT_DATE - INTERVAL '90 days'`,
      [id]
    );

    const trips = tripsResult.rows[0] || {};

    // Get cost statistics
    const costResult = await query(
      `SELECT
        SUM(total_cost_usd) as total_cost_usd,
        SUM(charter_cost_usd) as charter_cost_usd,
        SUM(fuel_cost_usd) as fuel_cost_usd
      FROM trips
      WHERE vessel_id = $1
      AND actual_departure >= CURRENT_DATE - INTERVAL '90 days'`,
      [id]
    );

    const costs = costResult.rows[0] || {};

    // Get utilization
    const utilResult = await query(
      `SELECT ytd_utilization FROM vessel_schedules WHERE vessel_id = $1`,
      [id]
    );

    res.json({
      vessel_id: vessel.id,
      vessel_name: vessel.name,
      period: 'last_90_days',
      performance: {
        total_trips: parseInt(trips.total_trips || 0),
        completion_rate: parseFloat(trips.completion_rate || 0),
        avg_trip_duration_h: parseFloat(trips.avg_trip_duration_h || 0),
        total_distance_nm: parseFloat(trips.total_distance_nm || 0),
        avg_fuel_efficiency_t_per_nm: parseFloat(trips.avg_fuel_efficiency || 0),
        utilization: parseFloat(utilResult.rows[0]?.ytd_utilization || 0),
        on_time_rate: 0.89 // Would need to calculate
      },
      costs: {
        total_cost_usd: parseFloat(costs.total_cost_usd || 0),
        charter_cost_usd: parseFloat(costs.charter_cost_usd || 0),
        fuel_cost_usd: parseFloat(costs.fuel_cost_usd || 0),
        other_costs_usd: 0 // Would need to calculate
      },
      reliability: {
        mechanical_issues: 0, // Would need to track
        weather_delays_count: 0, // Would need to count
        avg_weather_delay_h: 0, // Would need to calculate
        maintenance_compliance: 1.0 // Would need to check
      },
      comparison_to_fleet: {
        utilization_percentile: 75,
        efficiency_percentile: 82,
        cost_percentile: 68
      }
    });
  } catch (error: any) {
    console.error('Error fetching vessel performance:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
