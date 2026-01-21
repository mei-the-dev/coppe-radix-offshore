// Platform coordinates for simulation
// Based on distances from Macaé and Campos Basin locations
// Macaé: 22°23'S, 41°47'W

export interface Platform {
  id: string;
  name: string;
  lat: number; // Decimal degrees
  lon: number; // Decimal degrees
  distance: number; // NM from Macaé
  type: 'FPSO' | 'Platform';
}

export const macaePort = {
  id: 'macaé',
  name: 'Port of Macaé',
  lat: -22.3833, // 22°23'S
  lon: -41.7833, // 41°47'W
};

// Approximate coordinates based on distances and Campos Basin location
// Southern Campos: ~22.5°S, 40.5°W
// Northern Campos: ~21.5°S, 40.0°W
export const platforms: Platform[] = [
  {
    id: 'fpso-bravo',
    name: 'FPSO Bravo',
    lat: -22.5, // Southern Campos
    lon: -40.5,
    distance: 70, // NM
    type: 'FPSO',
  },
  {
    id: 'platform-polvo',
    name: 'Platform Polvo A',
    lat: -22.6, // Close to FPSO Bravo
    lon: -40.6,
    distance: 70, // NM
    type: 'Platform',
  },
  {
    id: 'fpso-valente',
    name: 'FPSO Valente',
    lat: -21.8, // Northern Campos
    lon: -40.2,
    distance: 67, // NM
    type: 'FPSO',
  },
  {
    id: 'fpso-forte',
    name: 'FPSO Forte',
    lat: -21.5, // Northern Campos
    lon: -40.0,
    distance: 75, // NM
    type: 'FPSO',
  },
  {
    id: 'fpso-peregrino',
    name: 'FPSO Peregrino',
    lat: -22.2, // Campos Basin
    lon: -40.8,
    distance: 46, // NM
    type: 'FPSO',
  },
  {
    id: 'platform-peregrino-a',
    name: 'Platform Peregrino A',
    lat: -22.25,
    lon: -40.85,
    distance: 46, // NM
    type: 'Platform',
  },
  {
    id: 'platform-peregrino-b',
    name: 'Platform Peregrino B',
    lat: -22.15,
    lon: -40.75,
    distance: 46, // NM
    type: 'Platform',
  },
  {
    id: 'platform-peregrino-c',
    name: 'Platform Peregrino C',
    lat: -22.2,
    lon: -40.8,
    distance: 46, // NM
    type: 'Platform',
  },
];
