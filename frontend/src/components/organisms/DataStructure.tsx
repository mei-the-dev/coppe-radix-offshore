import { useState } from 'react';
import './DataStructure.css';
import { IconVessel, IconPort, IconLoading } from '../../assets/icons';
import { Card } from '../display';
import { Badge } from '../display';
import { Stack } from '../layout';

// Icon components for data structure sections
const IconMapPin = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconCalendar = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconDollar = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconDatabase = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const IconChevronDown = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconChevronRight = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface TableDefinition {
  name: string;
  description: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    description?: string;
  }>;
  primaryKey?: string;
  foreignKeys?: Array<{
    column: string;
    references: string;
    description?: string;
  }>;
  indexes?: string[];
}

interface DataStructureProps {}

export default function DataStructure({}: DataStructureProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Network: true,
  });
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleTable = (tablePath: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tablePath]: !prev[tablePath]
    }));
  };

  const databaseSchema: Record<string, { icon: React.ReactNode; color: string; tables: TableDefinition[] }> = {
    Network: {
      icon: <IconMapPin size={24} />,
      color: 'var(--color-info)',
      tables: [
        {
          name: 'supply_bases',
          description: 'Port facilities and supply bases (e.g., Macaé)',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false, description: 'Primary key' },
            { name: 'name', type: 'VARCHAR(255)', nullable: false },
            { name: 'location', type: 'GEOGRAPHY(POINT, 4326)', nullable: false, description: 'PostGIS geography point' },
            { name: 'port_code', type: 'VARCHAR(10)', nullable: true },
            { name: 'max_draught_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'max_vessel_length_m', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'max_deadweight_t', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'operating_hours', type: 'VARCHAR(50)', nullable: true, description: 'Default: 24/7' },
            { name: 'num_berths', type: 'INTEGER', nullable: true },
            { name: 'loading_capacity_liquid_m3h', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'loading_capacity_bulk_m3h', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'loading_capacity_deck_th', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'cost_port_dues_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'cost_pilotage_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'cost_agency_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'cost_documentation_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['location (GIST)', 'port_code (UNIQUE)'],
        },
        {
          name: 'installations',
          description: 'Offshore platforms (FPSO, Fixed Platform, Wellhead Platform)',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'name', type: 'VARCHAR(255)', nullable: false },
            { name: 'type', type: 'VARCHAR(50)', nullable: true, description: 'FPSO | FixedPlatform | WellheadPlatform' },
            { name: 'location', type: 'GEOGRAPHY(POINT, 4326)', nullable: false },
            { name: 'water_depth_m', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'distance_from_base_nm', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'production_capacity_bpd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'oil_storage_capacity_bbl', type: 'DECIMAL(15,2)', nullable: true },
            { name: 'num_cranes', type: 'INTEGER', nullable: true },
            { name: 'crane_capacity_t', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'deck_area_m2', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'max_simultaneous_vessels', type: 'INTEGER', nullable: true, description: 'Default: 1' },
            { name: 'max_wind_ms', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'max_wave_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'max_current_kts', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'min_visibility_nm', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['location (GIST)'],
        },
        {
          name: 'installation_storage',
          description: 'Inventory levels and storage capacity for each installation',
          primaryKey: '(installation_id, cargo_type_id)',
          foreignKeys: [
            { column: 'installation_id', references: 'installations(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'installation_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'max_capacity', type: 'DECIMAL(12,2)', nullable: false },
            { name: 'current_level', type: 'DECIMAL(12,2)', nullable: true, description: 'Default: 0' },
            { name: 'safety_stock', type: 'DECIMAL(12,2)', nullable: false },
            { name: 'reorder_point', type: 'DECIMAL(12,2)', nullable: false },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true, description: 'm3 | tonnes' },
            { name: 'last_updated', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['installation_id'],
        },
        {
          name: 'distance_matrix',
          description: 'Pre-calculated distances and transit times between locations',
          primaryKey: '(from_location_id, to_location_id)',
          columns: [
            { name: 'from_location_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'to_location_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'distance_nm', type: 'DECIMAL(8,2)', nullable: false },
            { name: 'distance_km', type: 'DECIMAL(8,2)', nullable: false },
            { name: 'time_12kts_h', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'time_14kts_h', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'weather_factor_good', type: 'DECIMAL(4,2)', nullable: true, description: 'Default: 1.0' },
            { name: 'weather_factor_moderate', type: 'DECIMAL(4,2)', nullable: true, description: 'Default: 1.15' },
            { name: 'weather_factor_rough', type: 'DECIMAL(4,2)', nullable: true, description: 'Default: 1.3' },
          ],
        },
      ],
    },
    Fleet: {
      icon: <IconVessel size={24} />,
      color: 'var(--color-success)',
      tables: [
        {
          name: 'vessels',
          description: 'Vessel specifications, capabilities, and current status',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'UNIQUE' },
            { name: 'class', type: 'VARCHAR(50)', nullable: true, description: 'StandardPSV | LargePSV | CSV | WellStimulation' },
            { name: 'loa_m', type: 'DECIMAL(6,2)', nullable: true, description: 'Length overall (meters)' },
            { name: 'beam_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'draught_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'deck_cargo_capacity_t', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'clear_deck_area_m2', type: 'DECIMAL(10,2)', nullable: true, description: 'Clear deck area (m²)' },
            { name: 'total_deadweight_t', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'service_speed_kts', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'operational_speed_kts', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'max_speed_kts', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'dp_class', type: 'VARCHAR(10)', nullable: true, description: 'DP1 | DP2 | DP3 | None' },
            { name: 'fuel_consumption_transit_td', type: 'DECIMAL(8,2)', nullable: true, description: 'Tons per day' },
            { name: 'fuel_consumption_dp_td', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'fuel_consumption_port_td', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'charter_rate_daily_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'crew_size', type: 'INTEGER', nullable: true },
            { name: 'accommodation_capacity', type: 'INTEGER', nullable: true },
            { name: 'availability_status', type: 'VARCHAR(20)', nullable: true, description: 'Available | InUse | Maintenance | Drydock' },
            { name: 'current_location_id', type: 'VARCHAR(50)', nullable: true },
            { name: 'current_location_coords', type: 'GEOGRAPHY(POINT, 4326)', nullable: true },
            { name: 'next_maintenance_due', type: 'DATE', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['name (UNIQUE)', 'current_location_coords (GIST)', 'name (GIN trigram)'],
        },
        {
          name: 'vessel_compartments',
          description: 'Individual cargo compartments (tanks, holds, deck space)',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'vessel_id', references: 'vessels(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'vessel_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'compartment_type', type: 'VARCHAR(50)', nullable: true, description: 'LiquidTank | DryBulk | DeckSpace' },
            { name: 'capacity', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true, description: 'm3 | tonnes | m2' },
            { name: 'current_cargo_id', type: 'VARCHAR(50)', nullable: true },
            { name: 'fill_level', type: 'DECIMAL(5,4)', nullable: true, description: '0-1, Default: 0' },
            { name: 'last_cleaned', type: 'TIMESTAMP', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['vessel_id'],
        },
        {
          name: 'compartment_compatibility',
          description: 'Cargo compatibility rules for compartments',
          primaryKey: '(compartment_id, cargo_type_id)',
          foreignKeys: [
            { column: 'compartment_id', references: 'vessel_compartments(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'compartment_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'compatible', type: 'BOOLEAN', nullable: true, description: 'Default: TRUE' },
            { name: 'cleaning_time_h', type: 'DECIMAL(5,2)', nullable: true, description: 'Default: 0' },
          ],
        },
        {
          name: 'vessel_schedules',
          description: 'Current vessel status and schedule information',
          primaryKey: 'vessel_id',
          foreignKeys: [
            { column: 'vessel_id', references: 'vessels(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'vessel_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'status', type: 'VARCHAR(20)', nullable: true, description: 'Loading | Transit | Offshore | Returning | Idle | Maintenance' },
            { name: 'current_trip_id', type: 'VARCHAR(50)', nullable: true },
            { name: 'next_available', type: 'TIMESTAMP', nullable: true },
            { name: 'utilization_target', type: 'DECIMAL(5,4)', nullable: true, description: 'Default: 0.80' },
            { name: 'ytd_utilization', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
          ],
        },
      ],
    },
    Cargo: {
      icon: <IconLoading size={24} />,
      color: 'var(--color-warning)',
      tables: [
        {
          name: 'cargo_types',
          description: 'Cargo type definitions and properties',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'name', type: 'VARCHAR(255)', nullable: false },
            { name: 'category', type: 'VARCHAR(50)', nullable: true, description: 'Liquid | DryBulk | DeckCargo' },
            { name: 'density_kg_m3', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true, description: 'm3 | tonnes' },
            { name: 'segregation_required', type: 'BOOLEAN', nullable: true, description: 'Default: FALSE' },
            { name: 'loading_rate_m3h', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'discharging_rate_m3h', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'weather_sensitive', type: 'BOOLEAN', nullable: true, description: 'Default: FALSE' },
            { name: 'handling_cost_per_unit', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'storage_temp_c', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'hazmat_class', type: 'VARCHAR(20)', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
          ],
        },
        {
          name: 'cargo_incompatibility',
          description: 'Segregation rules between incompatible cargo types',
          primaryKey: '(cargo_type_id_1, cargo_type_id_2)',
          foreignKeys: [
            { column: 'cargo_type_id_1', references: 'cargo_types(id)' },
            { column: 'cargo_type_id_2', references: 'cargo_types(id)' },
          ],
          columns: [
            { name: 'cargo_type_id_1', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type_id_2', type: 'VARCHAR(50)', nullable: false },
            { name: 'cleaning_time_h', type: 'DECIMAL(5,2)', nullable: false },
          ],
        },
        {
          name: 'consumption_profiles',
          description: 'Installation consumption patterns by cargo type',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'installation_id', references: 'installations(id)', description: 'ON DELETE CASCADE' },
            { column: 'cargo_type_id', references: 'cargo_types(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'installation_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'daily_consumption', type: 'DECIMAL(12,2)', nullable: false },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true },
            { name: 'variability_std_dev', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'variability_cv', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'scenario_normal_factor', type: 'DECIMAL(5,3)', nullable: true, description: 'Default: 1.0' },
            { name: 'scenario_drilling_factor', type: 'DECIMAL(5,3)', nullable: true, description: 'Default: 1.5' },
            { name: 'scenario_workover_factor', type: 'DECIMAL(5,3)', nullable: true, description: 'Default: 1.2' },
            { name: 'scenario_low_factor', type: 'DECIMAL(5,3)', nullable: true, description: 'Default: 0.7' },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['(installation_id, cargo_type_id) UNIQUE', '(installation_id, cargo_type_id)'],
        },
        {
          name: 'consumption_weekly_pattern',
          description: 'Day-of-week consumption factors',
          primaryKey: '(profile_id, day_of_week)',
          foreignKeys: [
            { column: 'profile_id', references: 'consumption_profiles(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'profile_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'day_of_week', type: 'INTEGER', nullable: false, description: '0-6 (Sunday-Saturday)' },
            { name: 'factor', type: 'DECIMAL(5,3)', nullable: true, description: 'Default: 1.0' },
          ],
        },
        {
          name: 'consumption_monthly_pattern',
          description: 'Month-of-year consumption factors',
          primaryKey: '(profile_id, month)',
          foreignKeys: [
            { column: 'profile_id', references: 'consumption_profiles(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'profile_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'month', type: 'INTEGER', nullable: false, description: '1-12' },
            { name: 'factor', type: 'DECIMAL(5,3)', nullable: true, description: 'Default: 1.0' },
          ],
        },
        {
          name: 'demands',
          description: 'Delivery requirements from installations',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'installation_id', references: 'installations(id)' },
            { column: 'cargo_type_id', references: 'cargo_types(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'installation_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'quantity', type: 'DECIMAL(12,2)', nullable: false },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true },
            { name: 'earliest_delivery', type: 'TIMESTAMP', nullable: false },
            { name: 'latest_delivery', type: 'TIMESTAMP', nullable: false },
            { name: 'priority', type: 'VARCHAR(20)', nullable: true, description: 'Critical | High | Normal | Low' },
            { name: 'scenario', type: 'VARCHAR(50)', nullable: true, description: 'Normal | Drilling | Workover | Emergency' },
            { name: 'penalty_late_per_day', type: 'DECIMAL(12,2)', nullable: true, description: 'Default: 0' },
            { name: 'forecast_accuracy', type: 'DECIMAL(5,4)', nullable: true, description: 'Default: 0.85' },
            { name: 'status', type: 'VARCHAR(20)', nullable: true, description: 'Forecast | Planned | Confirmed | InProgress | Fulfilled | Cancelled' },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['installation_id', 'status'],
        },
        {
          name: 'orders',
          description: 'Fulfillment orders created from demands',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'demand_id', references: 'demands(id)' },
            { column: 'assigned_vessel_id', references: 'vessels(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'demand_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'status', type: 'VARCHAR(20)', nullable: true, description: 'Planned | Confirmed | Loading | InTransit | Delivered | Cancelled' },
            { name: 'assigned_vessel_id', type: 'VARCHAR(50)', nullable: true },
            { name: 'scheduled_departure', type: 'TIMESTAMP', nullable: true },
            { name: 'actual_departure', type: 'TIMESTAMP', nullable: true },
            { name: 'estimated_arrival', type: 'TIMESTAMP', nullable: true },
            { name: 'actual_arrival', type: 'TIMESTAMP', nullable: true },
            { name: 'total_weight_t', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'total_volume_m3', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['assigned_vessel_id', 'status'],
        },
        {
          name: 'order_items',
          description: 'Individual cargo items within an order',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'order_id', references: 'orders(id)', description: 'ON DELETE CASCADE' },
            { column: 'cargo_type_id', references: 'cargo_types(id)' },
            { column: 'compartment_id', references: 'vessel_compartments(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'order_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'quantity', type: 'DECIMAL(12,2)', nullable: false },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true },
            { name: 'compartment_id', type: 'VARCHAR(50)', nullable: true },
            { name: 'loaded', type: 'BOOLEAN', nullable: true, description: 'Default: FALSE' },
            { name: 'delivered', type: 'BOOLEAN', nullable: true, description: 'Default: FALSE' },
          ],
        },
        {
          name: 'backhaul_cargo',
          description: 'Cargo to be returned from installations',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'order_id', references: 'orders(id)', description: 'ON DELETE CASCADE' },
            { column: 'installation_id', references: 'installations(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'order_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'installation_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type', type: 'VARCHAR(100)', nullable: true },
            { name: 'quantity', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true },
            { name: 'notes', type: 'TEXT', nullable: true },
          ],
        },
      ],
    },
    Operations: {
      icon: <IconCalendar size={24} />,
      color: 'var(--color-primary-600)',
      tables: [
        {
          name: 'trips',
          description: 'Vessel trip records with cost tracking',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'vessel_id', references: 'vessels(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'vessel_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'status', type: 'VARCHAR(20)', nullable: true, description: 'Planned | InProgress | Completed | Cancelled | Delayed' },
            { name: 'planned_departure', type: 'TIMESTAMP', nullable: true },
            { name: 'actual_departure', type: 'TIMESTAMP', nullable: true },
            { name: 'planned_arrival', type: 'TIMESTAMP', nullable: true },
            { name: 'actual_arrival', type: 'TIMESTAMP', nullable: true },
            { name: 'total_distance_nm', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'total_duration_h', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'fuel_consumed_t', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'fuel_cost_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'charter_cost_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'port_costs_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'offshore_costs_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'handling_costs_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'total_cost_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'optimization_run_id', type: 'VARCHAR(50)', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
          ],
          indexes: ['vessel_id', 'status', 'actual_departure'],
        },
        {
          name: 'trip_waypoints',
          description: 'Route waypoints for each trip',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'trip_id', references: 'trips(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'trip_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'sequence', type: 'INTEGER', nullable: false },
            { name: 'location_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'location_type', type: 'VARCHAR(50)', nullable: true, description: 'SupplyBase | Installation' },
            { name: 'planned_arrival', type: 'TIMESTAMP', nullable: true },
            { name: 'actual_arrival', type: 'TIMESTAMP', nullable: true },
            { name: 'planned_departure', type: 'TIMESTAMP', nullable: true },
            { name: 'actual_departure', type: 'TIMESTAMP', nullable: true },
            { name: 'operation_type', type: 'VARCHAR(50)', nullable: true },
            { name: 'service_time_h', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'weather_delay_h', type: 'DECIMAL(6,2)', nullable: true },
          ],
          indexes: ['(trip_id, sequence) UNIQUE', '(trip_id, sequence)'],
        },
        {
          name: 'trip_cargo_manifest',
          description: 'Cargo manifest for each trip waypoint',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'trip_id', references: 'trips(id)', description: 'ON DELETE CASCADE' },
            { column: 'waypoint_id', references: 'trip_waypoints(id)' },
            { column: 'order_item_id', references: 'order_items(id)' },
            { column: 'cargo_type_id', references: 'cargo_types(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'trip_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'waypoint_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'order_item_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'quantity', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true },
            { name: 'action', type: 'VARCHAR(20)', nullable: true, description: 'Load | Discharge' },
          ],
        },
        {
          name: 'trip_delays',
          description: 'Delay tracking for trips',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'trip_id', references: 'trips(id)', description: 'ON DELETE CASCADE' },
            { column: 'waypoint_id', references: 'trip_waypoints(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'trip_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'waypoint_id', type: 'VARCHAR(50)', nullable: true },
            { name: 'reason', type: 'VARCHAR(255)', nullable: false },
            { name: 'delay_type', type: 'VARCHAR(50)', nullable: true, description: 'Weather | Equipment | PortCongestion | CraneUnavailable | Other' },
            { name: 'duration_h', type: 'DECIMAL(6,2)', nullable: false },
            { name: 'location', type: 'VARCHAR(255)', nullable: true },
            { name: 'recorded_at', type: 'TIMESTAMP', nullable: false },
          ],
        },
        {
          name: 'operation_windows',
          description: 'Weather and time limits for different operation types',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'operation_type', type: 'VARCHAR(50)', nullable: false },
            { name: 'max_wind_ms', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'max_wave_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'max_current_kts', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'min_visibility_nm', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'time_min_h', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'time_expected_h', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'time_max_h', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'efficiency_day', type: 'DECIMAL(5,4)', nullable: true, description: 'Default: 1.0' },
            { name: 'efficiency_night', type: 'DECIMAL(5,4)', nullable: true, description: 'Default: 0.85' },
          ],
        },
        {
          name: 'time_windows',
          description: 'Available operation time windows for installations',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'installation_id', references: 'installations(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'installation_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'date', type: 'DATE', nullable: false },
            { name: 'start_time', type: 'TIME', nullable: true },
            { name: 'end_time', type: 'TIME', nullable: true },
            { name: 'available', type: 'BOOLEAN', nullable: true, description: 'Default: TRUE' },
            { name: 'conflict_type', type: 'VARCHAR(100)', nullable: true },
            { name: 'preference_score', type: 'DECIMAL(5,4)', nullable: true, description: 'Default: 1.0' },
          ],
          indexes: ['(installation_id, date, start_time) UNIQUE', '(installation_id, date)'],
        },
      ],
    },
    Environment: {
      icon: <IconPort size={24} />,
      color: 'var(--color-info-light)',
      tables: [
        {
          name: 'weather_forecasts',
          description: 'Time-series weather forecast data (TimescaleDB hypertable)',
          primaryKey: '(location_id, timestamp, forecast_horizon_h)',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: true },
            { name: 'location_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'timestamp', type: 'TIMESTAMPTZ', nullable: false },
            { name: 'forecast_horizon_h', type: 'INTEGER', nullable: false },
            { name: 'wave_height_min_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'wave_height_mean_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'wave_height_max_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'wind_speed_min_ms', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'wind_speed_mean_ms', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'wind_speed_max_ms', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'wind_direction', type: 'VARCHAR(10)', nullable: true },
            { name: 'current_speed_kts', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'visibility_nm', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'forecast_accuracy', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'weather_state', type: 'VARCHAR(20)', nullable: true, description: 'Good | Moderate | Rough | Severe' },
            { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false },
          ],
          indexes: ['(location_id, timestamp DESC)', 'timestamp (TimescaleDB)'],
        },
        {
          name: 'seasonal_patterns',
          description: 'Historical seasonal weather patterns',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'location', type: 'VARCHAR(255)', nullable: false },
            { name: 'month', type: 'INTEGER', nullable: false, description: '1-12' },
            { name: 'wave_dist_hs_lt_2m', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'wave_dist_hs_2_3m', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'wave_dist_hs_3_4m', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'wave_dist_hs_gt_4m', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'wind_avg_ms', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'workability', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'delay_probability', type: 'DECIMAL(5,4)', nullable: true },
          ],
          indexes: ['(location, month) UNIQUE'],
        },
        {
          name: 'weather_windows',
          description: 'Suitable weather windows for operations',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'location_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'operation_type', type: 'VARCHAR(50)', nullable: true },
            { name: 'start_time', type: 'TIMESTAMPTZ', nullable: false },
            { name: 'end_time', type: 'TIMESTAMPTZ', nullable: false },
            { name: 'duration_h', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'confidence', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'condition_wave_m', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'condition_wind_ms', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'condition_current_kts', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'condition_visibility_nm', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'suitable', type: 'BOOLEAN', nullable: true, description: 'Default: TRUE' },
            { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false },
          ],
          indexes: ['(location_id, start_time, end_time)'],
        },
      ],
    },
    Costs: {
      icon: <IconDollar size={24} />,
      color: 'var(--color-error)',
      tables: [
        {
          name: 'cost_structures',
          description: 'Vessel cost structures with effective dates',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'vessel_id', references: 'vessels(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'vessel_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'effective_from', type: 'DATE', nullable: false },
            { name: 'effective_to', type: 'DATE', nullable: true },
            { name: 'charter_rate_daily_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'fuel_price_per_tonne_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'port_dues_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'pilotage_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'agency_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'documentation_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'crane_hourly_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'offshore_personnel_usd', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
          ],
        },
        {
          name: 'handling_costs',
          description: 'Cargo-specific handling costs',
          primaryKey: '(cost_structure_id, cargo_type_id)',
          foreignKeys: [
            { column: 'cost_structure_id', references: 'cost_structures(id)', description: 'ON DELETE CASCADE' },
            { column: 'cargo_type_id', references: 'cargo_types(id)' },
          ],
          columns: [
            { name: 'cost_structure_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cargo_type_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'cost_per_unit', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'unit', type: 'VARCHAR(20)', nullable: true },
          ],
        },
        {
          name: 'trip_costs',
          description: 'Calculated costs for completed trips',
          primaryKey: 'trip_id',
          foreignKeys: [
            { column: 'trip_id', references: 'trips(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'trip_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'charter_cost_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'fuel_cost_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'port_costs_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'offshore_costs_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'handling_costs_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'total_cost_usd', type: 'DECIMAL(12,2)', nullable: true },
            { name: 'cost_per_tonne', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'cost_per_nm', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'calculated_at', type: 'TIMESTAMP', nullable: false },
          ],
        },
        {
          name: 'penalty_costs',
          description: 'Penalty costs for late or incomplete deliveries',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'order_id', references: 'orders(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'order_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'penalty_type', type: 'VARCHAR(50)', nullable: true, description: 'LateDelivery | IncompleteDelivery | Stockout | ProductionLoss' },
            { name: 'amount_usd', type: 'DECIMAL(15,2)', nullable: false },
            { name: 'duration_h', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'reason', type: 'TEXT', nullable: true },
            { name: 'incurred_at', type: 'TIMESTAMP', nullable: false },
          ],
        },
      ],
    },
    Optimization: {
      icon: <IconDatabase size={24} />,
      color: 'var(--color-primary-500)',
      tables: [
        {
          name: 'optimization_runs',
          description: 'Optimization execution records',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'timestamp', type: 'TIMESTAMPTZ', nullable: false },
            { name: 'planning_horizon_start', type: 'TIMESTAMPTZ', nullable: false },
            { name: 'planning_horizon_end', type: 'TIMESTAMPTZ', nullable: false },
            { name: 'objective_function', type: 'TEXT', nullable: true },
            { name: 'solver', type: 'VARCHAR(100)', nullable: true },
            { name: 'solution_time_s', type: 'DECIMAL(10,3)', nullable: true },
            { name: 'objective_value', type: 'DECIMAL(20,2)', nullable: true },
            { name: 'gap', type: 'DECIMAL(8,6)', nullable: true },
            { name: 'status', type: 'VARCHAR(50)', nullable: true },
            { name: 'num_vessels', type: 'INTEGER', nullable: true },
            { name: 'num_installations', type: 'INTEGER', nullable: true },
            { name: 'num_demands', type: 'INTEGER', nullable: true },
            { name: 'constraints', type: 'TEXT', nullable: true },
            { name: 'parameters', type: 'JSONB', nullable: true },
            { name: 'created_by', type: 'VARCHAR(100)', nullable: true },
          ],
        },
        {
          name: 'optimization_scenarios',
          description: 'Scenarios used in optimization runs',
          primaryKey: '(run_id, scenario_name)',
          foreignKeys: [
            { column: 'run_id', references: 'optimization_runs(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'run_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'scenario_name', type: 'VARCHAR(100)', nullable: false },
            { name: 'scenario_type', type: 'VARCHAR(50)', nullable: true },
            { name: 'parameters', type: 'JSONB', nullable: true },
          ],
        },
        {
          name: 'solutions',
          description: 'Optimization solution results',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'optimization_run_id', references: 'optimization_runs(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'optimization_run_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'total_cost_usd', type: 'DECIMAL(20,2)', nullable: true },
            { name: 'total_distance_nm', type: 'DECIMAL(15,2)', nullable: true },
            { name: 'fleet_utilization', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'num_trips', type: 'INTEGER', nullable: true },
            { name: 'num_unmet_demands', type: 'INTEGER', nullable: true },
            { name: 'feasible', type: 'BOOLEAN', nullable: true, description: 'Default: TRUE' },
            { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false },
          ],
        },
        {
          name: 'solution_trips',
          description: 'Trip assignments in optimization solutions',
          primaryKey: '(solution_id, trip_id)',
          foreignKeys: [
            { column: 'solution_id', references: 'solutions(id)', description: 'ON DELETE CASCADE' },
            { column: 'trip_id', references: 'trips(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'solution_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'trip_id', type: 'VARCHAR(50)', nullable: false },
          ],
        },
        {
          name: 'unmet_demands',
          description: 'Demands not fulfilled in optimization solution',
          primaryKey: 'id',
          foreignKeys: [
            { column: 'solution_id', references: 'solutions(id)', description: 'ON DELETE CASCADE' },
            { column: 'demand_id', references: 'demands(id)' },
          ],
          columns: [
            { name: 'id', type: 'VARCHAR(50)', nullable: false },
            { name: 'solution_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'demand_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'reason', type: 'TEXT', nullable: true },
            { name: 'shortfall_quantity', type: 'DECIMAL(12,2)', nullable: true },
          ],
        },
        {
          name: 'kpis',
          description: 'Key performance indicators for optimization solutions',
          primaryKey: 'solution_id',
          foreignKeys: [
            { column: 'solution_id', references: 'solutions(id)', description: 'ON DELETE CASCADE' },
          ],
          columns: [
            { name: 'solution_id', type: 'VARCHAR(50)', nullable: false },
            { name: 'vessel_utilization', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'on_time_delivery_rate', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'avg_trip_duration_h', type: 'DECIMAL(8,2)', nullable: true },
            { name: 'cost_per_tonne', type: 'DECIMAL(10,2)', nullable: true },
            { name: 'fuel_efficiency_t_per_nm', type: 'DECIMAL(6,4)', nullable: true },
            { name: 'emergency_response_time_h', type: 'DECIMAL(6,2)', nullable: true },
            { name: 'weather_delay_rate', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'backhaul_rate', type: 'DECIMAL(5,4)', nullable: true },
            { name: 'total_emissions_co2_t', type: 'DECIMAL(15,2)', nullable: true },
            { name: 'calculated_at', type: 'TIMESTAMPTZ', nullable: false },
          ],
        },
      ],
    },
  };

  const materializedViews = [
    {
      name: 'mv_current_inventory',
      description: 'Current inventory levels with status indicators',
      columns: [
        'installation_id', 'installation_name', 'cargo_type_id', 'cargo_name',
        'current_level', 'max_capacity', 'safety_stock', 'reorder_point',
        'unit', 'inventory_status', 'last_updated'
      ],
    },
    {
      name: 'mv_vessel_performance',
      description: 'Vessel performance metrics (90-day rolling)',
      columns: [
        'vessel_id', 'vessel_name', 'class', 'total_trips',
        'avg_trip_duration', 'total_distance', 'avg_fuel_efficiency',
        'total_cost', 'completion_rate'
      ],
    },
  ];

  const renderTable = (table: TableDefinition, sectionName: string) => {
    const tablePath = `${sectionName}.${table.name}`;
    const isExpanded = expandedTables[tablePath];

    return (
      <Card key={table.name} variant="outlined" padding="md" className="data-table-card">
        <div
          className="data-table-header"
          onClick={() => toggleTable(tablePath)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleTable(tablePath)}
        >
          <div className="data-table-header-content">
            {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            <div className="data-table-info">
              <h3 className="data-table-name">{table.name}</h3>
              {table.description && (
                <p className="data-table-description">{table.description}</p>
              )}
            </div>
            <Badge variant="info" size="sm">
              {table.columns.length} columns
            </Badge>
          </div>
        </div>

        {isExpanded && (
          <div className="data-table-content">
            {table.primaryKey && (
              <div className="data-table-meta">
                <strong>Primary Key:</strong> <code>{table.primaryKey}</code>
              </div>
            )}

            {table.foreignKeys && table.foreignKeys.length > 0 && (
              <div className="data-table-meta">
                <strong>Foreign Keys:</strong>
                <ul className="data-table-fk-list">
                  {table.foreignKeys.map((fk, idx) => (
                    <li key={idx}>
                      <code>{fk.column}</code> → <code>{fk.references}</code>
                      {fk.description && <span className="fk-note"> ({fk.description})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {table.indexes && table.indexes.length > 0 && (
              <div className="data-table-meta">
                <strong>Indexes:</strong>
                <ul className="data-table-index-list">
                  {table.indexes.map((idx, idxIdx) => (
                    <li key={idxIdx}><code>{idx}</code></li>
                  ))}
                </ul>
              </div>
            )}

            <div className="data-table-columns">
              <h4 className="data-table-columns-title">Columns</h4>
              <div className="data-table-columns-grid">
                {table.columns.map((column, idx) => (
                  <div key={idx} className="data-column">
                    <div className="data-column-header">
                      <code className="data-column-name">{column.name}</code>
                      {!column.nullable && (
                        <Badge variant="error" size="sm">NOT NULL</Badge>
                      )}
                    </div>
                    <div className="data-column-type">
                      <code>{column.type}</code>
                    </div>
                    {column.description && (
                      <div className="data-column-description">{column.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderSection = (sectionName: string, sectionData: { icon: React.ReactNode; color: string; tables: TableDefinition[] }) => {
    const isExpanded = expandedSections[sectionName];

    return (
      <Card key={sectionName} className="metrics-section" variant="outlined">
        <div
          className="metrics-section-header"
          style={{ borderLeftColor: sectionData.color, borderLeftWidth: '5px', borderLeftStyle: 'solid' }}
          onClick={() => toggleSection(sectionName)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSection(sectionName)}
        >
          <div className="metrics-section-title">
            <div style={{ color: sectionData.color }}>
              {sectionData.icon}
            </div>
            <h2>{sectionName}</h2>
            <Badge variant="info" size="sm">{sectionData.tables.length} tables</Badge>
          </div>
          <span className="metrics-section-toggle">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
        {isExpanded && (
          <div className="metrics-section-content">
            <Stack direction="column" gap="md">
              {sectionData.tables.map(table => renderTable(table, sectionName))}
            </Stack>
          </div>
        )}
      </Card>
    );
  };

  const totalTables = Object.values(databaseSchema).reduce((sum, section) => sum + section.tables.length, 0);
  const totalColumns = Object.values(databaseSchema).reduce(
    (sum, section) => sum + section.tables.reduce((tableSum, table) => tableSum + table.columns.length, 0),
    0
  );

  return (
    <div className="metrics-report">
      <div className="metrics-header">
        <h1>
          <IconDatabase size={32} />
          PRIO Offshore Logistics Database Schema
        </h1>
        <p className="metrics-subtitle">
          PostgreSQL database schema with PostGIS and TimescaleDB extensions.
          Click on sections and tables to expand and view detailed column definitions.
        </p>
        <div className="metrics-meta">
          <Badge variant="info" size="sm">{Object.keys(databaseSchema).length} Domains</Badge>
          <Badge variant="info" size="sm">{totalTables} Tables</Badge>
          <Badge variant="info" size="sm">{totalColumns} Columns</Badge>
          <Badge variant="info" size="sm">{materializedViews.length} Materialized Views</Badge>
        </div>
      </div>

      <div>
        {Object.entries(databaseSchema).map(([sectionName, sectionData]) =>
          renderSection(sectionName, sectionData)
        )}
      </div>

      {materializedViews.length > 0 && (
        <Card className="metrics-section">
          <div className="metrics-section-header">
            <div className="metrics-section-title">
              <IconDatabase size={24} />
              <h2>Materialized Views</h2>
            </div>
          </div>
          <div className="metrics-section-content">
            <Stack direction="column" gap="md">
              {materializedViews.map(view => (
                <Card key={view.name} variant="outlined" padding="md">
                  <h3 className="view-name">{view.name}</h3>
                  <p className="view-description">{view.description}</p>
                  <div className="view-columns">
                    <strong>Columns:</strong> {view.columns.join(', ')}
                  </div>
                </Card>
              ))}
            </Stack>
          </div>
        </Card>
      )}

      <Card className="metrics-section">
        <div className="metrics-section-header">
          <div className="metrics-section-title">
            <IconDatabase size={24} />
            <h2>Database Features</h2>
          </div>
        </div>
        <div className="metrics-section-content">
          <ul className="notes-list">
            <li>• <strong>PostGIS</strong>: Geographic data types (GEOGRAPHY) for location storage</li>
            <li>• <strong>TimescaleDB</strong>: Time-series hypertable for weather_forecasts</li>
            <li>• <strong>pg_trgm</strong>: Trigram indexes for text search on vessel and installation names</li>
            <li>• <strong>Automatic triggers</strong>: Update timestamps and cost calculations</li>
            <li>• <strong>Materialized views</strong>: Pre-computed analytics for inventory and performance</li>
            <li>• <strong>Foreign key constraints</strong>: Referential integrity with CASCADE deletes where appropriate</li>
            <li>• <strong>Check constraints</strong>: Data validation (enums, ranges, uniqueness)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
