// Trip and route types for logistics visualization

export type TripStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled' | 'Delayed';

export interface TripWaypoint {
  sequence: number;
  location_id: string;
  location_name: string;
  type: 'SupplyBase' | 'Installation';
  planned_arrival: string | null;
  actual_arrival: string | null;
  planned_departure: string | null;
  actual_departure: string | null;
  operations: string[];
}

export interface TripCargoItem {
  cargo_type_id: string;
  cargo_name: string;
  quantity: number;
  unit: string;
  action: 'Load' | 'Discharge';
  waypoint_sequence: number;
}

export interface TripMetrics {
  total_distance_nm: number;
  total_duration_h: number;
  fuel_consumed_t: number;
  total_cost_usd: number;
}

export interface Trip {
  id: string;
  vessel_id: string;
  vessel_name?: string;
  status: TripStatus;
  route: TripWaypoint[];
  cargo_manifest: TripCargoItem[];
  metrics: TripMetrics;
  delays?: Array<{
    reason: string;
    delay_type: string;
    duration_h: number;
    location: string;
  }>;
  weather_impact?: string;
}
