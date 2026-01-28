/**
 * Mock data for development and testing (references/inventory.md).
 * Grouped by domain: vessels, berths, cargo catalog, compatibility rules.
 * For production, replace with real DB or split into data/vessels.ts, data/berths.ts, etc.
 */
import { Vessel, Berth, CargoItem, CargoCompatibilityRule, VesselType } from '../types';

// Vessel Fleet Data (from inventory.md section 2.1-2.2)
export const mockVessels: Vessel[] = [
  // Standard PSV (UT 755 Type)
  {
    id: 'vessel-001',
    name: 'PSV Standard Alpha',
    type: 'Standard PSV',
    lengthOverall: 71.9,
    beam: 16.0,
    draughtLoaded: 5.7,
    deckCargoCapacity: 2450,
    clearDeckArea: 950,
    totalDeadweight: 4500,
    fuelOilCapacity: 994,
    freshWaterCapacity: 812,
    liquidMudCapacity: 2500,
    dryBulkCapacity: 600,
    serviceSpeed: 15.1,
    operationalSpeed: 13.0,
    dpClass: 'DP-2',
    status: 'available',
    currentLocation: 'Porto do Açu',
  },
  {
    id: 'vessel-002',
    name: 'PSV Standard Beta',
    type: 'Standard PSV',
    lengthOverall: 71.9,
    beam: 16.0,
    draughtLoaded: 5.7,
    deckCargoCapacity: 2450,
    clearDeckArea: 950,
    totalDeadweight: 4500,
    fuelOilCapacity: 994,
    freshWaterCapacity: 812,
    liquidMudCapacity: 2500,
    dryBulkCapacity: 600,
    serviceSpeed: 15.1,
    operationalSpeed: 13.0,
    dpClass: 'DP-2',
    status: 'in_transit',
    currentLocation: 'En route to FPSO Valente',
    position: { lat: -22.5, lon: -40.8 },
  },
  // Large PSV (UT 874 / PX 121 Type)
  {
    id: 'vessel-003',
    name: 'PSV Large Gamma',
    type: 'Large PSV',
    lengthOverall: 88.0,
    beam: 18.2,
    draughtLoaded: 6.2,
    deckCargoCapacity: 3000,
    clearDeckArea: 1120,
    totalDeadweight: 5200,
    fuelOilCapacity: 1350,
    freshWaterCapacity: 1250,
    liquidMudCapacity: 3250,
    dryBulkCapacity: 900,
    serviceSpeed: 14.5,
    operationalSpeed: 12.5,
    dpClass: 'DP-2',
    status: 'at_platform',
    currentLocation: 'FPSO Peregrino',
  },
  {
    id: 'vessel-004',
    name: 'PSV Large Delta',
    type: 'Large PSV',
    lengthOverall: 88.0,
    beam: 18.2,
    draughtLoaded: 6.2,
    deckCargoCapacity: 3000,
    clearDeckArea: 1120,
    totalDeadweight: 5200,
    fuelOilCapacity: 1350,
    freshWaterCapacity: 1250,
    liquidMudCapacity: 3250,
    dryBulkCapacity: 900,
    serviceSpeed: 14.5,
    operationalSpeed: 12.5,
    dpClass: 'DP-3',
    status: 'available',
    currentLocation: 'Porto do Açu',
  },
  // CSV
  {
    id: 'vessel-005',
    name: 'CSV Normand Pioneer',
    type: 'CSV',
    lengthOverall: 102.0,
    beam: 22.0,
    draughtLoaded: 7.0,
    deckCargoCapacity: 4000,
    clearDeckArea: 1500,
    totalDeadweight: 6000,
    fuelOilCapacity: 1500,
    freshWaterCapacity: 1000,
    liquidMudCapacity: 3000,
    dryBulkCapacity: 800,
    serviceSpeed: 13.0,
    operationalSpeed: 12.0,
    dpClass: 'DP-3',
    status: 'maintenance',
    currentLocation: 'Porto do Açu',
  },
];

// Berth Data (Porto do Açu)
export const mockBerths: Berth[] = [
  {
    id: 'berth-001',
    name: 'Berth 1 - Porto do Açu',
    port: 'Porto do Açu',
    maxDraught: 21.7,
    maxLength: 350,
    maxDeadweight: 200000,
    status: 'available',
  },
  {
    id: 'berth-002',
    name: 'Berth 2 - Porto do Açu',
    port: 'Porto do Açu',
    maxDraught: 21.7,
    maxLength: 350,
    maxDeadweight: 200000,
    status: 'occupied',
    currentVesselId: 'vessel-001',
    reservedUntil: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
  },
  {
    id: 'berth-003',
    name: 'Berth 3 - Porto do Açu',
    port: 'Porto do Açu',
    maxDraught: 21.7,
    maxLength: 350,
    maxDeadweight: 200000,
    status: 'available',
  },
];

