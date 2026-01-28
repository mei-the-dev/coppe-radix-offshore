// Frontend types matching backend API

export type VesselType = 'Standard PSV' | 'Large PSV' | 'CSV' | 'Well Stimulation';

export interface Vessel {
  id: string;
  name: string;
  type: VesselType;
  lengthOverall: number;
  beam: number;
  draughtLoaded: number;
  deckCargoCapacity: number;
  clearDeckArea: number;
  totalDeadweight: number;
  fuelOilCapacity: number;
  freshWaterCapacity: number;
  liquidMudCapacity: number;
  dryBulkCapacity: number;
  serviceSpeed: number;
  operationalSpeed: number;
  dpClass: 'DP-1' | 'DP-2' | 'DP-3' | 'None';
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
  density: number;
  volume?: number;
  weight?: number;
  destination: string;
  requiresSegregation: boolean;
  incompatibleWith?: string[];
}

export interface Berth {
  id: string;
  name: string;
  port: 'Porto do Açu';
  maxDraught: number;
  maxLength: number;
  maxDeadweight: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  currentVesselId?: string;
  reservedUntil?: string;
}

export interface LoadingPlan {
  id: string;
  vesselId: string;
  berthId: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  cargoItems: CargoItem[];
  estimatedDuration: number;
  loadingSequence: string[];
  isValid: boolean;
  validationErrors?: string[];
}

export interface Installation {
  id: string;
  name: string;
  distance: number; // NM
}

// Re-export trip types
export * from './trips';
