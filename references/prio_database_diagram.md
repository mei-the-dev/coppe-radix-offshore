# PRIO Offshore Logistics Database Schema Diagram

This document contains an Entity-Relationship (ER) diagram of the PRIO offshore logistics database schema.

## ER Diagram

Rendered diagrams generated from the PostgreSQL DDL parser:

- **Overview ER diagram:** ![PRIO database diagram](references/prio_database_diagram.png)
- **Detailed diagram (column types + descriptions):** ![Detailed PRIO database diagram](references/prio_database_diagram_detailed.png)

## Domain Overview

### 1. Network Domain
- **supply_bases**: Port facilities and supply bases (e.g., Macaé)
- **installations**: Offshore platforms (FPSO, Fixed Platform, Wellhead Platform)
- **installation_storage**: Inventory levels and storage capacity for each installation
- **distance_matrix**: Pre-calculated distances between locations

### 2. Fleet Domain
- **vessels**: Vessel specifications and current status
- **vessel_compartments**: Storage compartments on vessels (tanks, holds, deck space)
- **compartment_compatibility**: Which cargo types can be stored in which compartments
- **vessel_schedules**: Current operational status and availability

### 3. Cargo Domain
- **cargo_types**: Types of cargo (liquid, dry bulk, deck cargo)
- **cargo_incompatibility**: Cargo types that cannot be mixed
- **consumption_profiles**: Consumption patterns for installations
- **demands**: Delivery requirements from installations
- **orders**: Planned/executed delivery orders
- **order_items**: Individual cargo items in orders
- **backhaul_cargo**: Return cargo from installations

### 4. Operations Domain
- **trips**: Vessel trips from port to installations
- **trip_waypoints**: Stops along a trip (port, installations)
- **trip_cargo_manifest**: Cargo loaded/discharged at each waypoint
- **operation_windows**: Weather limits for operations
- **time_windows**: Available time slots at installations
- **trip_delays**: Recorded delays during trips

### 5. Environment Domain
- **weather_forecasts**: Time-series weather data (TimescaleDB hypertable)
- **seasonal_patterns**: Historical weather patterns by month
- **weather_windows**: Suitable weather windows for operations

### 6. Costs Domain
- **cost_structures**: Cost parameters for vessels
- **handling_costs**: Cargo-specific handling costs
- **trip_costs**: Calculated costs for trips
- **penalty_costs**: Penalties for late/incomplete deliveries

### 7. Optimization Domain
- **optimization_runs**: Optimization execution records
- **optimization_scenarios**: Scenario parameters for optimization
- **solutions**: Generated optimization solutions
- **solution_trips**: Trips included in a solution
- **unmet_demands**: Demands not fulfilled by a solution
- **kpis**: Key performance indicators for solutions

## Materialized Views

- **mv_current_inventory**: Current inventory levels with status (Critical/Low/Normal/High)
- **mv_vessel_performance**: Vessel performance metrics (trips, efficiency, costs)

## Key Features

- **PostGIS Geography**: Location data stored as `GEOGRAPHY(POINT, 4326)` for spatial queries
- **TimescaleDB**: Weather forecasts stored as hypertable for time-series optimization
- **GIST Indexes**: Spatial indexes on all location fields for fast geographic queries
- **Triggers**: Automatic timestamp updates and cost calculations
- **Constraints**: Data integrity enforced through CHECK constraints and foreign keys