// Cargo Catalog (from inventory.md section 3.1)
export const mockCargoCatalog: Omit<CargoItem, 'id' | 'volume' | 'weight' | 'destination'>[] = [
  // Liquid Bulk
  {
    type: 'diesel',
    category: 'liquid_bulk',
    name: 'Marine Diesel Oil',
    density: 850,
    requiresSegregation: true,
    incompatibleWith: ['fresh_water', 'methanol'],
  },
  {
    type: 'fresh_water',
    category: 'liquid_bulk',
    name: 'Fresh Water (Potable)',
    density: 1000,
    requiresSegregation: true,
    incompatibleWith: ['diesel', 'drilling_mud_obm', 'drilling_mud_wbm', 'brine', 'methanol', 'chemicals', 'base_oil'],
  },
  {
    type: 'drilling_mud_obm',
    category: 'liquid_bulk',
    name: 'Oil-Based Drilling Mud',
    density: 1300,
    requiresSegregation: true,
    incompatibleWith: ['fresh_water', 'drilling_mud_wbm', 'methanol'],
  },
  {
    type: 'drilling_mud_wbm',
    category: 'liquid_bulk',
    name: 'Water-Based Drilling Mud',
    density: 1200,
    requiresSegregation: true,
    incompatibleWith: ['fresh_water', 'drilling_mud_obm', 'methanol'],
  },
  {
    type: 'brine',
    category: 'liquid_bulk',
    name: 'Brine',
    density: 1200,
    requiresSegregation: true,
    incompatibleWith: ['methanol'],
  },
  {
    type: 'methanol',
    category: 'liquid_bulk',
    name: 'Methanol',
    density: 792,
    requiresSegregation: true,
    incompatibleWith: ['diesel', 'fresh_water', 'drilling_mud_obm', 'drilling_mud_wbm', 'brine', 'chemicals', 'base_oil'],
  },
  {
    type: 'chemicals',
    category: 'liquid_bulk',
    name: 'Chemical Products',
    density: 950,
    requiresSegregation: true,
    incompatibleWith: ['fresh_water', 'methanol'],
  },
  {
    type: 'base_oil',
    category: 'liquid_bulk',
    name: 'Base Oil',
    density: 875,
    requiresSegregation: true,
    incompatibleWith: ['fresh_water', 'drilling_mud_wbm', 'methanol'],
  },
  // Dry Bulk
  {
    type: 'cement',
    category: 'dry_bulk',
    name: 'Cement',
    density: 1500,
    requiresSegregation: false,
  },
  {
    type: 'barite',
    category: 'dry_bulk',
    name: 'Barite',
    density: 3350,
    requiresSegregation: false,
  },
  {
    type: 'bentonite',
    category: 'dry_bulk',
    name: 'Bentonite',
    density: 700,
    requiresSegregation: false,
  },
  {
    type: 'drilling_chemicals_powder',
    category: 'dry_bulk',
    name: 'Drilling Chemicals (Powder)',
    density: 1000,
    requiresSegregation: false,
  },
  // Deck Cargo
  {
    type: 'drill_pipes',
    category: 'deck_cargo',
    name: 'Drill Pipes (40 ft)',
    density: 0, // Not applicable for deck cargo
    requiresSegregation: false,
  },
  {
    type: 'casing_pipes',
    category: 'deck_cargo',
    name: 'Casing Pipes',
    density: 0,
    requiresSegregation: false,
  },
  {
    type: 'containers_20ft',
    category: 'deck_cargo',
    name: 'Containers (20 ft)',
    density: 0,
    requiresSegregation: false,
  },
  {
    type: 'containers_40ft',
    category: 'deck_cargo',
    name: 'Containers (40 ft)',
    density: 0,
    requiresSegregation: false,
  },
  {
    type: 'equipment',
    category: 'deck_cargo',
    name: 'Equipment/Machinery',
    density: 0,
    requiresSegregation: false,
  },
  {
    type: 'chemical_tanks',
    category: 'deck_cargo',
    name: 'Chemical Tanks/Drums',
    density: 0,
    requiresSegregation: false,
  },
  {
    type: 'provisions',
    category: 'deck_cargo',
    name: 'Food/Provisions',
    density: 0,
    requiresSegregation: false,
  },
  {
    type: 'waste_containers',
    category: 'deck_cargo',
    name: 'Waste Containers (Return)',
    density: 0,
    requiresSegregation: false,
  },
];

