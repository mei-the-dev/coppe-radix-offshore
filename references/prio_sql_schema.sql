-- ============================================================================
-- PRIO OFFSHORE LOGISTICS DATABASE SCHEMA
-- PostgreSQL 14+ with PostGIS extension for geographic data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For text search

-- ============================================================================
-- 1. NETWORK DOMAIN
-- ============================================================================

CREATE TABLE supply_bases (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    port_code VARCHAR(10) UNIQUE,
    max_draught_m DECIMAL(5,2),
    max_vessel_length_m DECIMAL(6,2),
    max_deadweight_t DECIMAL(10,2),
    operating_hours VARCHAR(50) DEFAULT '24/7',
    num_berths INTEGER,
    loading_capacity_liquid_m3h DECIMAL(10,2),
    loading_capacity_bulk_m3h DECIMAL(10,2),
    loading_capacity_deck_th DECIMAL(10,2),
    cost_port_dues_usd DECIMAL(10,2),
    cost_pilotage_usd DECIMAL(10,2),
    cost_agency_usd DECIMAL(10,2),
    cost_documentation_usd DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE installations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('FPSO', 'FixedPlatform', 'WellheadPlatform')),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    water_depth_m DECIMAL(8,2),
    distance_from_base_nm DECIMAL(8,2),
    production_capacity_bpd DECIMAL(12,2),
    oil_storage_capacity_bbl DECIMAL(15,2),
    num_cranes INTEGER,
    crane_capacity_t DECIMAL(8,2),
    deck_area_m2 DECIMAL(10,2),
    max_simultaneous_vessels INTEGER DEFAULT 1,
    max_wind_ms DECIMAL(5,2),
    max_wave_m DECIMAL(5,2),
    max_current_kts DECIMAL(5,2),
    min_visibility_nm DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE installation_storage (
    installation_id VARCHAR(50) REFERENCES installations(id) ON DELETE CASCADE,
    cargo_type_id VARCHAR(50),
    max_capacity DECIMAL(12,2) NOT NULL,
    current_level DECIMAL(12,2) DEFAULT 0,
    safety_stock DECIMAL(12,2) NOT NULL,
    reorder_point DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20) CHECK (unit IN ('m3', 'tonnes')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (installation_id, cargo_type_id)
);

CREATE TABLE distance_matrix (
    from_location_id VARCHAR(50) NOT NULL,
    to_location_id VARCHAR(50) NOT NULL,
    distance_nm DECIMAL(8,2) NOT NULL,
    distance_km DECIMAL(8,2) NOT NULL,
    time_12kts_h DECIMAL(6,2),
    time_14kts_h DECIMAL(6,2),
    weather_factor_good DECIMAL(4,2) DEFAULT 1.0,
    weather_factor_moderate DECIMAL(4,2) DEFAULT 1.15,
    weather_factor_rough DECIMAL(4,2) DEFAULT 1.3,
    PRIMARY KEY (from_location_id, to_location_id),
    CHECK (from_location_id != to_location_id)
);

-- ============================================================================
-- 2. FLEET DOMAIN
-- ============================================================================

