/**
 * Database Seed Script
 * Populates the database with comprehensive PRIO operational data
 * Based on references: prio-offshore-logistics-report, prio-logistics-data-model, inventory.md, metrics.md
 */

import pool from './connection';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seed...');
    await client.query('BEGIN');

    // ============================================================================
    // 1. SUPPLY BASES
    // ============================================================================
    console.log('📦 Seeding supply bases...');
    await client.query(`
      INSERT INTO supply_bases (
        id, name, location, port_code, max_draught_m, max_vessel_length_m, 
        max_deadweight_t, operating_hours, num_berths,
        loading_capacity_liquid_m3h, loading_capacity_bulk_m3h, loading_capacity_deck_th,
        cost_port_dues_usd, cost_pilotage_usd, cost_agency_usd, cost_documentation_usd
      ) VALUES (
        'macaé',
        'Porto Engenheiro Zephyrino Lavanère Machado Filho (Macaé)',
        ST_SetSRID(ST_MakePoint(-41.7833, -22.3833), 4326)::GEOGRAPHY,
        'BRMEA',
        7.9,
        97.0,
        5513.0,
        '24/7',
        3,
        150.0,
        80.0,
        25.0,
        1000.0,
        600.0,
        350.0,
        200.0
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        location = EXCLUDED.location,
        updated_at = CURRENT_TIMESTAMP;
    `);

    // ============================================================================
    // 2. INSTALLATIONS
    // ============================================================================
    console.log('🏗️  Seeding installations...');
    const installations = [
      {
        id: 'fpso-bravo',
        name: 'FPSO Bravo (Tubarão Martelo)',
        type: 'FPSO',
        lat: -40.5,
        lon: -22.5,
        water_depth: 121.0,
        distance_nm: 70.0,
        production_capacity: 16000.0,
        oil_storage: 600000.0,
        num_cranes: 2,
        crane_capacity: 100.0,
        deck_area: 1500.0,
        max_simultaneous: 1,
        max_wind: 18.0,
        max_wave: 3.0,
        max_current: 2.0,
        min_visibility: 1.0
      },
      {
        id: 'platform-polvo',
        name: 'Platform Polvo A',
        type: 'WellheadPlatform',
        lat: -40.6,
        lon: -22.6,
        water_depth: 121.0,
        distance_nm: 70.0,
        production_capacity: 8000.0,
        oil_storage: 0.0,
        num_cranes: 1,
        crane_capacity: 50.0,
        deck_area: 500.0,
        max_simultaneous: 1,
        max_wind: 15.0,
        max_wave: 2.5,
        max_current: 2.0,
        min_visibility: 1.0
      },
      {
        id: 'fpso-valente',
        name: 'FPSO Valente (Frade)',
        type: 'FPSO',
        lat: -40.2,
        lon: -21.8,
        water_depth: 1200.0,
        distance_nm: 67.0,
        production_capacity: 100000.0,
        oil_storage: 1600000.0,
        num_cranes: 2,
        crane_capacity: 100.0,
        deck_area: 2000.0,
        max_simultaneous: 1,
        max_wind: 18.0,
        max_wave: 3.0,
        max_current: 2.0,
        min_visibility: 1.0
      },
      {
        id: 'fpso-forte',
        name: 'FPSO Forte (Albacora Leste)',
        type: 'FPSO',
        lat: -40.0,
        lon: -21.5,
        water_depth: 1000.0,
        distance_nm: 75.0,
        production_capacity: 180000.0,
        oil_storage: 1000000.0,
        num_cranes: 2,
        crane_capacity: 100.0,
        deck_area: 2000.0,
        max_simultaneous: 1,
        max_wind: 18.0,
        max_wave: 3.0,
        max_current: 2.0,
        min_visibility: 1.0
      },
      {
        id: 'fpso-peregrino',
        name: 'FPSO Peregrino',
        type: 'FPSO',
        lat: -40.8,
        lon: -22.2,
        water_depth: 120.0,
        distance_nm: 46.0,
        production_capacity: 110000.0,
        oil_storage: 1000000.0,
        num_cranes: 2,
        crane_capacity: 100.0,
        deck_area: 2000.0,
        max_simultaneous: 1,
        max_wind: 18.0,
        max_wave: 3.0,
        max_current: 2.0,
        min_visibility: 1.0
      },
      {
        id: 'platform-peregrino-a',
        name: 'Platform Peregrino A',
        type: 'FixedPlatform',
        lat: -40.85,
        lon: -22.25,
        water_depth: 120.0,
        distance_nm: 46.0,
        production_capacity: 0.0,
        oil_storage: 0.0,
        num_cranes: 1,
        crane_capacity: 50.0,
        deck_area: 400.0,
        max_simultaneous: 1,
        max_wind: 15.0,
        max_wave: 2.5,
        max_current: 2.0,
        min_visibility: 1.0
      },
      {
        id: 'platform-peregrino-b',
        name: 'Platform Peregrino B',
        type: 'FixedPlatform',
        lat: -40.75,
        lon: -22.15,
        water_depth: 120.0,
        distance_nm: 46.0,
        production_capacity: 0.0,
        oil_storage: 0.0,
        num_cranes: 1,
        crane_capacity: 50.0,
        deck_area: 400.0,
        max_simultaneous: 1,
        max_wind: 15.0,
        max_wave: 2.5,
        max_current: 2.0,
        min_visibility: 1.0
      },
      {
        id: 'platform-peregrino-c',
        name: 'Platform Peregrino C',
        type: 'FixedPlatform',
        lat: -40.8,
        lon: -22.2,
        water_depth: 120.0,
        distance_nm: 46.0,
        production_capacity: 0.0,
        oil_storage: 0.0,
        num_cranes: 1,
        crane_capacity: 50.0,
        deck_area: 400.0,
        max_simultaneous: 1,
        max_wind: 15.0,
        max_wave: 2.5,
        max_current: 2.0,
        min_visibility: 1.0
      }
    ];

    for (const inst of installations) {
      await client.query(`
        INSERT INTO installations (
          id, name, type, location, water_depth_m, distance_from_base_nm,
          production_capacity_bpd, oil_storage_capacity_bbl, num_cranes, crane_capacity_t,
          deck_area_m2, max_simultaneous_vessels, max_wind_ms, max_wave_m,
          max_current_kts, min_visibility_nm
        ) VALUES (
          $1, $2, $3,
          ST_SetSRID(ST_MakePoint($4, $5), 4326)::GEOGRAPHY,
          $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          location = EXCLUDED.location,
          updated_at = CURRENT_TIMESTAMP;
      `, [
        inst.id, inst.name, inst.type, inst.lat, inst.lon,
        inst.water_depth, inst.distance_nm, inst.production_capacity,
        inst.oil_storage, inst.num_cranes, inst.crane_capacity,
        inst.deck_area, inst.max_simultaneous, inst.max_wind,
        inst.max_wave, inst.max_current, inst.min_visibility
      ]);
    }

    // ============================================================================
    // 3. DISTANCE MATRIX
    // ============================================================================
    console.log('📏 Seeding distance matrix...');
    const distances = [
      { from: 'macaé', to: 'fpso-peregrino', nm: 46.0, km: 85.2, time_12: 3.8, time_14: 3.3 },
      { from: 'macaé', to: 'fpso-bravo', nm: 70.0, km: 129.6, time_12: 5.8, time_14: 5.0 },
      { from: 'macaé', to: 'platform-polvo', nm: 70.0, km: 129.6, time_12: 5.8, time_14: 5.0 },
      { from: 'macaé', to: 'fpso-valente', nm: 67.0, km: 124.1, time_12: 5.6, time_14: 4.8 },
      { from: 'macaé', to: 'fpso-forte', nm: 75.0, km: 138.9, time_12: 6.3, time_14: 5.4 },
      { from: 'macaé', to: 'platform-peregrino-a', nm: 46.0, km: 85.2, time_12: 3.8, time_14: 3.3 },
      { from: 'macaé', to: 'platform-peregrino-b', nm: 46.0, km: 85.2, time_12: 3.8, time_14: 3.3 },
      { from: 'macaé', to: 'platform-peregrino-c', nm: 46.0, km: 85.2, time_12: 3.8, time_14: 3.3 },
      { from: 'fpso-peregrino', to: 'platform-polvo', nm: 15.0, km: 27.8, time_12: 1.3, time_14: 1.1 },
      { from: 'platform-polvo', to: 'fpso-bravo', nm: 5.9, km: 10.9, time_12: 0.5, time_14: 0.4 },
      { from: 'fpso-peregrino', to: 'platform-peregrino-a', nm: 2.0, km: 3.7, time_12: 0.2, time_14: 0.1 },
      { from: 'platform-peregrino-a', to: 'platform-peregrino-b', nm: 3.0, km: 5.6, time_12: 0.3, time_14: 0.2 },
      { from: 'platform-peregrino-b', to: 'platform-peregrino-c', nm: 2.5, km: 4.6, time_12: 0.2, time_14: 0.2 }
    ];

    for (const dist of distances) {
      await client.query(`
        INSERT INTO distance_matrix (
          from_location_id, to_location_id, distance_nm, distance_km,
          time_12kts_h, time_14kts_h, weather_factor_good, weather_factor_moderate, weather_factor_rough
        ) VALUES ($1, $2, $3, $4, $5, $6, 1.0, 1.15, 1.3)
        ON CONFLICT (from_location_id, to_location_id) DO UPDATE SET
          distance_nm = EXCLUDED.distance_nm,
          distance_km = EXCLUDED.distance_km,
          time_12kts_h = EXCLUDED.time_12kts_h,
          time_14kts_h = EXCLUDED.time_14kts_h;
      `, [dist.from, dist.to, dist.nm, dist.km, dist.time_12, dist.time_14]);
    }

    // ============================================================================
    // 4. CARGO TYPES
    // ============================================================================
    console.log('📦 Seeding cargo types...');
    const cargoTypes = [
      // Liquid Bulk
      { id: 'diesel', name: 'Marine Diesel Oil', category: 'Liquid', density: 850, unit: 'm3', segregation: true, loading_rate: 125, discharging_rate: 100, weather_sensitive: false, handling_cost: 7.5, hazmat: 'Class 3' },
      { id: 'fresh_water', name: 'Fresh Water (Potable)', category: 'Liquid', density: 1000, unit: 'm3', segregation: true, loading_rate: 150, discharging_rate: 125, weather_sensitive: false, handling_cost: 7.5, hazmat: null },
      { id: 'drilling_mud_obm', name: 'Oil-Based Drilling Mud', category: 'Liquid', density: 1300, unit: 'm3', segregation: true, loading_rate: 100, discharging_rate: 80, weather_sensitive: false, handling_cost: 10.0, hazmat: 'Class 3' },
      { id: 'drilling_mud_wbm', name: 'Water-Based Drilling Mud', category: 'Liquid', density: 1200, unit: 'm3', segregation: true, loading_rate: 100, discharging_rate: 80, weather_sensitive: false, handling_cost: 10.0, hazmat: null },
      { id: 'brine', name: 'Brine', category: 'Liquid', density: 1200, unit: 'm3', segregation: true, loading_rate: 100, discharging_rate: 80, weather_sensitive: false, handling_cost: 8.0, hazmat: null },
      { id: 'methanol', name: 'Methanol', category: 'Liquid', density: 792, unit: 'm3', segregation: true, loading_rate: 50, discharging_rate: 40, weather_sensitive: false, handling_cost: 12.5, hazmat: 'Class 3' },
      { id: 'chemicals', name: 'Chemical Products', category: 'Liquid', density: 950, unit: 'm3', segregation: true, loading_rate: 35, discharging_rate: 30, weather_sensitive: false, handling_cost: 10.0, hazmat: 'Class 8' },
      { id: 'base_oil', name: 'Base Oil', category: 'Liquid', density: 875, unit: 'm3', segregation: true, loading_rate: 100, discharging_rate: 80, weather_sensitive: false, handling_cost: 8.0, hazmat: 'Class 3' },
      // Dry Bulk
      { id: 'cement', name: 'Cement', category: 'DryBulk', density: 1500, unit: 'm3', segregation: false, loading_rate: 75, discharging_rate: 60, weather_sensitive: true, handling_cost: 17.5, hazmat: null },
      { id: 'barite', name: 'Barite', category: 'DryBulk', density: 3350, unit: 'm3', segregation: false, loading_rate: 65, discharging_rate: 50, weather_sensitive: true, handling_cost: 21.5, hazmat: null },
      { id: 'bentonite', name: 'Bentonite', category: 'DryBulk', density: 700, unit: 'm3', segregation: false, loading_rate: 60, discharging_rate: 50, weather_sensitive: true, handling_cost: 15.0, hazmat: null },
      { id: 'drilling_chemicals_powder', name: 'Drilling Chemicals (Powder)', category: 'DryBulk', density: 1000, unit: 'm3', segregation: false, loading_rate: 45, discharging_rate: 40, weather_sensitive: true, handling_cost: 12.0, hazmat: 'Class 8' },
      // Deck Cargo
      { id: 'drill_pipes', name: 'Drill Pipes (40 ft)', category: 'DeckCargo', density: null, unit: 'tonnes', segregation: false, loading_rate: null, discharging_rate: null, weather_sensitive: true, handling_cost: 25.0, hazmat: null },
      { id: 'casing_pipes', name: 'Casing Pipes', category: 'DeckCargo', density: null, unit: 'tonnes', segregation: false, loading_rate: null, discharging_rate: null, weather_sensitive: true, handling_cost: 25.0, hazmat: null },
      { id: 'containers_20ft', name: 'Containers (20 ft)', category: 'DeckCargo', density: null, unit: 'tonnes', segregation: false, loading_rate: null, discharging_rate: null, weather_sensitive: true, handling_cost: 22.5, hazmat: null },
      { id: 'containers_40ft', name: 'Containers (40 ft)', category: 'DeckCargo', density: null, unit: 'tonnes', segregation: false, loading_rate: null, discharging_rate: null, weather_sensitive: true, handling_cost: 22.5, hazmat: null },
      { id: 'equipment', name: 'Equipment/Machinery', category: 'DeckCargo', density: null, unit: 'tonnes', segregation: false, loading_rate: null, discharging_rate: null, weather_sensitive: true, handling_cost: 30.0, hazmat: null },
      { id: 'chemical_tanks', name: 'Chemical Tanks/Drums', category: 'DeckCargo', density: null, unit: 'tonnes', segregation: false, loading_rate: null, discharging_rate: null, weather_sensitive: false, handling_cost: 20.0, hazmat: 'Class 8' },
      { id: 'provisions', name: 'Food/Provisions', category: 'DeckCargo', density: null, unit: 'tonnes', segregation: false, loading_rate: null, discharging_rate: null, weather_sensitive: false, handling_cost: 15.0, hazmat: null },
      { id: 'waste_containers', name: 'Waste Containers (Return)', category: 'DeckCargo', density: null, unit: 'tonnes', segregation: false, loading_rate: null, discharging_rate: null, weather_sensitive: false, handling_cost: 20.0, hazmat: 'Class 9' }
    ];

    for (const cargo of cargoTypes) {
      await client.query(`
        INSERT INTO cargo_types (
          id, name, category, density_kg_m3, unit, segregation_required,
          loading_rate_m3h, discharging_rate_m3h, weather_sensitive,
          handling_cost_per_unit, hazmat_class
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          density_kg_m3 = EXCLUDED.density_kg_m3;
      `, [
        cargo.id, cargo.name, cargo.category, cargo.density, cargo.unit,
        cargo.segregation, cargo.loading_rate, cargo.discharging_rate,
        cargo.weather_sensitive, cargo.handling_cost, cargo.hazmat
      ]);
    }

    // ============================================================================
    // 5. CARGO INCOMPATIBILITY MATRIX
    // ============================================================================
    console.log('⚠️  Seeding cargo incompatibility matrix...');
    const incompatibilities = [
      // Diesel
      { c1: 'diesel', c2: 'fresh_water', hours: 4 },
      { c1: 'diesel', c2: 'drilling_mud_wbm', hours: 2 },
      { c1: 'diesel', c2: 'brine', hours: 2 },
      { c1: 'diesel', c2: 'methanol', hours: 8 },
      { c1: 'diesel', c2: 'chemicals', hours: 3 },
      // Fresh Water
      { c1: 'fresh_water', c2: 'drilling_mud_obm', hours: 6 },
      { c1: 'fresh_water', c2: 'drilling_mud_wbm', hours: 4 },
      { c1: 'fresh_water', c2: 'brine', hours: 1 },
      { c1: 'fresh_water', c2: 'methanol', hours: 8 },
      { c1: 'fresh_water', c2: 'chemicals', hours: 4 },
      { c1: 'fresh_water', c2: 'base_oil', hours: 6 },
      // OBM
      { c1: 'drilling_mud_obm', c2: 'drilling_mud_wbm', hours: 6 },
      { c1: 'drilling_mud_obm', c2: 'brine', hours: 4 },
      { c1: 'drilling_mud_obm', c2: 'methanol', hours: 8 },
      { c1: 'drilling_mud_obm', c2: 'chemicals', hours: 4 },
      // WBM
      { c1: 'drilling_mud_wbm', c2: 'brine', hours: 2 },
      { c1: 'drilling_mud_wbm', c2: 'methanol', hours: 8 },
      { c1: 'drilling_mud_wbm', c2: 'chemicals', hours: 4 },
      { c1: 'drilling_mud_wbm', c2: 'base_oil', hours: 4 },
      // Brine
      { c1: 'brine', c2: 'methanol', hours: 8 },
      { c1: 'brine', c2: 'chemicals', hours: 2 },
      { c1: 'brine', c2: 'base_oil', hours: 3 },
      // Methanol (incompatible with everything except itself)
      { c1: 'methanol', c2: 'chemicals', hours: 8 },
      { c1: 'methanol', c2: 'base_oil', hours: 8 },
      // Chemicals
      { c1: 'chemicals', c2: 'base_oil', hours: 3 }
    ];

    for (const inc of incompatibilities) {
      // Ensure alphabetical order for consistency
      const [c1, c2] = inc.c1 < inc.c2 ? [inc.c1, inc.c2] : [inc.c2, inc.c1];
      await client.query(`
        INSERT INTO cargo_incompatibility (cargo_type_id_1, cargo_type_id_2, cleaning_time_h)
        VALUES ($1, $2, $3)
        ON CONFLICT (cargo_type_id_1, cargo_type_id_2) DO UPDATE SET
          cleaning_time_h = EXCLUDED.cleaning_time_h;
      `, [c1, c2, inc.hours]);
    }

    // ============================================================================
    // 6. VESSELS
    // ============================================================================
    console.log('🚢 Seeding vessels...');
    const vessels = [
      // Standard PSV (UT 755 Type)
      {
        id: 'vessel-psv-001',
        name: 'PSV Standard Alpha',
        class: 'StandardPSV',
        loa: 71.9,
        beam: 16.0,
        draught: 5.7,
        deck_capacity: 2450,
        deadweight: 4500,
        service_speed: 15.1,
        operational_speed: 13.0,
        max_speed: 16.0,
        dp_class: 'DP2',
        fuel_transit: 16.5,
        fuel_dp: 4.0,
        fuel_port: 2.5,
        charter_rate: 11500,
        crew_size: 13,
        accommodation: 28,
        status: 'Available',
        location_id: 'macaé',
        lat: -41.7833,
        lon: -22.3833
      },
      {
        id: 'vessel-psv-002',
        name: 'PSV Standard Beta',
        class: 'StandardPSV',
        loa: 71.9,
        beam: 16.0,
        draught: 5.7,
        deck_capacity: 2450,
        deadweight: 4500,
        service_speed: 15.1,
        operational_speed: 13.0,
        max_speed: 16.0,
        dp_class: 'DP2',
        fuel_transit: 16.5,
        fuel_dp: 4.0,
        fuel_port: 2.5,
        charter_rate: 11500,
        crew_size: 13,
        accommodation: 28,
        status: 'Available',
        location_id: 'macaé',
        lat: -41.7833,
        lon: -22.3833
      },
      // Large PSV (UT 874 Type)
      {
        id: 'vessel-psv-003',
        name: 'PSV Large Gamma',
        class: 'LargePSV',
        loa: 88.0,
        beam: 18.2,
        draught: 6.2,
        deck_capacity: 3000,
        deadweight: 5200,
        service_speed: 14.5,
        operational_speed: 12.5,
        max_speed: 15.5,
        dp_class: 'DP2',
        fuel_transit: 20.0,
        fuel_dp: 5.5,
        fuel_port: 3.0,
        charter_rate: 17000,
        crew_size: 14,
        accommodation: 45,
        status: 'Available',
        location_id: 'macaé',
        lat: -41.7833,
        lon: -22.3833
      },
      {
        id: 'vessel-psv-004',
        name: 'PSV Large Delta',
        class: 'LargePSV',
        loa: 88.0,
        beam: 18.2,
        draught: 6.2,
        deck_capacity: 3000,
        deadweight: 5200,
        service_speed: 14.5,
        operational_speed: 12.5,
        max_speed: 15.5,
        dp_class: 'DP3',
        fuel_transit: 20.0,
        fuel_dp: 5.5,
        fuel_port: 3.0,
        charter_rate: 20000,
        crew_size: 14,
        accommodation: 45,
        status: 'Available',
        location_id: 'macaé',
        lat: -41.7833,
        lon: -22.3833
      },
      // CSV
      {
        id: 'vessel-csv-001',
        name: 'CSV Normand Pioneer',
        class: 'CSV',
        loa: 102.0,
        beam: 22.0,
        draught: 7.0,
        deck_capacity: 4000,
        deadweight: 6000,
        service_speed: 13.0,
        operational_speed: 12.0,
        max_speed: 14.0,
        dp_class: 'DP3',
        fuel_transit: 25.0,
        fuel_dp: 8.0,
        fuel_port: 4.0,
        charter_rate: 42500,
        crew_size: 20,
        accommodation: 60,
        status: 'Available',
        location_id: 'macaé',
        lat: -41.7833,
        lon: -22.3833
      },
      // Well Stimulation Vessel
      {
        id: 'vessel-wsv-001',
        name: 'PSV Normand Carioca',
        class: 'WellStimulation',
        loa: 88.0,
        beam: 18.2,
        draught: 6.2,
        deck_capacity: 3000,
        deadweight: 5200,
        service_speed: 14.5,
        operational_speed: 12.5,
        max_speed: 15.5,
        dp_class: 'DP2',
        fuel_transit: 20.0,
        fuel_dp: 5.5,
        fuel_port: 3.0,
        charter_rate: 27500,
        crew_size: 15,
        accommodation: 50,
        status: 'Available',
        location_id: 'macaé',
        lat: -41.7833,
        lon: -22.3833
      }
    ];

    for (const vessel of vessels) {
      await client.query(`
        INSERT INTO vessels (
          id, name, class, loa_m, beam_m, draught_m, deck_cargo_capacity_t,
          total_deadweight_t, service_speed_kts, operational_speed_kts, max_speed_kts,
          dp_class, fuel_consumption_transit_td, fuel_consumption_dp_td, fuel_consumption_port_td,
          charter_rate_daily_usd, crew_size, accommodation_capacity, availability_status,
          current_location_id, current_location_coords
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          ST_SetSRID(ST_MakePoint($21, $22), 4326)::GEOGRAPHY
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          availability_status = EXCLUDED.availability_status,
          updated_at = CURRENT_TIMESTAMP;
      `, [
        vessel.id, vessel.name, vessel.class, vessel.loa, vessel.beam, vessel.draught,
        vessel.deck_capacity, vessel.deadweight, vessel.service_speed, vessel.operational_speed,
        vessel.max_speed, vessel.dp_class, vessel.fuel_transit, vessel.fuel_dp, vessel.fuel_port,
        vessel.charter_rate, vessel.crew_size, vessel.accommodation, vessel.status,
        vessel.location_id, vessel.lat, vessel.lon
      ]);

      // Create vessel schedule
      await client.query(`
        INSERT INTO vessel_schedules (vessel_id, status, next_available, utilization_target)
        VALUES ($1, 'Idle', CURRENT_TIMESTAMP, 0.80)
        ON CONFLICT (vessel_id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP;
      `, [vessel.id]);
    }

    // ============================================================================
    // 7. VESSEL COMPARTMENTS (Standard PSV example)
    // ============================================================================
    console.log('📦 Seeding vessel compartments...');
    const standardPSVCompartments = [
      { vessel_id: 'vessel-psv-001', type: 'LiquidTank', capacity: 994, unit: 'm3', name: 'Diesel Tank' },
      { vessel_id: 'vessel-psv-001', type: 'LiquidTank', capacity: 812, unit: 'm3', name: 'Fresh Water Tank' },
      { vessel_id: 'vessel-psv-001', type: 'LiquidTank', capacity: 2500, unit: 'm3', name: 'Liquid Mud Tank' },
      { vessel_id: 'vessel-psv-001', type: 'DryBulk', capacity: 600, unit: 'm3', name: 'Dry Bulk Tank' },
      { vessel_id: 'vessel-psv-001', type: 'DeckSpace', capacity: 950, unit: 'm2', name: 'Deck Space' }
    ];

    for (let i = 0; i < standardPSVCompartments.length; i++) {
      const comp = standardPSVCompartments[i];
      await client.query(`
        INSERT INTO vessel_compartments (id, vessel_id, compartment_type, capacity, unit)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING;
      `, [`${comp.vessel_id}-comp-${i + 1}`, comp.vessel_id, comp.type, comp.capacity, comp.unit]);
    }

    // ============================================================================
    // 8. INSTALLATION STORAGE CAPACITIES
    // ============================================================================
    console.log('🏭 Seeding installation storage capacities...');
    const storageConfigs = [
      // FPSO Bravo
      { inst: 'fpso-bravo', cargo: 'diesel', max: 2000, current: 1200, safety: 200, reorder: 400, unit: 'm3' },
      { inst: 'fpso-bravo', cargo: 'fresh_water', max: 1500, current: 900, safety: 70, reorder: 200, unit: 'm3' },
      { inst: 'fpso-bravo', cargo: 'chemicals', max: 500, current: 250, safety: 100, reorder: 150, unit: 'm3' },
      { inst: 'fpso-bravo', cargo: 'containers_20ft', max: 50, current: 20, safety: 10, reorder: 15, unit: 'tonnes' },
      // Platform Polvo
      { inst: 'platform-polvo', cargo: 'diesel', max: 500, current: 300, safety: 50, reorder: 100, unit: 'm3' },
      { inst: 'platform-polvo', cargo: 'fresh_water', max: 400, current: 250, safety: 35, reorder: 70, unit: 'm3' },
      { inst: 'platform-polvo', cargo: 'chemicals', max: 100, current: 50, safety: 20, reorder: 30, unit: 'm3' },
      // FPSO Valente
      { inst: 'fpso-valente', cargo: 'diesel', max: 2500, current: 1500, safety: 180, reorder: 500, unit: 'm3' },
      { inst: 'fpso-valente', cargo: 'fresh_water', max: 2000, current: 1200, safety: 52, reorder: 300, unit: 'm3' },
      { inst: 'fpso-valente', cargo: 'chemicals', max: 600, current: 300, safety: 120, reorder: 200, unit: 'm3' },
      { inst: 'fpso-valente', cargo: 'drilling_mud_obm', max: 3000, current: 0, safety: 500, reorder: 1000, unit: 'm3' },
      { inst: 'fpso-valente', cargo: 'containers_20ft', max: 60, current: 30, safety: 15, reorder: 20, unit: 'tonnes' },
      // FPSO Forte
      { inst: 'fpso-forte', cargo: 'diesel', max: 3000, current: 1800, safety: 240, reorder: 600, unit: 'm3' },
      { inst: 'fpso-forte', cargo: 'fresh_water', max: 2500, current: 1500, safety: 60, reorder: 400, unit: 'm3' },
      { inst: 'fpso-forte', cargo: 'chemicals', max: 800, current: 400, safety: 160, reorder: 300, unit: 'm3' },
      { inst: 'fpso-forte', cargo: 'cement', max: 500, current: 0, safety: 100, reorder: 200, unit: 'm3' },
      { inst: 'fpso-forte', cargo: 'containers_20ft', max: 80, current: 40, safety: 20, reorder: 30, unit: 'tonnes' },
      // FPSO Peregrino
      { inst: 'fpso-peregrino', cargo: 'diesel', max: 4000, current: 2400, safety: 320, reorder: 800, unit: 'm3' },
      { inst: 'fpso-peregrino', cargo: 'fresh_water', max: 3500, current: 2100, safety: 90, reorder: 600, unit: 'm3' },
      { inst: 'fpso-peregrino', cargo: 'chemicals', max: 1000, current: 500, safety: 200, reorder: 400, unit: 'm3' },
      { inst: 'fpso-peregrino', cargo: 'containers_20ft', max: 100, current: 50, safety: 25, reorder: 40, unit: 'tonnes' },
      // Peregrino Platforms
      { inst: 'platform-peregrino-a', cargo: 'diesel', max: 300, current: 180, safety: 30, reorder: 60, unit: 'm3' },
      { inst: 'platform-peregrino-b', cargo: 'diesel', max: 300, current: 180, safety: 30, reorder: 60, unit: 'm3' },
      { inst: 'platform-peregrino-c', cargo: 'diesel', max: 300, current: 180, safety: 30, reorder: 60, unit: 'm3' }
    ];

    for (const storage of storageConfigs) {
      await client.query(`
        INSERT INTO installation_storage (
          installation_id, cargo_type_id, max_capacity, current_level,
          safety_stock, reorder_point, unit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (installation_id, cargo_type_id) DO UPDATE SET
          max_capacity = EXCLUDED.max_capacity,
          current_level = EXCLUDED.current_level,
          safety_stock = EXCLUDED.safety_stock,
          reorder_point = EXCLUDED.reorder_point,
          last_updated = CURRENT_TIMESTAMP;
      `, [
        storage.inst, storage.cargo, storage.max, storage.current,
        storage.safety, storage.reorder, storage.unit
      ]);
    }

    // ============================================================================
    // 9. CONSUMPTION PROFILES
    // ============================================================================
    console.log('📊 Seeding consumption profiles...');
    const consumptionProfiles = [
      // FPSO Bravo
      { inst: 'fpso-bravo', cargo: 'diesel', daily: 45, unit: 'm3', std_dev: 5, cv: 0.11, normal: 1.0, drilling: 1.5, workover: 1.2, low: 0.7 },
      { inst: 'fpso-bravo', cargo: 'fresh_water', daily: 40, unit: 'm3', std_dev: 4, cv: 0.10, normal: 1.0, drilling: 1.3, workover: 1.1, low: 0.7 },
      { inst: 'fpso-bravo', cargo: 'chemicals', daily: 14, unit: 'm3', std_dev: 2, cv: 0.14, normal: 1.0, drilling: 1.8, workover: 1.3, low: 0.6 },
      // Platform Polvo
      { inst: 'platform-polvo', cargo: 'diesel', daily: 12, unit: 'm3', std_dev: 2, cv: 0.17, normal: 1.0, drilling: 1.5, workover: 1.2, low: 0.7 },
      { inst: 'platform-polvo', cargo: 'fresh_water', daily: 10, unit: 'm3', std_dev: 1.5, cv: 0.15, normal: 1.0, drilling: 1.3, workover: 1.1, low: 0.7 },
      // FPSO Valente
      { inst: 'fpso-valente', cargo: 'diesel', daily: 45, unit: 'm3', std_dev: 5, cv: 0.11, normal: 1.0, drilling: 1.8, workover: 1.3, low: 0.7 },
      { inst: 'fpso-valente', cargo: 'fresh_water', daily: 35, unit: 'm3', std_dev: 4, cv: 0.11, normal: 1.0, drilling: 1.5, workover: 1.2, low: 0.7 },
      { inst: 'fpso-valente', cargo: 'chemicals', daily: 14, unit: 'm3', std_dev: 2, cv: 0.14, normal: 1.0, drilling: 2.0, workover: 1.5, low: 0.6 },
      { inst: 'fpso-valente', cargo: 'drilling_mud_obm', daily: 0, unit: 'm3', std_dev: 0, cv: 0, normal: 0, drilling: 114, workover: 0, low: 0 },
      // FPSO Forte
      { inst: 'fpso-forte', cargo: 'diesel', daily: 60, unit: 'm3', std_dev: 6, cv: 0.10, normal: 1.0, drilling: 1.5, workover: 1.2, low: 0.7 },
      { inst: 'fpso-forte', cargo: 'fresh_water', daily: 50, unit: 'm3', std_dev: 5, cv: 0.10, normal: 1.0, drilling: 1.3, workover: 1.1, low: 0.7 },
      { inst: 'fpso-forte', cargo: 'chemicals', daily: 17, unit: 'm3', std_dev: 2, cv: 0.12, normal: 1.0, drilling: 1.8, workover: 1.3, low: 0.6 },
      // FPSO Peregrino
      { inst: 'fpso-peregrino', cargo: 'diesel', daily: 85, unit: 'm3', std_dev: 8, cv: 0.09, normal: 1.0, drilling: 1.5, workover: 1.2, low: 0.7 },
      { inst: 'fpso-peregrino', cargo: 'fresh_water', daily: 70, unit: 'm3', std_dev: 7, cv: 0.10, normal: 1.0, drilling: 1.3, workover: 1.1, low: 0.7 },
      { inst: 'fpso-peregrino', cargo: 'chemicals', daily: 27, unit: 'm3', std_dev: 3, cv: 0.11, normal: 1.0, drilling: 1.8, workover: 1.3, low: 0.6 },
      // Peregrino Platforms
      { inst: 'platform-peregrino-a', cargo: 'diesel', daily: 7, unit: 'm3', std_dev: 1, cv: 0.14, normal: 1.0, drilling: 1.5, workover: 1.2, low: 0.7 },
      { inst: 'platform-peregrino-b', cargo: 'diesel', daily: 7, unit: 'm3', std_dev: 1, cv: 0.14, normal: 1.0, drilling: 1.5, workover: 1.2, low: 0.7 },
      { inst: 'platform-peregrino-c', cargo: 'diesel', daily: 7, unit: 'm3', std_dev: 1, cv: 0.14, normal: 1.0, drilling: 1.5, workover: 1.2, low: 0.7 }
    ];

    for (const profile of consumptionProfiles) {
      const profileId = `${profile.inst}-${profile.cargo}`;
      await client.query(`
        INSERT INTO consumption_profiles (
          id, installation_id, cargo_type_id, daily_consumption, unit,
          variability_std_dev, variability_cv, scenario_normal_factor,
          scenario_drilling_factor, scenario_workover_factor, scenario_low_factor
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          daily_consumption = EXCLUDED.daily_consumption,
          variability_std_dev = EXCLUDED.variability_std_dev,
          updated_at = CURRENT_TIMESTAMP;
      `, [
        profileId, profile.inst, profile.cargo, profile.daily, profile.unit,
        profile.std_dev, profile.cv, profile.normal, profile.drilling,
        profile.workover, profile.low
      ]);
    }

    // ============================================================================
    // 10. COST STRUCTURES
    // ============================================================================
    console.log('💰 Seeding cost structures...');
    const costStructures = [
      { vessel_id: 'vessel-psv-001', charter: 11500, fuel: 700, port_dues: 1000, pilotage: 600, agency: 350, doc: 200, crane: 750, personnel: 500 },
      { vessel_id: 'vessel-psv-002', charter: 11500, fuel: 700, port_dues: 1000, pilotage: 600, agency: 350, doc: 200, crane: 750, personnel: 500 },
      { vessel_id: 'vessel-psv-003', charter: 17000, fuel: 700, port_dues: 1000, pilotage: 600, agency: 350, doc: 200, crane: 750, personnel: 500 },
      { vessel_id: 'vessel-psv-004', charter: 20000, fuel: 700, port_dues: 1000, pilotage: 600, agency: 350, doc: 200, crane: 750, personnel: 500 },
      { vessel_id: 'vessel-csv-001', charter: 42500, fuel: 700, port_dues: 1500, pilotage: 800, agency: 500, doc: 300, crane: 1000, personnel: 800 },
      { vessel_id: 'vessel-wsv-001', charter: 27500, fuel: 700, port_dues: 1000, pilotage: 600, agency: 350, doc: 200, crane: 750, personnel: 500 }
    ];

    for (const cost of costStructures) {
      await client.query(`
        INSERT INTO cost_structures (
          id, vessel_id, effective_from, charter_rate_daily_usd, fuel_price_per_tonne_usd,
          port_dues_usd, pilotage_usd, agency_usd, documentation_usd,
          crane_hourly_usd, offshore_personnel_usd
        ) VALUES (
          $1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9, $10
        )
        ON CONFLICT (id) DO UPDATE SET
          charter_rate_daily_usd = EXCLUDED.charter_rate_daily_usd,
          fuel_price_per_tonne_usd = EXCLUDED.fuel_price_per_tonne_usd;
      `, [
        `${cost.vessel_id}-cost`, cost.vessel_id, cost.charter, cost.fuel,
        cost.port_dues, cost.pilotage, cost.agency, cost.doc,
        cost.crane, cost.personnel
      ]);
    }

    // ============================================================================
    // 11. OPERATION WINDOWS
    // ============================================================================
    console.log('⏰ Seeding operation windows...');
    const operationWindows = [
      { type: 'PortLoading', max_wind: 20, max_wave: 2.0, max_current: 1.5, min_vis: 0.5, time_min: 6, time_exp: 8, time_max: 12, eff_day: 1.0, eff_night: 0.9 },
      { type: 'Transit', max_wind: 30, max_wave: 4.5, max_current: null, min_vis: 0.5, time_min: 3, time_exp: 6, time_max: 10, eff_day: 1.0, eff_night: 0.95 },
      { type: 'Approach', max_wind: 20, max_wave: 3.0, max_current: 2.0, min_vis: 1.0, time_min: 0.5, time_exp: 0.75, time_max: 1.0, eff_day: 1.0, eff_night: 0.9 },
      { type: 'LiquidDischarge', max_wind: 18, max_wave: 3.0, max_current: 2.0, min_vis: null, time_min: 0.5, time_exp: 1.0, time_max: 1.5, eff_day: 1.0, eff_night: 0.95 },
      { type: 'BulkDischarge', max_wind: 15, max_wave: 2.5, max_current: 2.0, min_vis: null, time_min: 1.0, time_exp: 1.5, time_max: 2.0, eff_day: 1.0, eff_night: 0.8 },
      { type: 'CraneOps', max_wind: 15, max_wave: 2.5, max_current: 2.0, min_vis: 1.0, time_min: 2.0, time_exp: 3.5, time_max: 5.0, eff_day: 1.0, eff_night: 0.7 }
    ];

    for (const op of operationWindows) {
      await client.query(`
        INSERT INTO operation_windows (
          id, operation_type, max_wind_ms, max_wave_m, max_current_kts, min_visibility_nm,
          time_min_h, time_expected_h, time_max_h, efficiency_day, efficiency_night
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          max_wind_ms = EXCLUDED.max_wind_ms,
          max_wave_m = EXCLUDED.max_wave_m;
      `, [
        `op-${op.type}`, op.type, op.max_wind, op.max_wave, op.max_current, op.min_vis,
        op.time_min, op.time_exp, op.time_max, op.eff_day, op.eff_night
      ]);
    }

    // ============================================================================
    // 12. SEASONAL PATTERNS (Campos Basin)
    // ============================================================================
    console.log('🌊 Seeding seasonal patterns...');
    const months = [
      { month: 1, hs_lt_2: 0.65, hs_2_3: 0.25, hs_3_4: 0.08, hs_gt_4: 0.02, wind_avg: 6.0, workability: 0.70, delay: 0.08 },
      { month: 2, hs_lt_2: 0.60, hs_2_3: 0.28, hs_3_4: 0.10, hs_gt_4: 0.02, wind_avg: 6.5, workability: 0.65, delay: 0.10 },
      { month: 3, hs_lt_2: 0.55, hs_2_3: 0.30, hs_3_4: 0.12, hs_gt_4: 0.03, wind_avg: 7.0, workability: 0.60, delay: 0.12 },
      { month: 4, hs_lt_2: 0.60, hs_2_3: 0.28, hs_3_4: 0.10, hs_gt_4: 0.02, wind_avg: 6.5, workability: 0.65, delay: 0.10 },
      { month: 5, hs_lt_2: 0.65, hs_2_3: 0.25, hs_3_4: 0.08, hs_gt_4: 0.02, wind_avg: 6.0, workability: 0.70, delay: 0.08 },
      { month: 6, hs_lt_2: 0.70, hs_2_3: 0.22, hs_3_4: 0.06, hs_gt_4: 0.02, wind_avg: 5.5, workability: 0.75, delay: 0.06 },
      { month: 7, hs_lt_2: 0.72, hs_2_3: 0.20, hs_3_4: 0.06, hs_gt_4: 0.02, wind_avg: 5.0, workability: 0.78, delay: 0.05 },
      { month: 8, hs_lt_2: 0.70, hs_2_3: 0.22, hs_3_4: 0.06, hs_gt_4: 0.02, wind_avg: 5.5, workability: 0.75, delay: 0.06 },
      { month: 9, hs_lt_2: 0.65, hs_2_3: 0.25, hs_3_4: 0.08, hs_gt_4: 0.02, wind_avg: 6.0, workability: 0.70, delay: 0.08 },
      { month: 10, hs_lt_2: 0.60, hs_2_3: 0.28, hs_3_4: 0.10, hs_gt_4: 0.02, wind_avg: 6.5, workability: 0.65, delay: 0.10 },
      { month: 11, hs_lt_2: 0.55, hs_2_3: 0.30, hs_3_4: 0.12, hs_gt_4: 0.03, wind_avg: 7.0, workability: 0.60, delay: 0.12 },
      { month: 12, hs_lt_2: 0.60, hs_2_3: 0.28, hs_3_4: 0.10, hs_gt_4: 0.02, wind_avg: 6.5, workability: 0.65, delay: 0.10 }
    ];

    for (const month of months) {
      await client.query(`
        INSERT INTO seasonal_patterns (
          id, location, month, wave_dist_hs_lt_2m, wave_dist_hs_2_3m,
          wave_dist_hs_3_4m, wave_dist_hs_gt_4m, wind_avg_ms, workability, delay_probability
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (location, month) DO UPDATE SET
          wave_dist_hs_lt_2m = EXCLUDED.wave_dist_hs_lt_2m,
          workability = EXCLUDED.workability;
      `, [
        `campos-${month.month}`, 'Campos Basin', month.month,
        month.hs_lt_2, month.hs_2_3, month.hs_3_4, month.hs_gt_4,
        month.wind_avg, month.workability, month.delay
      ]);
    }

    await client.query('COMMIT');
    console.log('✅ Database seed completed successfully!');
    
    // Refresh materialized views
    console.log('🔄 Refreshing materialized views...');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_current_inventory;');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vessel_performance;');
    console.log('✅ Materialized views refreshed!');

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seed().catch(console.error);
}

export default seed;