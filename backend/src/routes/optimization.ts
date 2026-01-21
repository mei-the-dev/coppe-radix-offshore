import { Router, Request, Response } from 'express';
import { query } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Authentication disabled for now
// router.use(authenticateToken);

// POST /optimization/runs
router.post('/runs', async (req: AuthRequest, res: Response) => {
  try {
    const {
      planning_horizon,
      objective,
      constraints,
      parameters,
      scenarios,
      include_vessels,
      fixed_trips
    } = req.body;

    if (!planning_horizon || !planning_horizon.start || !planning_horizon.end) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'planning_horizon with start and end is required'
      });
    }

    const runId = `opt_run_${Date.now()}`;

    // Create optimization run record
    await query(
      `INSERT INTO optimization_runs (
        id, planning_horizon_start, planning_horizon_end,
        objective_function, solver, status, parameters
      ) VALUES ($1, $2, $3, $4, $5, 'Running', $6)`,
      [
        runId,
        planning_horizon.start,
        planning_horizon.end,
        objective || 'minimize_cost',
        parameters?.solver || 'gurobi',
        JSON.stringify(parameters || {})
      ]
    );

    // Store scenarios
    if (scenarios && Array.isArray(scenarios)) {
      for (const scenario of scenarios) {
        await query(
          `INSERT INTO optimization_scenarios (run_id, scenario_name, scenario_type, parameters)
          VALUES ($1, $2, $3, $4)`,
          [runId, scenario.name, 'custom', JSON.stringify(scenario)]
        );
      }
    }

    // TODO: Trigger actual optimization job
    // For now, return immediately with "Running" status

    res.status(202).json({
      run_id: runId,
      status: 'Running',
      created_at: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      progress_url: `/optimization/runs/${runId}/progress`
    });
  } catch (error: any) {
    console.error('Error creating optimization run:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

// GET /optimization/runs/:id
router.get('/runs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const runResult = await query(
      `SELECT * FROM optimization_runs WHERE id = $1`,
      [id]
    );

    if (runResult.rows.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: `Optimization run with id '${id}' not found`
      });
    }

    const run = runResult.rows[0];

    // Get solution if exists
    const solutionResult = await query(
      `SELECT * FROM solutions WHERE optimization_run_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    if (solutionResult.rows.length === 0) {
      return res.json({
        run_id: id,
        status: run.status,
        execution_time_s: parseFloat(run.solution_time_s || 0),
        timestamp: new Date(run.timestamp).toISOString()
      });
    }

    const solution = solutionResult.rows[0];

    // Get KPIs
    const kpiResult = await query(
      `SELECT * FROM kpis WHERE solution_id = $1`,
      [solution.id]
    );

    // Get trips
    const tripsResult = await query(
      `SELECT t.* FROM trips t
      JOIN solution_trips st ON t.id = st.trip_id
      WHERE st.solution_id = $1`,
      [solution.id]
    );

    // Get unmet demands
    const unmetResult = await query(
      `SELECT
        ud.demand_id,
        d.installation_id,
        i.name as installation_name,
        d.cargo_type_id,
        ct.name as cargo_name,
        ud.reason,
        ud.shortfall_quantity
      FROM unmet_demands ud
      JOIN demands d ON ud.demand_id = d.id
      JOIN installations i ON d.installation_id = i.id
      JOIN cargo_types ct ON d.cargo_type_id = ct.id
      WHERE ud.solution_id = $1`,
      [solution.id]
    );

    const kpis = kpiResult.rows[0] || {};

    res.json({
      run_id: id,
      status: run.status,
      execution_time_s: parseFloat(run.solution_time_s || 0),
      timestamp: new Date(run.timestamp).toISOString(),
      solution: {
        solution_id: solution.id,
        objective_value: parseFloat(solution.total_cost_usd || 0),
        gap: parseFloat(run.gap || 0),
        feasible: solution.feasible,
        summary: {
          total_cost_usd: parseFloat(solution.total_cost_usd || 0),
          total_distance_nm: parseFloat(solution.total_distance_nm || 0),
          num_trips: solution.num_trips || 0,
          fleet_utilization: parseFloat(solution.fleet_utilization || 0),
          demands_fulfilled: (solution.num_trips || 0) - (solution.num_unmet_demands || 0),
          demands_unmet: solution.num_unmet_demands || 0
        },
        trips: tripsResult.rows.map(trip => ({
          trip_id: trip.id,
          vessel_id: trip.vessel_id,
          departure: trip.planned_departure ? new Date(trip.planned_departure).toISOString() : null,
          cost: parseFloat(trip.total_cost_usd || 0)
        })),
        kpis: {
          vessel_utilization: parseFloat(kpis.vessel_utilization || 0),
          on_time_delivery_rate: parseFloat(kpis.on_time_delivery_rate || 0),
          avg_trip_duration_h: parseFloat(kpis.avg_trip_duration_h || 0),
          cost_per_tonne: parseFloat(kpis.cost_per_tonne || 0),
          fuel_efficiency_t_per_nm: parseFloat(kpis.fuel_efficiency_t_per_nm || 0),
          weather_delay_rate: parseFloat(kpis.weather_delay_rate || 0),
          backhaul_rate: parseFloat(kpis.backhaul_rate || 0)
        },
        unmet_demands: unmetResult.rows.map(d => ({
          demand_id: d.demand_id,
          installation: d.installation_name,
          cargo: d.cargo_name,
          reason: d.reason,
          shortfall: parseFloat(d.shortfall_quantity || 0)
        }))
      }
    });
  } catch (error: any) {
    console.error('Error fetching optimization run:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
