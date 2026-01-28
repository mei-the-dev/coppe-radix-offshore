-- One-off migration: Porto de Macaé → Porto do Açu
-- Run once on existing databases that have supply_bases.id = 'macaé'.
-- Porto do Açu: São João da Barra, RJ. Coords: 21°50'S (-21.8333), 41°00'W (-41.0).
-- Specs: max draught 21.7 m, VLCC-ready (use 350 m length, 200000 t deadweight as placeholder).

-- 1. Insert new supply base (Porto do Açu)
INSERT INTO supply_bases (
  id, name, location, port_code, max_draught_m, max_vessel_length_m,
  max_deadweight_t, operating_hours, num_berths,
  loading_capacity_liquid_m3h, loading_capacity_bulk_m3h, loading_capacity_deck_th,
  cost_port_dues_usd, cost_pilotage_usd, cost_agency_usd, cost_documentation_usd
) VALUES (
  'porto-acu',
  'Porto do Açu',
  ST_SetSRID(ST_MakePoint(-41.0, -21.8333), 4326)::GEOGRAPHY,
  'BRACU',
  21.7,
  350.0,
  200000.0,
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
ON CONFLICT (id) DO NOTHING;

-- 2. Update FKs that reference supply base (only if macaé exists)
UPDATE distance_matrix SET from_location_id = 'porto-acu' WHERE from_location_id = 'macaé';
UPDATE distance_matrix SET to_location_id = 'porto-acu' WHERE to_location_id = 'macaé';
UPDATE vessels
  SET current_location_id = 'porto-acu',
      current_location_coords = ST_SetSRID(ST_MakePoint(-41.0, -21.8333), 4326)::GEOGRAPHY
  WHERE current_location_id = 'macaé';
UPDATE trip_waypoints SET location_id = 'porto-acu' WHERE location_id = 'macaé';
UPDATE weather_forecasts SET location_id = 'porto-acu' WHERE location_id = 'macaé';
UPDATE weather_windows SET location_id = 'porto-acu' WHERE location_id = 'macaé';

-- 3. Remove old supply base
DELETE FROM supply_bases WHERE id = 'macaé';