CREATE TABLE vessels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    class VARCHAR(50) CHECK (class IN ('StandardPSV', 'LargePSV', 'CSV', 'WellStimulation')),
    loa_m DECIMAL(6,2),
    beam_m DECIMAL(5,2),
    draught_m DECIMAL(5,2),
    deck_cargo_capacity_t DECIMAL(10,2),
    total_deadweight_t DECIMAL(10,2),
    service_speed_kts DECIMAL(5,2),
    operational_speed_kts DECIMAL(5,2),
    max_speed_kts DECIMAL(5,2),
    dp_class VARCHAR(10) CHECK (dp_class IN ('DP1', 'DP2', 'DP3', 'None')),
    fuel_consumption_transit_td DECIMAL(8,2),
    fuel_consumption_dp_td DECIMAL(8,2),
    fuel_consumption_port_td DECIMAL(8,2),
    charter_rate_daily_usd DECIMAL(12,2),
    crew_size INTEGER,
    accommodation_capacity INTEGER,
    availability_status VARCHAR(20) CHECK (availability_status IN ('Available', 'InUse', 'Maintenance', 'Drydock')),
    current_location_id VARCHAR(50),
    current_location_coords GEOGRAPHY(POINT, 4326),
    next_maintenance_due DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vessel_compartments (
    id VARCHAR(50) PRIMARY KEY,
    vessel_id VARCHAR(50) REFERENCES vessels(id) ON DELETE CASCADE,
    compartment_type VARCHAR(50) CHECK (compartment_type IN ('LiquidTank', 'DryBulk', 'DeckSpace')),
    capacity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) CHECK (unit IN ('m3', 'tonnes', 'm2')),
    current_cargo_id VARCHAR(50),
    fill_level DECIMAL(5,4) DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 1),
    last_cleaned TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE compartment_compatibility (
    compartment_id VARCHAR(50) REFERENCES vessel_compartments(id) ON DELETE CASCADE,
    cargo_type_id VARCHAR(50),
    compatible BOOLEAN DEFAULT TRUE,
    cleaning_time_h DECIMAL(5,2) DEFAULT 0,
    PRIMARY KEY (compartment_id, cargo_type_id)
);

CREATE TABLE vessel_schedules (
    vessel_id VARCHAR(50) PRIMARY KEY REFERENCES vessels(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('Loading', 'Transit', 'Offshore', 'Returning', 'Idle', 'Maintenance')),
    current_trip_id VARCHAR(50),
    next_available TIMESTAMP,
    utilization_target DECIMAL(5,4) DEFAULT 0.80,
    ytd_utilization DECIMAL(5,4),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CARGO DOMAIN
-- ============================================================================

CREATE TABLE cargo_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Liquid', 'DryBulk', 'DeckCargo')),
    density_kg_m3 DECIMAL(8,2),
    unit VARCHAR(20) CHECK (unit IN ('m3', 'tonnes')),
    segregation_required BOOLEAN DEFAULT FALSE,
    loading_rate_m3h DECIMAL(8,2),
    discharging_rate_m3h DECIMAL(8,2),
    weather_sensitive BOOLEAN DEFAULT FALSE,
    handling_cost_per_unit DECIMAL(10,2),
    storage_temp_c DECIMAL(5,2),
    hazmat_class VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cargo_incompatibility (
    cargo_type_id_1 VARCHAR(50) REFERENCES cargo_types(id),
    cargo_type_id_2 VARCHAR(50) REFERENCES cargo_types(id),
    cleaning_time_h DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (cargo_type_id_1, cargo_type_id_2),
    CHECK (cargo_type_id_1 < cargo_type_id_2) -- Avoid duplicates
);

CREATE TABLE consumption_profiles (
    id VARCHAR(50) PRIMARY KEY,
    installation_id VARCHAR(50) REFERENCES installations(id) ON DELETE CASCADE,
    cargo_type_id VARCHAR(50) REFERENCES cargo_types(id),
    daily_consumption DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20),
    variability_std_dev DECIMAL(12,2),
    variability_cv DECIMAL(5,4),
    scenario_normal_factor DECIMAL(5,3) DEFAULT 1.0,
    scenario_drilling_factor DECIMAL(5,3) DEFAULT 1.5,
    scenario_workover_factor DECIMAL(5,3) DEFAULT 1.2,
    scenario_low_factor DECIMAL(5,3) DEFAULT 0.7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (installation_id, cargo_type_id)
);

CREATE TABLE consumption_weekly_pattern (
    profile_id VARCHAR(50) REFERENCES consumption_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    factor DECIMAL(5,3) DEFAULT 1.0,
    PRIMARY KEY (profile_id, day_of_week)
);

