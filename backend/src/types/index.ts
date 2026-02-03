// Data models for PRIO Loading Dashboard (Porto do Açu)
// Based on PRIO logistics operations from references/inventory.md

export type VesselType = 'Standard PSV' | 'Large PSV' | 'CSV' | 'Well Stimulation';

export interface Vessel {
  id: string;
  name: string;
  type: VesselType;
  // Dimensions
  lengthOverall: number; // meters
  beam: number; // meters
  draughtLoaded: number; // meters
  // Capacities
  deckCargoCapacity: number; // tonnes
  clearDeckArea: number; // m²
  totalDeadweight: number; // tonnes
  // Tank capacities (m³)
  fuelOilCapacity: number;
  freshWaterCapacity: number;
  liquidMudCapacity: number;
  dryBulkCapacity: number;
  // Performance
  serviceSpeed: number; // knots
  operationalSpeed: number; // knots
  dpClass: 'DP-1' | 'DP-2' | 'DP-3' | 'None';
  // Status
  status: 'available' | 'in_port' | 'in_transit' | 'at_platform' | 'maintenance';
  currentLocation?: string;
  position?: {
    lat: number;
    lon: number;
  };
}

export type CargoCategory = 'liquid_bulk' | 'dry_bulk' | 'deck_cargo';

export type LiquidCargoType =
  | 'diesel'
  | 'fresh_water'
  | 'drilling_mud_obm'
  | 'drilling_mud_wbm'
  | 'brine'
  | 'methanol'
  | 'chemicals'
  | 'base_oil';

export type DryBulkCargoType =
  | 'cement'
  | 'barite'
  | 'bentonite'
  | 'drilling_chemicals_powder';

export type DeckCargoType =
  | 'drill_pipes'
  | 'casing_pipes'
  | 'containers_20ft'
  | 'containers_40ft'
  | 'equipment'
  | 'chemical_tanks'
  | 'provisions'
  | 'waste_containers';

export interface CargoItem {
  id: string;
  type: LiquidCargoType | DryBulkCargoType | DeckCargoType;
  category: CargoCategory;
  name: string;
  density: number; // kg/m³
  volume?: number; // m³ (for liquid/dry bulk)
  weight?: number; // tonnes (for deck cargo)
  destination: string; // Installation ID
  // Compatibility
  requiresSegregation: boolean;
  incompatibleWith?: string[]; // Cargo type IDs
}

export type CargoCatalogDefinition = Omit<CargoItem, 'id' | 'volume' | 'weight' | 'destination'>;

export interface InstallationSummary {
  id: string;
  name: string;
  distance: number; // nautical miles from base
  type?: string;
  basin?: string;
}

export interface DataOverviewResponse {
  updatedAt: string;
  counts: {
    vessels: number;
    installations: number;
    cargoTypes: number;
    berths: number;
  };
  vessels: Vessel[];
  installations: InstallationSummary[];
  cargoCatalog: CargoCatalogDefinition[];
  berths: Berth[];
  compatibilityRules: CargoCompatibilityRule[];
  breakdowns: {
    fleetByType: Record<string, number>;
    fleetByStatus: Record<string, number>;
    installationsByType: Record<string, number>;
    cargoByCategory: Record<string, number>;
  };
}

export interface Berth {
  id: string;
  name: string;
  port: 'Porto do Açu';
  // Specifications
  maxDraught: number; // meters (21.7m for Porto do Açu)
  maxLength: number; // meters (VLCC-ready for Porto do Açu)
  maxDeadweight: number; // tonnes (Porto do Açu)
  // Status
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  currentVesselId?: string;
  reservedUntil?: Date;
}

export interface LoadingPlan {
  id: string;
  vesselId: string;
  berthId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  cargoItems: CargoItem[];
  estimatedDuration: number; // hours
  // Sequence
  loadingSequence: string[]; // Cargo item IDs in order
  // Validation
  isValid: boolean;
  validationErrors?: string[];
}

export interface CargoCompatibilityRule {
  fromCargo: string;
  toCargo: string;
  cleaningTimeHours: number;
  compatible: boolean;
}

export interface DistanceMatrixEntry {
  fromLocationId: string;
  toLocationId: string;
  distanceNm: number;
  time12ktsHours: number;
  weatherFactorGood: number;
  weatherFactorModerate: number;
  weatherFactorRough: number;
}

export interface InstallationStorageEntry {
  installationId: string;
  cargoTypeId: string;
  maxCapacity: number;
  currentLevel: number;
  safetyStock: number;
  unit: 'm3' | 'tonnes';
}

export type CompartmentType = 'LiquidTank' | 'DryBulk' | 'DeckSpace';

export interface VesselCompartmentSummary {
  id: string;
  vesselId: string;
  compartmentType: CompartmentType;
  capacity: number;
  unit: 'm3' | 'tonnes' | 'm2';
}

export interface VesselScheduleSummary {
  vesselId: string;
  status: 'Loading' | 'Transit' | 'Offshore' | 'Returning' | 'Idle' | 'Maintenance';
  currentTripId?: string;
  nextAvailable?: string;
}
