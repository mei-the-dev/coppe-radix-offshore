export interface Platform {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number; // NM from Porto do Açu
  type: 'FPSO' | 'Platform';
}

export interface Port {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface VesselPosition {
  vesselId: string;
  vesselName: string;
  lat: number;
  lon: number;
  status: 'loading' | 'transit' | 'at_platform' | 'returning';
  destination?: string;
  progress: number; // 0-100
  speed: number; // knots
}

export interface SimulationState {
  isRunning: boolean;
  currentTime: Date;
  weekStart: Date;
  vessels: VesselPosition[];
  loadingOperations: {
    vesselId: string;
    berthId: string;
    startTime: Date;
    endTime: Date;
    progress: number;
  }[];
}