CREATE TABLE consumption_monthly_pattern (
    profile_id VARCHAR(50) REFERENCES consumption_profiles(id) ON DELETE CASCADE,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    factor DECIMAL(5,3) DEFAULT 1.0,
    PRIMARY KEY (profile_id, month)
);

CREATE TABLE demands (
    id VARCHAR(50) PRIMARY KEY,
    installation_id VARCHAR(50) REFERENCES installations(id),
    cargo_type_id VARCHAR(50) REFERENCES cargo_types(id),
    quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20),
    earliest_delivery TIMESTAMP NOT NULL,
    latest_delivery TIMESTAMP NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('Critical', 'High', 'Normal', 'Low')),
    scenario VARCHAR(50) CHECK (scenario IN ('Normal', 'Drilling', 'Workover', 'Emergency')),
    penalty_late_per_day DECIMAL(12,2) DEFAULT 0,
    forecast_accuracy DECIMAL(5,4) DEFAULT 0.85,
    status VARCHAR(20) CHECK (status IN ('Forecast', 'Planned', 'Confirmed', 'InProgress', 'Fulfilled', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    demand_id VARCHAR(50) REFERENCES demands(id),
    status VARCHAR(20) CHECK (status IN ('Planned', 'Confirmed', 'Loading', 'InTransit', 'Delivered', 'Cancelled')),
    assigned_vessel_id VARCHAR(50) REFERENCES vessels(id),
    scheduled_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    total_weight_t DECIMAL(12,2),
    total_volume_m3 DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    cargo_type_id VARCHAR(50) REFERENCES cargo_types(id),
    quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20),
    compartment_id VARCHAR(50) REFERENCES vessel_compartments(id),
    loaded BOOLEAN DEFAULT FALSE,
    delivered BOOLEAN DEFAULT FALSE
);

CREATE TABLE backhaul_cargo (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    installation_id VARCHAR(50) REFERENCES installations(id),
    cargo_type VARCHAR(100),
    quantity DECIMAL(12,2),
    unit VARCHAR(20),
    notes TEXT
);

-- ============================================================================
-- 4. OPERATIONS DOMAIN
-- ============================================================================

