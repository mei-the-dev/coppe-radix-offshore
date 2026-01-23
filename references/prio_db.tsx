import React, { useState } from 'react';
import { Database, Anchor, Ship, Package, MapPin, Cloud, DollarSign, TrendingUp, Layers } from 'lucide-react';

const DbDiagram = () => {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [hoveredTable, setHoveredTable] = useState(null);

  const domains = [
    {
      id: 'network',
      name: 'Network Domain',
      icon: MapPin,
      color: 'from-blue-500 to-blue-600',
      tables: [
        { name: 'supply_bases', fields: ['id', 'name', 'location', 'port_code', 'max_draught_m', 'num_berths'], key: true },
        { name: 'installations', fields: ['id', 'name', 'type', 'location', 'water_depth_m', 'max_simultaneous_vessels'], key: true },
        { name: 'installation_storage', fields: ['installation_id', 'cargo_type_id', 'max_capacity', 'current_level', 'safety_stock'], key: false },
        { name: 'distance_matrix', fields: ['from_location_id', 'to_location_id', 'distance_nm', 'time_12kts_h'], key: false }
      ]
    },
    {
      id: 'fleet',
      name: 'Fleet Domain',
      icon: Ship,
      color: 'from-cyan-500 to-cyan-600',
      tables: [
        { name: 'vessels', fields: ['id', 'name', 'class', 'deadweight_t', 'service_speed_kts', 'dp_class'], key: true },
        { name: 'vessel_compartments', fields: ['id', 'vessel_id', 'compartment_type', 'capacity', 'fill_level'], key: false },
        { name: 'compartment_compatibility', fields: ['compartment_id', 'cargo_type_id', 'compatible'], key: false },
        { name: 'vessel_schedules', fields: ['vessel_id', 'status', 'next_available', 'utilization_target'], key: false }
      ]
    },
    {
      id: 'cargo',
      name: 'Cargo Domain',
      icon: Package,
      color: 'from-amber-500 to-amber-600',
      tables: [
        { name: 'cargo_types', fields: ['id', 'name', 'category', 'density_kg_m3', 'loading_rate_m3h'], key: true },
        { name: 'cargo_incompatibility', fields: ['cargo_type_id_1', 'cargo_type_id_2', 'cleaning_time_h'], key: false },
        { name: 'consumption_profiles', fields: ['id', 'installation_id', 'cargo_type_id', 'daily_consumption'], key: false },
        { name: 'demands', fields: ['id', 'installation_id', 'cargo_type_id', 'quantity', 'priority', 'status'], key: true },
        { name: 'orders', fields: ['id', 'demand_id', 'assigned_vessel_id', 'status', 'scheduled_departure'], key: true },
        { name: 'order_items', fields: ['id', 'order_id', 'cargo_type_id', 'quantity', 'loaded', 'delivered'], key: false }
      ]
    },
    {
      id: 'operations',
      name: 'Operations Domain',
      icon: Anchor,
      color: 'from-emerald-500 to-emerald-600',
      tables: [
        { name: 'trips', fields: ['id', 'vessel_id', 'status', 'total_distance_nm', 'fuel_consumed_t', 'total_cost_usd'], key: true },
        { name: 'trip_waypoints', fields: ['id', 'trip_id', 'location_id', 'sequence', 'operation_type'], key: false },
        { name: 'trip_cargo_manifest', fields: ['id', 'trip_id', 'cargo_type_id', 'quantity', 'action'], key: false },
        { name: 'operation_windows', fields: ['id', 'operation_type', 'max_wind_ms', 'max_wave_m'], key: false },
        { name: 'time_windows', fields: ['id', 'installation_id', 'date', 'available'], key: false }
      ]
    },
    {
      id: 'environment',
      name: 'Environment Domain',
      icon: Cloud,
      color: 'from-violet-500 to-violet-600',
      tables: [
        { name: 'weather_forecasts', fields: ['location_id', 'timestamp', 'wave_height_mean_m', 'wind_speed_mean_ms', 'weather_state'], key: false },
        { name: 'seasonal_patterns', fields: ['id', 'location', 'month', 'workability', 'delay_probability'], key: false },
        { name: 'weather_windows', fields: ['id', 'location_id', 'start_time', 'end_time', 'suitable'], key: false }
      ]
    },
    {
      id: 'costs',
      name: 'Costs Domain',
      icon: DollarSign,
      color: 'from-rose-500 to-rose-600',
      tables: [
        { name: 'cost_structures', fields: ['id', 'vessel_id', 'charter_rate_daily_usd', 'fuel_price_per_tonne_usd'], key: false },
        { name: 'handling_costs', fields: ['cost_structure_id', 'cargo_type_id', 'cost_per_unit'], key: false },
        { name: 'trip_costs', fields: ['trip_id', 'charter_cost_usd', 'fuel_cost_usd', 'total_cost_usd'], key: false },
        { name: 'penalty_costs', fields: ['id', 'order_id', 'penalty_type', 'amount_usd'], key: false }
      ]
    },
    {
      id: 'optimization',
      name: 'Optimization Domain',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      tables: [
        { name: 'optimization_runs', fields: ['id', 'planning_horizon_start', 'solver', 'objective_value', 'status'], key: true },
        { name: 'solutions', fields: ['id', 'optimization_run_id', 'total_cost_usd', 'fleet_utilization', 'feasible'], key: false },
        { name: 'solution_trips', fields: ['solution_id', 'trip_id'], key: false },
        { name: 'unmet_demands', fields: ['id', 'solution_id', 'demand_id', 'shortfall_quantity'], key: false },
        { name: 'kpis', fields: ['solution_id', 'vessel_utilization', 'on_time_delivery_rate', 'cost_per_tonne'], key: false }
      ]
    }
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Database className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">PRIO Offshore Logistics</h1>
          </div>
          <p className="text-slate-400 text-lg">PostgreSQL Database Schema with PostGIS & TimescaleDB</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-500">7 Domains • 50+ Tables • Time-Series & Geographic Data</span>
          </div>
        </div>

        {/* Domain Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {domains.map((domain) => {
            const Icon = domain.icon;
            const isSelected = selectedDomain === domain.id;

            return (
              <div
                key={domain.id}
                onClick={() => setSelectedDomain(selectedDomain === domain.id ? null : domain.id)}
                className={`
                  relative cursor-pointer rounded-xl p-5 transition-all duration-300 transform
                  ${isSelected
                    ? 'scale-105 shadow-2xl ring-2 ring-white/20'
                    : 'hover:scale-102 hover:shadow-xl'
                  }
                  bg-gradient-to-br ${domain.color}
                `}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Icon className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-bold text-white leading-tight">{domain.name}</h3>
                </div>
                <div className="text-sm text-white/80 mb-3">
                  {domain.tables.length} tables
                </div>
                {isSelected && (
                  <div className="space-y-2 animate-fadeIn">
                    {domain.tables.map((table, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredTable(`${domain.id}-${table.name}`)}
                        onMouseLeave={() => setHoveredTable(null)}
                        className={`
                          bg-white/10 backdrop-blur-sm rounded-lg p-3 transition-all duration-200
                          ${hoveredTable === `${domain.id}-${table.name}` ? 'bg-white/20 shadow-lg' : ''}
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {table.key && (
                            <div className="w-2 h-2 bg-yellow-300 rounded-full flex-shrink-0" title="Primary table" />
                          )}
                          <span className="font-mono text-sm font-semibold text-white">
                            {table.name}
                          </span>
                        </div>
                        <div className="text-xs text-white/70 font-mono space-y-0.5 ml-4">
                          {table.fields.slice(0, hoveredTable === `${domain.id}-${table.name}` ? undefined : 3).map((field, fidx) => (
                            <div key={fidx}>• {field}</div>
                          ))}
                          {!hoveredTable?.includes(table.name) && table.fields.length > 3 && (
                            <div className="text-white/50 italic">+{table.fields.length - 3} more...</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key Relationships */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Key Relationships & Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-blue-400 font-semibold mb-2">Geographic Data</div>
              <div className="text-sm text-slate-300">PostGIS extension for vessel locations, supply bases, and installations with spatial queries</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-cyan-400 font-semibold mb-2">Time-Series Weather</div>
              <div className="text-sm text-slate-300">TimescaleDB hypertables for efficient weather forecast storage and retrieval</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-amber-400 font-semibold mb-2">Cargo Tracking</div>
              <div className="text-sm text-slate-300">Complete order lifecycle from demand → order → trip → delivery with compartment allocation</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-emerald-400 font-semibold mb-2">Fleet Operations</div>
              <div className="text-sm text-slate-300">Vessel schedules, trip waypoints, and real-time status tracking with fuel consumption</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-rose-400 font-semibold mb-2">Cost Analytics</div>
              <div className="text-sm text-slate-300">Comprehensive cost tracking: charter, fuel, port, handling, and penalty costs</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-purple-400 font-semibold mb-2">Optimization Engine</div>
              <div className="text-sm text-slate-300">Store optimization runs, solutions, KPIs, and scenario comparisons</div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">50+</div>
            <div className="text-sm text-slate-400">Tables</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-cyan-400">7</div>
            <div className="text-sm text-slate-400">Domains</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-400">2</div>
            <div className="text-sm text-slate-400">Materialized Views</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-400">5</div>
            <div className="text-sm text-slate-400">Custom Triggers</div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Click on any domain to explore its tables • Hover over tables to see all fields
        </div>
      </div>
    </div>
  );
};

export default DbDiagram;