// Cargo Compatibility Matrix (from inventory.md section 3.3)
export const mockCompatibilityRules: CargoCompatibilityRule[] = [
  // Diesel compatibility
  { fromCargo: 'diesel', toCargo: 'water', cleaningTimeHours: 4, compatible: false },
  { fromCargo: 'diesel', toCargo: 'drilling_mud_obm', cleaningTimeHours: 0, compatible: true },
  { fromCargo: 'diesel', toCargo: 'drilling_mud_wbm', cleaningTimeHours: 2, compatible: false },
  { fromCargo: 'diesel', toCargo: 'brine', cleaningTimeHours: 2, compatible: false },
  { fromCargo: 'diesel', toCargo: 'methanol', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'diesel', toCargo: 'chemicals', cleaningTimeHours: 3, compatible: false },
  { fromCargo: 'diesel', toCargo: 'base_oil', cleaningTimeHours: 0, compatible: true },

  // Water compatibility
  { fromCargo: 'fresh_water', toCargo: 'diesel', cleaningTimeHours: 4, compatible: false },
  { fromCargo: 'fresh_water', toCargo: 'drilling_mud_obm', cleaningTimeHours: 6, compatible: false },
  { fromCargo: 'fresh_water', toCargo: 'drilling_mud_wbm', cleaningTimeHours: 4, compatible: false },
  { fromCargo: 'fresh_water', toCargo: 'brine', cleaningTimeHours: 1, compatible: false },
  { fromCargo: 'fresh_water', toCargo: 'methanol', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'fresh_water', toCargo: 'chemicals', cleaningTimeHours: 4, compatible: false },
  { fromCargo: 'fresh_water', toCargo: 'base_oil', cleaningTimeHours: 6, compatible: false },

  // OBM compatibility
  { fromCargo: 'drilling_mud_obm', toCargo: 'fresh_water', cleaningTimeHours: 6, compatible: false },
  { fromCargo: 'drilling_mud_obm', toCargo: 'drilling_mud_wbm', cleaningTimeHours: 6, compatible: false },
  { fromCargo: 'drilling_mud_obm', toCargo: 'brine', cleaningTimeHours: 4, compatible: false },
  { fromCargo: 'drilling_mud_obm', toCargo: 'methanol', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'drilling_mud_obm', toCargo: 'chemicals', cleaningTimeHours: 4, compatible: false },
  { fromCargo: 'drilling_mud_obm', toCargo: 'base_oil', cleaningTimeHours: 0, compatible: true },

  // WBM compatibility
  { fromCargo: 'drilling_mud_wbm', toCargo: 'diesel', cleaningTimeHours: 2, compatible: false },
  { fromCargo: 'drilling_mud_wbm', toCargo: 'fresh_water', cleaningTimeHours: 4, compatible: false },
  { fromCargo: 'drilling_mud_wbm', toCargo: 'drilling_mud_obm', cleaningTimeHours: 6, compatible: false },
  { fromCargo: 'drilling_mud_wbm', toCargo: 'brine', cleaningTimeHours: 2, compatible: false },
  { fromCargo: 'drilling_mud_wbm', toCargo: 'methanol', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'drilling_mud_wbm', toCargo: 'chemicals', cleaningTimeHours: 4, compatible: false },
  { fromCargo: 'drilling_mud_wbm', toCargo: 'base_oil', cleaningTimeHours: 4, compatible: false },

  // Methanol (most restrictive)
  { fromCargo: 'methanol', toCargo: 'diesel', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'methanol', toCargo: 'fresh_water', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'methanol', toCargo: 'drilling_mud_obm', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'methanol', toCargo: 'drilling_mud_wbm', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'methanol', toCargo: 'brine', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'methanol', toCargo: 'chemicals', cleaningTimeHours: 8, compatible: false },
  { fromCargo: 'methanol', toCargo: 'base_oil', cleaningTimeHours: 8, compatible: false },
];

// Installation destinations (from inventory.md section 1.2)
export const mockInstallations = [
  { id: 'fpso-bravo', name: 'FPSO Bravo (Tubarão Martelo)', distance: 70 }, // NM
  { id: 'platform-polvo', name: 'Platform Polvo A', distance: 70 },
  { id: 'fpso-valente', name: 'FPSO Valente (Frade)', distance: 67 },
  { id: 'fpso-forte', name: 'FPSO Forte (Albacora Leste)', distance: 75 },
  { id: 'fpso-peregrino', name: 'FPSO Peregrino', distance: 46 },
  { id: 'platform-peregrino-a', name: 'Platform Peregrino A', distance: 46 },
  { id: 'platform-peregrino-b', name: 'Platform Peregrino B', distance: 46 },
  { id: 'platform-peregrino-c', name: 'Platform Peregrino C', distance: 46 },
];