CREATE TABLE trips (
    id VARCHAR(50) PRIMARY KEY,
    vessel_id VARCHAR(50) REFERENCES vessels(id),
    status VARCHAR(20) CHECK (status IN ('Planned', 'InProgress', 'Completed', 'Cancelled', 'Delayed')),
    planned_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    planned_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    total_distance_nm DECIMAL(10,2),
    total_duration_h DECIMAL(8,2),
    fuel_consumed_t DECIMAL(10,2),
    fuel_cost_usd DECIMAL(12,2),
    charter_cost_usd DECIMAL(12,2),
    port_costs_usd DECIMAL(12,2),
    offshore_costs_usd DECIMAL(12,2),
    handling_costs_usd DECIMAL(12,2),
    total_cost_usd DECIMAL(12,2),
    optimization_run_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_waypoints (
    id VARCHAR(50) PRIMARY KEY,
    trip_id VARCHAR(50) REFERENCES trips(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    location_type VARCHAR(50) CHECK (location_type IN ('SupplyBase', 'Installation')),
    planned_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    planned_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    operation_type VARCHAR(50),
    service_time_h DECIMAL(6,2),
    weather_delay_h DECIMAL(6,2),
    UNIQUE (trip_id, sequence)
);

CREATE TABLE trip_cargo_manifest (
    id VARCHAR(50) PRIMARY KEY,
    trip_id VARCHAR(50) REFERENCES trips(id) ON DELETE CASCADE,
    waypoint_id VARCHAR(50) REFERENCES trip_waypoints(id),
    order_item_id VARCHAR(50) REFERENCES order_items(id),
    cargo_type_id VARCHAR(50) REFERENCES cargo_types(id),
    quantity DECIMAL(12,2),
    unit VARCHAR(20),
    action VARCHAR(20) CHECK (action IN ('Load', 'Discharge'))
);

CREATE TABLE operation_windows (
    id VARCHAR(50) PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    max_wind_ms DECIMAL(5,2),
    max_wave_m DECIMAL(5,2),
    max_current_kts DECIMAL(5,2),
    min_visibility_nm DECIMAL(5,2),
    time_min_h DECIMAL(6,2),
    time_expected_h DECIMAL(6,2),
    time_max_h DECIMAL(6,2),
    efficiency_day DECIMAL(5,4) DEFAULT 1.0,
    efficiency_night DECIMAL(5,4) DEFAULT 0.85
);

CREATE TABLE time_windows (
    id VARCHAR(50) PRIMARY KEY,
    installation_id VARCHAR(50) REFERENCES installations(id),
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    available BOOLEAN DEFAULT TRUE,
    conflict_type VARCHAR(100),
    preference_score DECIMAL(5,4) DEFAULT 1.0,
    UNIQUE (installation_id, date, start_time)
);

CREATE TABLE trip_delays (
    id VARCHAR(50) PRIMARY KEY,
    trip_id VARCHAR(50) REFERENCES trips(id) ON DELETE CASCADE,
    waypoint_id VARCHAR(50) REFERENCES trip_waypoints(id),
    reason VARCHAR(255) NOT NULL,
    delay_type VARCHAR(50) CHECK (delay_type IN ('Weather', 'Equipment', 'PortCongestion', 'CraneUnavailable', 'Other')),
    duration_h DECIMAL(6,2) NOT NULL,
    location VARCHAR(255),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. ENVIRONMENT DOMAIN
-- ============================================================================

-- Create hypertable for time-series weather data
CREATE TABLE weather_forecasts (
    id VARCHAR(50),
    location_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    forecast_horizon_h INTEGER NOT NULL,
    wave_height_min_m DECIMAL(5,2),
    wave_height_mean_m DECIMAL(5,2),
    wave_height_max_m DECIMAL(5,2),
    wind_speed_min_ms DECIMAL(5,2),
    wind_speed_mean_ms DECIMAL(5,2),
    wind_speed_max_ms DECIMAL(5,2),
    wind_direction VARCHAR(10),
    current_speed_kts DECIMAL(5,2),
    visibility_nm DECIMAL(5,2),
    forecast_accuracy DECIMAL(5,4),
    weather_state VARCHAR(20) CHECK (weather_state IN ('Good', 'Moderate', 'Rough', 'Severe')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (location_id, timestamp, forecast_horizon_h)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('weather_forecasts', 'timestamp', 
    chunk_time_interval => INTERVAL '7 days',
    if_not_exists => TRUE);

CREATE TABLE seasonal_patterns (
    id VARCHAR(50) PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    wave_dist_hs_lt_2m DECIMAL(5,4),
    wave_dist_hs_2_3m DECIMAL(5,4),
    wave_dist_hs_3_4m DECIMAL(5,4),
    wave_dist_hs_gt_4m DECIMAL(5,4),
    wind_avg_ms DECIMAL(5,2),
    workability DECIMAL(5,4),
    delay_probability DECIMAL(5,4),
    UNIQUE (location, month)
);

CREATE TABLE weather_windows (
    id VARCHAR(50) PRIMARY KEY,
    location_id VARCHAR(50) NOT NULL,
    operation_type VARCHAR(50),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_h DECIMAL(6,2),
    confidence DECIMAL(5,4),
    condition_wave_m DECIMAL(5,2),
    condition_wind_ms DECIMAL(5,2),
    condition_current_kts DECIMAL(5,2),
    condition_visibility_nm DECIMAL(5,2),
    suitable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. COSTS DOMAIN
-- ============================================================================

CREATE TABLE cost_structures (
    id VARCHAR(50) PRIMARY KEY,
    vessel_id VARCHAR(50) REFERENCES vessels(id),
    effective_from DATE NOT NULL,
    effective_to DATE,
    charter_rate_daily_usd DECIMAL(12,2),
    fuel_price_per_tonne_usd DECIMAL(10,2),
    port_dues_usd DECIMAL(10,2),
    pilotage_usd DECIMAL(10,2),
    agency_usd DECIMAL(10,2),
    documentation_usd DECIMAL(10,2),
    crane_hourly_usd DECIMAL(10,2),
    offshore_personnel_usd DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE handling_costs (
    cost_structure_id VARCHAR(50) REFERENCES cost_structures(id) ON DELETE CASCADE,
    cargo_type_id VARCHAR(50) REFERENCES cargo_types(id),
    cost_per_unit DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    PRIMARY KEY (cost_structure_id, cargo_type_id)
);

CREATE TABLE trip_costs (
    trip_id VARCHAR(50) PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
    charter_cost_usd DECIMAL(12,2),
    fuel_cost_usd DECIMAL(12,2),
    port_costs_usd DECIMAL(12,2),
    offshore_costs_usd DECIMAL(12,2),
    handling_costs_usd DECIMAL(12,2),
    total_cost_usd DECIMAL(12,2),
    cost_per_tonne DECIMAL(10,2),
    cost_per_nm DECIMAL(10,2),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE penalty_costs (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id),
    penalty_type VARCHAR(50) CHECK (penalty_type IN ('LateDelivery', 'IncompleteDelivery', 'Stockout', 'ProductionLoss')),
    amount_usd DECIMAL(15,2) NOT NULL,
    duration_h DECIMAL(10,2),
    reason TEXT,
    incurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. OPTIMIZATION DOMAIN
-- ============================================================================

CREATE TABLE optimization_runs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    planning_horizon_start TIMESTAMPTZ NOT NULL,
    planning_horizon_end TIMESTAMPTZ NOT NULL,
    objective_function TEXT,
    solver VARCHAR(100),
    solution_time_s DECIMAL(10,3),
    objective_value DECIMAL(20,2),
    gap DECIMAL(8,6),
    status VARCHAR(50),
    num_vessels INTEGER,
    num_installations INTEGER,
    num_demands INTEGER,
    constraints TEXT,
    parameters JSONB,
    created_by VARCHAR(100)
);

CREATE TABLE optimization_scenarios (
    run_id VARCHAR(50) REFERENCES optimization_runs(id) ON DELETE CASCADE,
    scenario_name VARCHAR(100),
    scenario_type VARCHAR(50),
    parameters JSONB,
    PRIMARY KEY (run_id, scenario_name)
);

CREATE TABLE solutions (
    id VARCHAR(50) PRIMARY KEY,
    optimization_run_id VARCHAR(50) REFERENCES optimization_runs(id) ON DELETE CASCADE,
    total_cost_usd DECIMAL(20,2),
    total_distance_nm DECIMAL(15,2),
    fleet_utilization DECIMAL(5,4),
    num_trips INTEGER,
    num_unmet_demands INTEGER,
    feasible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE solution_trips (
    solution_id VARCHAR(50) REFERENCES solutions(id) ON DELETE CASCADE,
    trip_id VARCHAR(50) REFERENCES trips(id) ON DELETE CASCADE,
    PRIMARY KEY (solution_id, trip_id)
);

CREATE TABLE unmet_demands (
    id VARCHAR(50) PRIMARY KEY,
    solution_id VARCHAR(50) REFERENCES solutions(id) ON DELETE CASCADE,
    demand_id VARCHAR(50) REFERENCES demands(id),
    reason TEXT,
    shortfall_quantity DECIMAL(12,2)
);

CREATE TABLE kpis (
    solution_id VARCHAR(50) PRIMARY KEY REFERENCES solutions(id) ON DELETE CASCADE,
    vessel_utilization DECIMAL(5,4),
    on_time_delivery_rate DECIMAL(5,4),
    avg_trip_duration_h DECIMAL(8,2),
    cost_per_tonne DECIMAL(10,2),
    fuel_efficiency_t_per_nm DECIMAL(6,4),
    emergency_response_time_h DECIMAL(6,2),
    weather_delay_rate DECIMAL(5,4),
    backhaul_rate DECIMAL(5,4),
    total_emissions_co2_t DECIMAL(15,2),
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Geographic indexes
CREATE INDEX idx_supply_bases_location ON supply_bases USING GIST(location);
CREATE INDEX idx_installations_location ON installations USING GIST(location);
CREATE INDEX idx_vessels_location ON vessels USING GIST(current_location_coords);

-- Time-series indexes
CREATE INDEX idx_weather_location_time ON weather_forecasts(location_id, timestamp DESC);
CREATE INDEX idx_trips_departure ON trips(actual_departure) WHERE actual_departure IS NOT NULL;
CREATE INDEX idx_trips_status ON trips(status);

-- Foreign key indexes
CREATE INDEX idx_installation_storage_inst ON installation_storage(installation_id);
CREATE INDEX idx_vessel_compartments_vessel ON vessel_compartments(vessel_id);
CREATE INDEX idx_demands_installation ON demands(installation_id);
CREATE INDEX idx_demands_status ON demands(status);
CREATE INDEX idx_orders_vessel ON orders(assigned_vessel_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_trips_vessel ON trips(vessel_id);
CREATE INDEX idx_trip_waypoints_trip ON trip_waypoints(trip_id, sequence);

-- Composite indexes for common queries
CREATE INDEX idx_consumption_profiles_lookup ON consumption_profiles(installation_id, cargo_type_id);
CREATE INDEX idx_weather_windows_lookup ON weather_windows(location_id, start_time, end_time);
CREATE INDEX idx_time_windows_lookup ON time_windows(installation_id, date);

-- Text search indexes
CREATE INDEX idx_vessels_name_trgm ON vessels USING gin(name gin_trgm_ops);
CREATE INDEX idx_installations_name_trgm ON installations USING gin(name gin_trgm_ops);

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

CREATE MATERIALIZED VIEW mv_current_inventory AS
SELECT 
    i.id AS installation_id,
    i.name AS installation_name,
    ist.cargo_type_id,
    ct.name AS cargo_name,
    ist.current_level,
    ist.max_capacity,
    ist.safety_stock,
    ist.reorder_point,
    ist.unit,
    CASE 
        WHEN ist.current_level < ist.safety_stock THEN 'Critical'
        WHEN ist.current_level < ist.reorder_point THEN 'Low'
        WHEN ist.current_level > ist.max_capacity * 0.9 THEN 'High'
        ELSE 'Normal'
    END AS inventory_status,
    ist.last_updated
FROM installations i
JOIN installation_storage ist ON i.id = ist.installation_id
JOIN cargo_types ct ON ist.cargo_type_id = ct.id;

CREATE INDEX ON mv_current_inventory(installation_id);
CREATE INDEX ON mv_current_inventory(inventory_status);

CREATE MATERIALIZED VIEW mv_vessel_performance AS
SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    v.class,
    COUNT(t.id) AS total_trips,
    AVG(t.total_duration_h) AS avg_trip_duration,
    SUM(t.total_distance_nm) AS total_distance,
    AVG(t.fuel_consumed_t / NULLIF(t.total_distance_nm, 0)) AS avg_fuel_efficiency,
    SUM(t.total_cost_usd) AS total_cost,
    COUNT(CASE WHEN t.status = 'Completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(t.id), 0) AS completion_rate
FROM vessels v
LEFT JOIN trips t ON v.id = t.vessel_id
WHERE t.actual_departure >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY v.id, v.name, v.class;

CREATE INDEX ON mv_vessel_performance(vessel_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_supply_bases_updated_at BEFORE UPDATE ON supply_bases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installations_updated_at BEFORE UPDATE ON installations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demands_updated_at BEFORE UPDATE ON demands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate trip costs automatically
CREATE OR REPLACE FUNCTION calculate_trip_cost()
RETURNS TRIGGER AS $$
DECLARE
    v_charter_days DECIMAL;
    v_charter_rate DECIMAL;
    v_fuel_price DECIMAL;
BEGIN
    -- Calculate charter cost
    IF NEW.actual_departure IS NOT NULL AND NEW.actual_arrival IS NOT NULL THEN
        v_charter_days := EXTRACT(EPOCH FROM (NEW.actual_arrival - NEW.actual_departure)) / 86400.0;
    ELSIF NEW.planned_departure IS NOT NULL AND NEW.planned_arrival IS NOT NULL THEN
        v_charter_days := EXTRACT(EPOCH FROM (NEW.planned_arrival - NEW.planned_departure)) / 86400.0;
    END IF;
    
    SELECT charter_rate_daily_usd INTO v_charter_rate 
    FROM vessels WHERE id = NEW.vessel_id;
    
    NEW.charter_cost_usd := v_charter_days * v_charter_rate;
    
    -- Calculate fuel cost
    SELECT fuel_price_per_tonne_usd INTO v_fuel_price
    FROM cost_structures 
    WHERE vessel_id = NEW.vessel_id 
    AND CURRENT_DATE BETWEEN effective_from AND COALESCE(effective_to, '9999-12-31')
    LIMIT 1;
    
    NEW.fuel_cost_usd := NEW.fuel_consumed_t * COALESCE(v_fuel_price, 700);
    
    -- Sum total cost
    NEW.total_cost_usd := COALESCE(NEW.charter_cost_usd, 0) + 
                          COALESCE(NEW.fuel_cost_usd, 0) + 
                          COALESCE(NEW.port_costs_usd, 0) + 
                          COALESCE(NEW.offshore_costs_usd, 0) + 
                          COALESCE(NEW.handling_costs_usd, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_trip_cost_trigger BEFORE INSERT OR UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION calculate_trip_cost();

-- Update inventory levels
CREATE OR REPLACE FUNCTION update_inventory_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivered = TRUE AND OLD.delivered = FALSE THEN
        UPDATE installation_storage
        SET current_level = current_level + NEW.quantity,
            last_updated = CURRENT_TIMESTAMP
        WHERE installation_id = (
            SELECT d.installation_id 
            FROM demands d 
            JOIN orders o ON d.id = o.demand_id 
            WHERE o.id = NEW.order_id
        )
        AND cargo_type_id = NEW.cargo_type_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_trigger AFTER UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_inventory_level();

-- ============================================================================
-- SAMPLE DATA QUERIES
-- ============================================================================

-- Query 1: Current fleet status
-- SELECT v.name, v.class, v.availability_status, vs.status, vs.next_available
-- FROM vessels v
-- JOIN vessel_schedules vs ON v.id = vs.vessel_id
-- ORDER BY v.class, v.name;

-- Query 2: Critical inventory levels
-- SELECT * FROM mv_current_inventory 
-- WHERE inventory_status IN ('Critical', 'Low')
-- ORDER BY inventory_status, installation_name;

-- Query 3: Upcoming demands requiring delivery
-- SELECT d.id, i.name, ct.name, d.quantity, d.earliest_delivery, d.latest_delivery
-- FROM demands d
-- JOIN installations i ON d.installation_id = i.id
-- JOIN cargo_types ct ON d.cargo_type_id = ct.id
-- WHERE d.status = 'Confirmed'
-- AND d.latest_delivery >= CURRENT_TIMESTAMP
-- ORDER BY d.latest_delivery;

-- Query 4: Weather windows for next 48 hours
-- SELECT ww.location_id, ww.start_time, ww.end_time, ww.duration_h, ww.suitable
-- FROM weather_windows ww
-- WHERE ww.start_time BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '48 hours'
-- ORDER BY ww.location_id, ww.start_time;

-- Query 5: Vessel performance metrics
-- SELECT * FROM mv_vessel_performance
-- ORDER BY completion_rate DESC, avg_fuel_efficiency ASC;