import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Database, Ship, Anchor, Package, MapPin, Calendar, DollarSign } from 'lucide-react';

const DataStructureViewer = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (path) => {
    setExpandedSections(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const dataStructure = {
    Network: {
      icon: <MapPin className="w-5 h-5" />,
      color: "bg-blue-500",
      entities: {
        SupplyBase: {
          fields: [
            "id: string",
            "name: string",
            "location: {lat: float, lon: float}",
            "port_code: string",
            "max_draught: float (meters)",
            "max_vessel_length: float (meters)",
            "operating_hours: string",
            "berths: integer",
            "loading_capacities: {liquid: float, bulk: float, deck: float}",
            "storage_capacity: Map<cargo_type, float>",
            "costs: {port_dues: float, pilotage: float, agency: float}"
          ]
        },
        Installation: {
          fields: [
            "id: string",
            "name: string",
            "type: enum {FPSO, FixedPlatform, WellheadPlatform}",
            "location: {lat: float, lon: float}",
            "water_depth: float (meters)",
            "distance_from_base: float (NM)",
            "production_capacity: float (bpd)",
            "storage_capacity: Map<cargo_type, {max: float, current: float, safety_stock: float}>",
            "crane_specs: {count: int, capacity: float}",
            "deck_area: float (m²)",
            "max_simultaneous_vessels: integer",
            "weather_limits: {max_wind: float, max_wave: float, max_current: float}"
          ]
        },
        DistanceMatrix: {
          fields: [
            "from_id: string",
            "to_id: string",
            "distance_nm: float",
            "distance_km: float",
            "time_at_12kts: float (hours)",
            "time_at_14kts: float (hours)",
            "weather_factor: {good: float, moderate: float, rough: float}"
          ]
        }
      }
    },
    Fleet: {
      icon: <Ship className="w-5 h-5" />,
      color: "bg-green-500",
      entities: {
        Vessel: {
          fields: [
            "id: string",
            "name: string",
            "class: enum {StandardPSV, LargePSV, CSV, WellStimulation}",
            "dimensions: {loa: float, beam: float, draught: float}",
            "capacities: {deck_cargo: float, total_deadweight: float}",
            "compartments: Array<Compartment>",
            "speed: {service: float, operational: float, max: float}",
            "dp_class: enum {DP1, DP2, DP3, None}",
            "fuel_consumption: {transit: float, dp: float, port: float}",
            "charter_rate: float ($/day)",
            "availability: enum {Available, InUse, Maintenance}",
            "current_location: {installation_id: string, coordinates: {lat, lon}}",
            "crew_size: integer",
            "accommodation: integer"
          ]
        },
        Compartment: {
          fields: [
            "id: string",
            "vessel_id: string",
            "type: enum {LiquidTank, DryBulk, DeckSpace}",
            "capacity: float (m³ or tonnes)",
            "compatible_cargoes: Array<string>",
            "current_cargo: string | null",
            "fill_level: float (0-1)",
            "cleaning_requirements: Map<cargo_type, float (hours)>"
          ]
        },
        VesselSchedule: {
          fields: [
            "vessel_id: string",
            "status: enum {Loading, Transit, Offshore, Returning, Idle}",
            "current_trip_id: string | null",
            "next_available: datetime",
            "maintenance_due: datetime",
            "utilization_target: float (0-1)"
          ]
        }
      }
    },
    Cargo: {
      icon: <Package className="w-5 h-5" />,
      color: "bg-orange-500",
      entities: {
        CargoType: {
          fields: [
            "id: string",
            "name: string",
            "category: enum {Liquid, DryBulk, DeckCargo}",
            "density: float (kg/m³)",
            "unit: enum {m3, tonnes}",
            "segregation_required: boolean",
            "incompatible_with: Array<string>",
            "transfer_rate: {loading: float, discharging: float} (m³/h or t/h)",
            "weather_sensitive: boolean",
            "handling_cost: float ($/unit)",
            "storage_requirements: {temperature: float, special: string}"
          ]
        },
        Demand: {
          fields: [
            "id: string",
            "installation_id: string",
            "cargo_type_id: string",
            "quantity: float",
            "time_window: {earliest: datetime, latest: datetime}",
            "priority: enum {Critical, High, Normal, Low}",
            "recurrence: {frequency: string, pattern: string} | null",
            "scenario: enum {Normal, Drilling, Workover, Emergency}",
            "penalty_late: float ($/day)",
            "forecast_accuracy: float (0-1)"
          ]
        },
        ConsumptionProfile: {
          fields: [
            "installation_id: string",
            "cargo_type_id: string",
            "daily_consumption: float",
            "weekly_pattern: Array<float> (7 days)",
            "monthly_factor: Array<float> (12 months)",
            "variability: {mean: float, std_dev: float, cv: float}",
            "scenario_factors: {normal: 1.0, drilling: float, workover: float, low: float}"
          ]
        },
        Order: {
          fields: [
            "id: string",
            "demand_id: string",
            "status: enum {Planned, Confirmed, Loading, InTransit, Delivered, Cancelled}",
            "cargo_items: Array<{cargo_type_id: string, quantity: float}>",
            "assigned_vessel_id: string | null",
            "scheduled_departure: datetime",
            "actual_departure: datetime | null",
            "estimated_arrival: datetime",
            "actual_arrival: datetime | null",
            "backhaul_cargo: Array<{type: string, quantity: float}>"
          ]
        }
      }
    },
    Operations: {
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-purple-500",
      entities: {
        Trip: {
          fields: [
            "id: string",
            "vessel_id: string",
            "route: Array<{installation_id: string, sequence: int}>",
            "cargo_manifest: Array<{installation_id: string, cargo_items: Array}>",
            "planned_schedule: Array<{location: string, arrival: datetime, departure: datetime}>",
            "actual_schedule: Array<{location: string, arrival: datetime, departure: datetime}>",
            "total_distance: float (NM)",
            "total_duration: float (hours)",
            "fuel_consumed: float (tonnes)",
            "total_cost: float ($)",
            "delays: Array<{reason: string, duration: float, location: string}>",
            "status: enum {Planned, InProgress, Completed, Cancelled}"
          ]
        },
        OperationWindow: {
          fields: [
            "operation_type: enum {PortLoading, Transit, Approach, LiquidDischarge, BulkDischarge, CraneOps}",
            "weather_limits: {max_wind: float, max_wave: float, max_current: float, min_visibility: float}",
            "time_estimate: {min: float, expected: float, max: float} (hours)",
            "efficiency_factor: {day: float, night: float}",
            "equipment_required: Array<string>"
          ]
        },
        TimeWindow: {
          fields: [
            "installation_id: string",
            "date: date",
            "available_slots: Array<{start: time, end: time}>",
            "conflicts: Array<{type: string, start: time, end: time}>",
            "preferred_periods: Array<{start: time, end: time, preference: float}>",
            "restrictions: Array<string>"
          ]
        }
      }
    },
    Environment: {
      icon: <Anchor className="w-5 h-5" />,
      color: "bg-cyan-500",
      entities: {
        WeatherForecast: {
          fields: [
            "location_id: string",
            "timestamp: datetime",
            "forecast_horizon: integer (hours)",
            "wave_height: {min: float, mean: float, max: float} (m)",
            "wind_speed: {min: float, mean: float, max: float} (m/s)",
            "wind_direction: string",
            "current_speed: float (knots)",
            "visibility: float (NM)",
            "forecast_accuracy: float (0-1)",
            "weather_state: enum {Good, Moderate, Rough, Severe}"
          ]
        },
        SeasonalPattern: {
          fields: [
            "month: integer (1-12)",
            "location: string",
            "wave_distribution: {hs_lt_2m: float, hs_2_3m: float, hs_3_4m: float, hs_gt_4m: float}",
            "wind_avg: float (m/s)",
            "workability: float (% of time)",
            "delay_probability: float"
          ]
        },
        WeatherWindow: {
          fields: [
            "location_id: string",
            "operation_type: string",
            "start_time: datetime",
            "end_time: datetime",
            "duration: float (hours)",
            "confidence: float (0-1)",
            "conditions: {wave: float, wind: float, current: float, visibility: float}"
          ]
        }
      }
    },
    Costs: {
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-red-500",
      entities: {
        CostStructure: {
          fields: [
            "vessel_id: string",
            "charter_rate_daily: float ($)",
            "fuel_price_per_tonne: float ($)",
            "port_costs: {dues: float, pilotage: float, agency: float, documentation: float}",
            "offshore_costs: {crane_hourly: float, personnel: float}",
            "handling_costs: Map<cargo_type, float ($/unit)>"
          ]
        },
        TripCost: {
          fields: [
            "trip_id: string",
            "charter_cost: float ($)",
            "fuel_cost: float ($)",
            "port_costs: float ($)",
            "offshore_costs: float ($)",
            "handling_costs: float ($)",
            "total_cost: float ($)",
            "cost_per_tonne: float ($/t)",
            "cost_per_nm: float ($/NM)"
          ]
        },
        PenaltyCost: {
          fields: [
            "order_id: string",
            "penalty_type: enum {LateDelivery, IncompleteDelivery, Stockout, ProductionLoss}",
            "amount: float ($)",
            "duration: float (days or hours)",
            "reason: string"
          ]
        }
      }
    },
    Optimization: {
      icon: <Database className="w-5 h-5" />,
      color: "bg-indigo-500",
      entities: {
        OptimizationRun: {
          fields: [
            "id: string",
            "timestamp: datetime",
            "planning_horizon: {start: datetime, end: datetime}",
            "objective_function: string",
            "constraints: Array<string>",
            "solver: string",
            "solution_time: float (seconds)",
            "solution_quality: {objective_value: float, gap: float, status: string}",
            "scenarios: Array<string>"
          ]
        },
        Solution: {
          fields: [
            "optimization_run_id: string",
            "trips: Array<Trip>",
            "vessel_assignments: Map<vessel_id, Array<trip_id>>",
            "kpis: KPIs",
            "unmet_demands: Array<{demand_id: string, reason: string}>",
            "total_cost: float",
            "total_distance: float",
            "fleet_utilization: float"
          ]
        },
        KPIs: {
          fields: [
            "vessel_utilization: float (%)",
            "on_time_delivery_rate: float (%)",
            "avg_trip_duration: float (hours)",
            "cost_per_tonne: float ($/t)",
            "fuel_efficiency: float (t/NM)",
            "emergency_response_time: float (hours)",
            "weather_delay_rate: float (%)",
            "backhaul_rate: float (%)",
            "total_emissions: float (tonnes CO2)"
          ]
        }
      }
    }
  };

  const renderEntity = (entityName, entityData, path) => {
    const isExpanded = expandedSections[path];
    
    return (
      <div key={path} className="mb-2 ml-4 border-l-2 border-gray-300 pl-4">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
          onClick={() => toggleSection(path)}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-semibold text-blue-700">{entityName}</span>
        </div>
        {isExpanded && (
          <div className="ml-6 mt-2 bg-gray-50 p-3 rounded border border-gray-200">
            {entityData.fields.map((field, idx) => (
              <div key={idx} className="font-mono text-sm text-gray-700 py-1">
                {field}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (sectionName, sectionData) => {
    const path = sectionName;
    const isExpanded = expandedSections[path];
    
    return (
      <div key={sectionName} className="mb-4 border rounded-lg overflow-hidden shadow-sm">
        <div 
          className={`${sectionData.color} text-white p-4 cursor-pointer hover:opacity-90 transition-opacity`}
          onClick={() => toggleSection(path)}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {sectionData.icon}
            <h2 className="text-xl font-bold">{sectionName}</h2>
            <span className="ml-auto text-sm opacity-80">
              {Object.keys(sectionData.entities).length} entities
            </span>
          </div>
        </div>
        {isExpanded && (
          <div className="bg-white p-4">
            {Object.entries(sectionData.entities).map(([entityName, entityData]) =>
              renderEntity(entityName, entityData, `${path}.${entityName}`)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          PRIO Offshore Logistics Data Structure
        </h1>
        <p className="text-gray-600 mb-4">
          Comprehensive data model for offshore supply vessel routing and inventory optimization.
          Click on sections and entities to expand and view field definitions.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-700">7</div>
            <div className="text-sm text-gray-600">Main Domains</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-700">30+</div>
            <div className="text-sm text-gray-600">Data Entities</div>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <div className="text-2xl font-bold text-orange-700">200+</div>
            <div className="text-sm text-gray-600">Data Fields</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-700">IRP</div>
            <div className="text-sm text-gray-600">Model Type</div>
          </div>
        </div>
      </div>

      {Object.entries(dataStructure).map(([sectionName, sectionData]) =>
        renderSection(sectionName, sectionData)
      )}

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-900 mb-2">Implementation Notes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use relational database (PostgreSQL) or document store (MongoDB) depending on query patterns</li>
          <li>• Implement time-series storage for weather and operational data</li>
          <li>• Consider graph database for network/routing optimization</li>
          <li>• Real-time data integration via APIs for vessel tracking, weather, and inventory</li>
          <li>• Historical data retention: minimum 12 months for training ML models</li>
        </ul>
      </div>
    </div>
  );
};

export default DataStructureViewer;