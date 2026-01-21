# PRIO Offshore Logistics API Specification
**Version:** 1.0  
**Base URL:** `https://api.prio-logistics.com/v1`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Network Management](#network-management)
3. [Fleet Management](#fleet-management)
4. [Cargo & Inventory](#cargo--inventory)
5. [Operations & Trips](#operations--trips)
6. [Weather & Environment](#weather--environment)
7. [Optimization](#optimization)
8. [Analytics & Reporting](#analytics--reporting)

---

## Authentication

### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "operator@prio.com",
  "password": "SecurePass123!",
  "scope": ["read", "write", "optimize"]
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_string",
  "user": {
    "id": "user_123",
    "name": "John Operator",
    "role": "logistics_coordinator"
  }
}
```

---

## Network Management

### Installations

#### GET /installations
Get list of all offshore installations.

**Query Parameters:**
- `type` (optional): Filter by type (FPSO, FixedPlatform, WellheadPlatform)
- `active` (optional): true/false
- `include_storage` (optional): Include storage capacity data

**Response:**
```json
{
  "data": [
    {
      "id": "fpso_bravo",
      "name": "FPSO Bravo",
      "type": "FPSO",
      "location": {
        "latitude": -22.5,
        "longitude": -40.2,
        "water_depth_m": 121
      },
      "distance_from_base_nm": 70,
      "production_capacity_bpd": 15000,
      "operational_limits": {
        "max_wind_ms": 20,
        "max_wave_m": 3.0,
        "max_current_kts": 2.0,
        "max_simultaneous_vessels": 2
      },
      "storage": [
        {
          "cargo_type_id": "diesel",
          "max_capacity": 800,
          "current_level": 450,
          "safety_stock": 200,
          "unit": "m3",
          "status": "Normal"
        }
      ]
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "per_page": 10
  }
}
```

#### GET /installations/{id}
Get detailed information about specific installation.

**Response:**
```json
{
  "id": "fpso_valente",
  "name": "FPSO Valente (Frade)",
  "type": "FPSO",
  "location": {
    "latitude": -22.3845,
    "longitude": -40.1234,
    "water_depth_m": 1200
  },
  "distance_from_base_nm": 67,
  "production_capacity_bpd": 100000,
  "current_production_bpd": 38300,
  "storage_capacity_bbl": 1600000,
  "crane_specs": {
    "count": 2,
    "capacity_t": 50
  },
  "operational_status": "Active",
  "next_maintenance": "2026-03-15",
  "storage_levels": [...],
  "consumption_profile": [...],
  "upcoming_demands": [...]
}
```

#### PUT /installations/{id}/inventory
Update inventory levels for an installation.

**Request:**
```json
{
  "cargo_type_id": "diesel",
  "new_level": 520,
  "unit": "m3",
  "reason": "Manual adjustment after ullage",
  "recorded_by": "operator_456"
}
```

**Response:**
```json
{
  "success": true,
  "installation_id": "fpso_valente",
  "cargo_type_id": "diesel",
  "previous_level": 450,
  "new_level": 520,
  "safety_stock": 200,
  "reorder_point": 300,
  "status": "Normal",
  "timestamp": "2026-01-21T14:30:00Z"
}
```

### Distance Matrix

#### GET /network/distances
Get distance matrix between locations.

**Query Parameters:**
- `from` (optional): Filter by origin location
- `to` (optional): Filter by destination location

**Response:**
```json
{
  "data": [
    {
      "from_location_id": "macae_base",
      "from_name": "Port of Macaé",
      "to_location_id": "fpso_peregrino",
      "to_name": "FPSO Peregrino",
      "distance_nm": 46,
      "distance_km": 85,
      "time_12kts_h": 3.8,
      "time_14kts_h": 3.3,
      "weather_factors": {
        "good": 1.0,
        "moderate": 1.15,
        "rough": 1.3
      }
    }
  ]
}
```

---

## Fleet Management

### Vessels

#### GET /fleet/vessels
Get list of all vessels.

**Query Parameters:**
- `class` (optional): Filter by vessel class
- `status` (optional): Filter by availability status
- `available_from` (optional): ISO 8601 datetime

**Response:**
```json
{
  "data": [
    {
      "id": "psv_001",
      "name": "Normand Carioca",
      "class": "LargePSV",
      "specifications": {
        "loa_m": 85,
        "beam_m": 18,
        "draught_m": 6.5,
        "deck_cargo_capacity_t": 3200,
        "total_deadweight_t": 5500,
        "operational_speed_kts": 12.5
      },
      "dp_class": "DP2",
      "fuel_consumption": {
        "transit_td": 20,
        "dp_td": 5,
        "port_td": 3
      },
      "charter_rate_daily_usd": 20000,
      "availability": {
        "status": "Available",
        "next_available": "2026-01-22T06:00:00Z",
        "current_location": {
          "type": "SupplyBase",
          "id": "macae_base",
          "name": "Port of Macaé"
        }
      },
      "compartments": [
        {
          "id": "comp_001",
          "type": "LiquidTank",
          "capacity": 500,
          "unit": "m3",
          "current_cargo": "diesel",
          "fill_level": 0.0
        }
      ],
      "crew_size": 13,
      "next_maintenance_due": "2026-04-15"
    }
  ],
  "meta": {
    "total": 8,
    "available": 5,
    "in_use": 2,
    "maintenance": 1
  }
}
```

#### GET /fleet/vessels/{id}/schedule
Get vessel's current and upcoming schedule.

**Response:**
```json
{
  "vessel_id": "psv_001",
  "vessel_name": "Normand Carioca",
  "current_status": "InTransit",
  "current_trip": {
    "trip_id": "trip_12345",
    "route": ["macae_base", "fpso_valente", "macae_base"],
    "current_waypoint": "fpso_valente",
    "eta": "2026-01-21T18:00:00Z",
    "progress": 0.65
  },
  "next_available": "2026-01-22T06:00:00Z",
  "scheduled_trips": [
    {
      "trip_id": "trip_12346",
      "departure": "2026-01-22T08:00:00Z",
      "destinations": ["fpso_forte", "fpso_bravo"],
      "estimated_return": "2026-01-23T14:00:00Z"
    }
  ],
  "utilization_ytd": 0.78,
  "maintenance": {
    "last_maintenance": "2025-12-10",
    "next_maintenance_due": "2026-04-15",
    "hours_until_maintenance": 1200
  }
}
```

#### POST /fleet/vessels/{id}/availability
Update vessel availability status.

**Request:**
```json
{
  "status": "Maintenance",
  "reason": "Scheduled drydock",
  "unavailable_from": "2026-02-01T00:00:00Z",
  "unavailable_to": "2026-02-10T00:00:00Z",
  "notes": "Annual inspection and hull painting"
}
```

**Response:**
```json
{
  "success": true,
  "vessel_id": "psv_001",
  "previous_status": "Available",
  "new_status": "Maintenance",
  "unavailable_period": {
    "from": "2026-02-01T00:00:00Z",
    "to": "2026-02-10T00:00:00Z",
    "duration_days": 9
  },
  "affected_trips": []
}
```

---

## Cargo & Inventory

### Cargo Types

#### GET /cargo/types
Get list of all cargo types.

**Query Parameters:**
- `category` (optional): Liquid, DryBulk, DeckCargo

**Response:**
```json
{
  "data": [
    {
      "id": "diesel",
      "name": "Marine Diesel Oil",
      "category": "Liquid",
      "density_kg_m3": 850,
      "unit": "m3",
      "segregation_required": true,
      "transfer_rates": {
        "loading_m3h": 150,
        "discharging_m3h": 120
      },
      "weather_sensitive": false,
      "handling_cost_per_unit": 8.5,
      "incompatible_with": ["fresh_water", "methanol", "chemicals"]
    }
  ]
}
```

### Demands

#### GET /demands
Get list of demands with filtering.

**Query Parameters:**
- `installation_id` (optional)
- `status` (optional): Forecast, Planned, Confirmed, InProgress, Fulfilled
- `priority` (optional): Critical, High, Normal, Low
- `from_date` (optional): ISO 8601 datetime
- `to_date` (optional): ISO 8601 datetime

**Response:**
```json
{
  "data": [
    {
      "id": "demand_98765",
      "installation_id": "fpso_valente",
      "installation_name": "FPSO Valente",
      "cargo_type_id": "diesel",
      "cargo_name": "Marine Diesel Oil",
      "quantity": 400,
      "unit": "m3",
      "time_window": {
        "earliest": "2026-01-23T00:00:00Z",
        "latest": "2026-01-25T23:59:59Z"
      },
      "priority": "High",
      "scenario": "Normal",
      "status": "Confirmed",
      "penalty_late_per_day": 5000,
      "current_inventory": 280,
      "safety_stock": 200,
      "days_of_supply": 6.2,
      "forecast_accuracy": 0.95
    }
  ],
  "meta": {
    "total": 45,
    "critical": 3,
    "high": 12,
    "normal": 28,
    "low": 2
  }
}
```

#### POST /demands
Create a new demand.

**Request:**
```json
{
  "installation_id": "fpso_bravo",
  "cargo_type_id": "drilling_mud_obm",
  "quantity": 800,
  "unit": "m3",
  "earliest_delivery": "2026-01-25T00:00:00Z",
  "latest_delivery": "2026-01-27T23:59:59Z",
  "priority": "Critical",
  "scenario": "Drilling",
  "notes": "Wahoo drilling campaign",
  "penalty_late_per_day": 50000
}
```

**Response:**
```json
{
  "id": "demand_98766",
  "status": "Planned",
  "created_at": "2026-01-21T14:45:00Z",
  "estimated_order_date": "2026-01-23T00:00:00Z",
  "recommended_vessel": "psv_002",
  "estimated_cost": 45000
}
```

### Orders

#### GET /orders
Get list of orders.

**Query Parameters:**
- `status` (optional)
- `vessel_id` (optional)
- `from_date` (optional)
- `to_date` (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "order_54321",
      "demand_id": "demand_98765",
      "status": "Loading",
      "assigned_vessel_id": "psv_001",
      "assigned_vessel_name": "Normand Carioca",
      "scheduled_departure": "2026-01-22T08:00:00Z",
      "estimated_arrival": "2026-01-22T14:00:00Z",
      "items": [
        {
          "cargo_type_id": "diesel",
          "cargo_name": "Marine Diesel Oil",
          "quantity": 400,
          "unit": "m3",
          "compartment_id": "comp_001",
          "loaded": false
        },
        {
          "cargo_type_id": "fresh_water",
          "cargo_name": "Fresh Water",
          "quantity": 300,
          "unit": "m3",
          "compartment_id": "comp_002",
          "loaded": false
        }
      ],
      "total_weight_t": 695,
      "total_volume_m3": 700,
      "destination": {
        "installation_id": "fpso_valente",
        "installation_name": "FPSO Valente"
      },
      "backhaul": {
        "estimated_weight_t": 25,
        "items": ["waste_containers", "empty_drums"]
      }
    }
  ]
}
```

#### PATCH /orders/{id}/status
Update order status.

**Request:**
```json
{
  "status": "InTransit",
  "actual_departure": "2026-01-22T08:15:00Z",
  "notes": "Departed 15 minutes late due to berth availability"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "order_54321",
  "previous_status": "Loading",
  "new_status": "InTransit",
  "updated_at": "2026-01-22T08:15:00Z"
}
```

---

## Operations & Trips

### Trips

#### GET /trips
Get list of trips.

**Query Parameters:**
- `vessel_id` (optional)
- `status` (optional): Planned, InProgress, Completed, Cancelled
- `from_date` (optional)
- `to_date` (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "trip_12345",
      "vessel_id": "psv_001",
      "vessel_name": "Normand Carioca",
      "status": "InProgress",
      "route": [
        {
          "sequence": 1,
          "location_id": "macae_base",
          "location_name": "Port of Macaé",
          "type": "SupplyBase",
          "planned_arrival": null,
          "actual_arrival": null,
          "planned_departure": "2026-01-22T08:00:00Z",
          "actual_departure": "2026-01-22T08:15:00Z",
          "operations": ["Loading"]
        },
        {
          "sequence": 2,
          "location_id": "fpso_valente",
          "location_name": "FPSO Valente",
          "type": "Installation",
          "planned_arrival": "2026-01-22T13:45:00Z",
          "actual_arrival": "2026-01-22T14:00:00Z",
          "planned_departure": "2026-01-22T19:00:00Z",
          "actual_departure": null,
          "operations": ["Discharge"]
        },
        {
          "sequence": 3,
          "location_id": "macae_base",
          "location_name": "Port of Macaé",
          "type": "SupplyBase",
          "planned_arrival": "2026-01-23T00:30:00Z",
          "actual_arrival": null,
          "planned_departure": null,
          "actual_departure": null,
          "operations": ["Unload_Backhaul"]
        }
      ],
      "cargo_manifest": [...],
      "metrics": {
        "total_distance_nm": 134,
        "total_duration_h": 16.5,
        "fuel_consumed_t": 9.7,
        "total_cost_usd": 31940
      },
      "delays": [],
      "weather_impact": "Moderate"
    }
  ]
}
```

#### POST /trips
Create a new trip (usually done by optimization engine).

**Request:**
```json
{
  "vessel_id": "psv_002",
  "planned_departure": "2026-01-23T10:00:00Z",
  "route": [
    {
      "sequence": 1,
      "location_id": "macae_base",
      "planned_departure": "2026-01-23T10:00:00Z"
    },
    {
      "sequence": 2,
      "location_id": "fpso_forte",
      "planned_arrival": "2026-01-23T16:20:00Z",
      "planned_departure": "2026-01-23T22:00:00Z"
    },
    {
      "sequence": 3,
      "location_id": "fpso_bravo",
      "planned_arrival": "2026-01-24T02:00:00Z",
      "planned_departure": "2026-01-24T08:00:00Z"
    },
    {
      "sequence": 4,
      "location_id": "macae_base",
      "planned_arrival": "2026-01-24T14:00:00Z"
    }
  ],
  "cargo_manifest": [
    {
      "waypoint_sequence": 2,
      "order_id": "order_54322",
      "cargo_items": [...]
    }
  ]
}
```

**Response:**
```json
{
  "id": "trip_12347",
  "status": "Planned",
  "vessel_id": "psv_002",
  "created_at": "2026-01-21T15:00:00Z",
  "estimated_metrics": {
    "total_distance_nm": 220,
    "total_duration_h": 28,
    "estimated_fuel_t": 15.5,
    "estimated_cost_usd": 52000
  },
  "weather_forecast": "Good conditions expected"
}
```

#### GET /trips/{id}/tracking
Get real-time tracking information for a trip.

**Response:**
```json
{
  "trip_id": "trip_12345",
  "vessel_id": "psv_001",
  "vessel_name": "Normand Carioca",
  "status": "InProgress",
  "current_position": {
    "latitude": -22.4523,
    "longitude": -40.1876,
    "timestamp": "2026-01-22T14:30:00Z",
    "speed_kts": 12.3,
    "heading": 245,
    "distance_to_next_waypoint_nm": 8.5
  },
  "current_waypoint": {
    "sequence": 2,
    "location_id": "fpso_valente",
    "eta": "2026-01-22T15:15:00Z",
    "eta_updated": "2026-01-22T14:30:00Z"
  },
  "progress": 0.68,
  "weather_current": {
    "wave_height_m": 2.1,
    "wind_speed_ms": 12,
    "visibility_nm": 8
  }
}
```

### Time Windows

#### GET /operations/time-windows
Get available time windows for installations.

**Query Parameters:**
- `installation_id` (required)
- `from_date` (required)
- `to_date` (required)
- `operation_type` (optional)

**Response:**
```json
{
  "installation_id": "fpso_valente",
  "date_range": {
    "from": "2026-01-22",
    "to": "2026-01-25"
  },
  "windows": [
    {
      "date": "2026-01-22",
      "available_slots": [
        {
          "start": "06:00",
          "end": "12:00",
          "preference_score": 1.0,
          "conflicts": []
        },
        {
          "start": "14:00",
          "end": "20:00",
          "preference_score": 0.9,
          "conflicts": ["helicopter_window"]
        }
      ]
    }
  ]
}
```

---

## Weather & Environment

### Weather Forecasts

#### GET /weather/forecasts
Get weather forecasts for locations.

**Query Parameters:**
- `location_id` (required)
- `from_time` (required): ISO 8601 datetime
- `to_time` (required): ISO 8601 datetime
- `horizon` (optional): Forecast horizon in hours

**Response:**
```json
{
  "location_id": "fpso_valente",
  "location_name": "FPSO Valente",
  "forecasts": [
    {
      "timestamp": "2026-01-22T12:00:00Z",
      "forecast_horizon_h": 24,
      "conditions": {
        "wave_height": {
          "min_m": 1.8,
          "mean_m": 2.2,
          "max_m": 2.6
        },
        "wind_speed": {
          "min_ms": 10,
          "mean_ms": 14,
          "max_ms": 18
        },
        "wind_direction": "NE",
        "current_speed_kts": 1.2,
        "visibility_nm": 6
      },
      "weather_state": "Moderate",
      "forecast_accuracy": 0.85,
      "operational_impact": {
        "crane_operations": "Marginal",
        "liquid_discharge": "Suitable",
        "transit": "Suitable"
      }
    }
  ]
}
```

#### GET /weather/windows
Get suitable weather windows for specific operations.

**Query Parameters:**
- `location_id` (required)
- `operation_type` (required): Transit, CraneOps, LiquidDischarge, etc.
- `from_time` (required)
- `duration_h` (required)

**Response:**
```json
{
  "location_id": "fpso_bravo",
  "operation_type": "CraneOps",
  "requested_duration_h": 6,
  "windows": [
    {
      "start_time": "2026-01-23T06:00:00Z",
      "end_time": "2026-01-23T12:00:00Z",
      "duration_h": 6,
      "confidence": 0.85,
      "conditions": {
        "wave_m": 2.1,
        "wind_ms": 12,
        "current_kts": 1.5,
        "visibility_nm": 8
      },
      "suitable": true,
      "risk_level": "Low"
    },
    {
      "start_time": "2026-01-24T08:00:00Z",
      "end_time": "2026-01-24T16:00:00Z",
      "duration_h": 8,
      "confidence": 0.75,
      "conditions": {
        "wave_m": 2.4,
        "wind_ms": 14,
        "current_kts": 1.8,
        "visibility_nm": 7
      },
      "suitable": true,
      "risk_level": "Medium"
    }
  ]
}
```

---

## Optimization

### Optimization Runs

#### POST /optimization/runs
Create and execute a new optimization run.

**Request:**
```json
{
  "planning_horizon": {
    "start": "2026-01-23T00:00:00Z",
    "end": "2026-01-30T00:00:00Z"
  },
  "objective": "minimize_cost",
  "constraints": {
    "vessel_capacity": true,
    "time_windows": true,
    "weather_limits": true,
    "cargo_segregation": true,
    "max_late_deliveries": 2
  },
  "parameters": {
    "max_solution_time_s": 600,
    "optimality_gap": 0.05,
    "solver": "gurobi"
  },
  "scenarios": [
    {
      "name": "base_case",
      "demand_adjustment": 1.0,
      "weather": "forecast"
    },
    {
      "name": "high_demand",
      "demand_adjustment": 1.2,
      "weather": "forecast"
    }
  ],
  "include_vessels": ["psv_001", "psv_002", "psv_003", "psv_004"],
  "fixed_trips": []
}
```

**Response:**
```json
{
  "run_id": "opt_run_789",
  "status": "Running",
  "created_at": "2026-01-21T15:30:00Z",
  "estimated_completion": "2026-01-21T15:40:00Z",
  "progress_url": "/optimization/runs/opt_run_789/progress"
}
```

#### GET /optimization/runs/{id}
Get results of optimization run.

**Response:**
```json
{
  "run_id": "opt_run_789",
  "status": "Completed",
  "execution_time_s": 587,
  "timestamp": "2026-01-21T15:40:00Z",
  "solution": {
    "solution_id": "sol_456",
    "objective_value": 485320,
    "gap": 0.023,
    "feasible": true,
    "summary": {
      "total_cost_usd": 485320,
      "total_distance_nm": 1840,
      "num_trips": 12,
      "fleet_utilization": 0.82,
      "demands_fulfilled": 43,
      "demands_unmet": 2
    },
    "trips": [
      {
        "trip_id": "trip_opt_001",
        "vessel_id": "psv_001",
        "departure": "2026-01-23T08:00:00Z",
        "route": ["macae_base", "fpso_valente", "macae_base"],
        "cargo": [...],
        "cost": 31940
      }
    ],
    "vessel_schedules": [...],
    "kpis": {
      "vessel_utilization": 0.82,
      "on_time_delivery_rate": 0.95,
      "avg_trip_duration_h": 18.5,
      "cost_per_tonne": 92,
      "fuel_efficiency_t_per_nm": 0.23,
      "weather_delay_rate": 0.08,
      "backhaul_rate": 0.65
    },
    "unmet_demands": [
      {
        "demand_id": "demand_98770",
        "installation": "fpso_bravo",
        "cargo": "cement",
        "reason": "Insufficient dry bulk capacity",
        "shortfall": 150
      }
    ]
  }
}
```

#### GET /optimization/runs/{id}/scenarios/{scenario_name}
Get results for specific scenario.

**Response:**
```json
{
  "run_id": "opt_run_789",
  "scenario_name": "high_demand",
  "parameters": {
    "demand_adjustment": 1.2,
    "weather": "forecast"
  },
  "solution": {
    "objective_value": 542180,
    "feasible": true,
    "summary": {...},
    "comparison_to_base": {
      "cost_increase_pct": 11.7,
      "additional_trips": 3,
      "utilization_increase": 0.08
    }
  }
}
```

---

## Analytics & Reporting

### KPIs & Metrics

#### GET /analytics/kpis
Get current KPI dashboard.

**Query Parameters:**
- `period` (optional): daily, weekly, monthly, ytd
- `from_date` (optional)
- `to_date` (optional)

**Response:**
```json
{
  "period": "monthly",
  "from_date": "2026-01-01",
  "to_date": "2026-01-31",
  "kpis": {
    "fleet": {
      "average_utilization": 0.78,
      "vessels_active": 7,
      "vessels_maintenance": 1,
      "total_distance_nm": 8420,
      "total_trips": 56
    },
    "operations": {
      "on_time_delivery_rate": 0.94,
      "avg_trip_duration_h": 19.2,
      "weather_delay_rate": 0.11,
      "emergency_response_avg_h": 5.8
    },
    "costs": {
      "total_cost_usd": 2456000,
      "cost_per_tonne": 95,
      "cost_per_nm": 291,
      "fuel_cost_usd": 684000,
      "charter_cost_usd": 1680000
    },
    "cargo": {
      "total_tonnage_delivered": 25850,
      "backhaul_rate": 0.62,
      "stockout_incidents": 1,
      "emergency_deliveries": 4
    },
    "environment": {
      "total_fuel_consumed_t": 976,
      "total_emissions_co2_t": 3074,
      "fuel_efficiency_t_per_nm": 0.24
    }
  },
  "trends": {
    "utilization_trend": "increasing",
    "cost_trend": "stable",
    "efficiency_trend": "improving"
  }
}
```

#### GET /analytics/vessels/{id}/performance
Get detailed performance analytics for specific vessel.

**Response:**
```json
{
  "vessel_id": "psv_001",
  "vessel_name": "Normand Carioca",
  "period": "last_90_days",
  "performance": {
    "total_trips": 18,
    "completion_rate": 0.94,
    "avg_trip_duration_h": 18.5,
    "total_distance_nm": 2420,
    "avg_fuel_efficiency_t_per_nm": 0.22,
    "utilization": 0.82,
    "on_time_rate": 0.89
  },
  "costs": {
    "total_cost_usd": 542000,
    "charter_cost_usd": 360000,
    "fuel_cost_usd": 168000,
    "other_costs_usd": 14000
  },
  "reliability": {
    "mechanical_issues": 1,
    "weather_delays_count": 5,
    "avg_weather_delay_h": 3.2,
    "maintenance_compliance": 1.0
  },
  "comparison_to_fleet": {
    "utilization_percentile": 75,
    "efficiency_percentile": 82,
    "cost_percentile": 68
  }
}
```

### Reports

#### GET /reports/inventory
Generate inventory status report.

**Query Parameters:**
- `installation_id` (optional)
- `format` (optional): json, pdf, excel

**Response:**
```json
{
  "report_id": "rpt_inv_20260121",
  "generated_at": "2026-01-21T16:00:00Z",
  "installations": [
    {
      "id": "fpso_valente",
      "name": "FPSO Valente",
      "inventory": [
        {
          "cargo_type": "diesel",
          "current_level": 520,
          "max_capacity": 800,
          "safety_stock": 200,
          "unit": "m3",
          "status": "Normal",
          "days_of_supply": 11.6,
          "next_delivery": "2026-01-25T14:00:00Z"
        }
      ],
      "overall_status": "Healthy",
      "critical_items": 0,
      "low_items": 2
    }
  ],
  "summary": {
    "total_installations": 8,
    "healthy": 6,
    "caution": 2,
    "critical": 0
  }
}
```

#### POST /reports/custom
Generate custom report.

**Request:**
```json
{
  "report_type": "trip_analysis",
  "parameters": {
    "from_date": "2026-01-01",
    "to_date": "2026-01-31",
    "vessel_ids": ["psv_001", "psv_002"],
    "metrics": ["cost", "efficiency", "delays"],
    "grouping": "by_vessel"
  },
  "format": "pdf",
  "email_to": "logistics@prio.com"
}
```

**Response:**
```json
{
  "report_id": "rpt_custom_456",
  "status": "Generating",
  "estimated_completion": "2026-01-21T16:05:00Z",
  "download_url": null,
  "will_email": true
}
```

---

## Error Responses

All API endpoints may return the following error formats:

**400 Bad Request:**
```json
{
  "error": "validation_error",
  "message": "Invalid request parameters",
  "details": {
    "quantity": "Must be greater than 0",
    "earliest_delivery": "Must be before latest_delivery"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "error": "not_found",
  "message": "Vessel with id 'psv_999' not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred",
  "request_id": "req_abc123"
}
```

---

## Rate Limits

- **Standard endpoints:** 1000 requests/hour per token
- **Optimization endpoints:** 10 runs/hour per token
- **Analytics endpoints:** 100 requests/hour per token

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 856
X-RateLimit-Reset: 1706198400
```

---

## Webhooks

Subscribe to real-time events:

**Available Events:**
- `trip.started`
- `trip.completed`
- `trip.delayed`
- `inventory.critical`
- `vessel.available`
- `optimization.completed`
- `weather.alert`

**Webhook Payload Example:**
```json
{
  "event": "inventory.critical",
  "timestamp": "2026-01-21T16:30:00Z",
  "data": {
    "installation_id": "fpso_bravo",
    "cargo_type_id": "diesel",
    "current_level": 180,
    "safety_stock": 200,
    "unit": "m3",
    "severity": "critical"
  }
}
```