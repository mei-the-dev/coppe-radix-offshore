import { useState, useEffect, useMemo } from 'react';
import type { Vessel, Berth } from '../../types';
import { IconVessel, IconPort, IconFPSO, IconPlatform } from '../../assets/icons';
import { Tooltip } from '../feedback';
import { Card } from '../display';
import { Badge } from '../display';
import { Stack } from '../layout';
import { api, prioAPI } from '../../api/client';
import './Visualization.css';

interface Installation {
  id: string;
  name: string;
  type: 'FPSO' | 'FixedPlatform' | 'WellheadPlatform';
  location: {
    latitude: number;
    longitude: number;
    water_depth_m?: number;
  };
  distance_from_base_nm?: number;
  production_capacity_bpd?: number;
  operational_limits?: {
    max_wind_ms?: number;
    max_wave_m?: number;
    max_current_kts?: number;
    max_simultaneous_vessels?: number;
  };
  storage_levels?: Array<{
    cargo_type_id: string;
    max_capacity: number;
    current_level: number;
    safety_stock: number;
    unit: string;
    status: string;
  }>;
  consumption_profile?: Array<{
    cargo_type_id: string;
    daily_consumption: number;
    unit: string;
  }>;
}

interface SupplyBase {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  port_code?: string;
  max_draught_m?: number;
  max_vessel_length_m?: number;
  num_berths?: number;
  operating_hours?: string;
}

interface VisualizationProps {
  vessels: Vessel[];
  berths: Berth[];
}

export default function Visualization({ vessels, berths }: VisualizationProps) {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [supplyBases, setSupplyBases] = useState<SupplyBase[]>([]);
  const [detailedVessels, setDetailedVessels] = useState<Record<string, any>>({});
  const [detailedInstallations, setDetailedInstallations] = useState<Record<string, Installation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch installations
      const installationsResponse = await prioAPI.installations.list({ include_storage: true });
      const installationsData = installationsResponse.data || [];
      setInstallations(installationsData);

      // Fetch detailed data for each installation
      const installationDetails: Record<string, Installation> = {};
      for (const inst of installationsData) {
        try {
          const detail = await prioAPI.installations.get(inst.id);
          installationDetails[inst.id] = detail;
        } catch (err) {
          console.warn(`Failed to fetch details for installation ${inst.id}:`, err);
        }
      }
      setDetailedInstallations(installationDetails);

      // Fetch supply bases (berths are at Macaé port)
      // Macaé coordinates: 22°23'S, 41°47'W = -22.3833, -41.7833
      const supplyBaseData: SupplyBase[] = [{
        id: 'macaé-port',
        name: 'Port of Macaé',
        location: {
          latitude: -22.3833, // 22°23'S
          longitude: -41.7833, // 41°47'W
        },
        port_code: 'BRMEA',
        num_berths: berths.length,
        operating_hours: '24/7',
      }];
      setSupplyBases(supplyBaseData);

      // Fetch detailed vessel data
      const vesselDetails: Record<string, any> = {};
      for (const vessel of vessels) {
        try {
          const detail = await api.getVessel(vessel.id);
          vesselDetails[vessel.id] = detail;
        } catch (err) {
          console.warn(`Failed to fetch details for vessel ${vessel.id}:`, err);
          // Use basic vessel data as fallback
          vesselDetails[vessel.id] = vessel;
        }
      }
      setDetailedVessels(vesselDetails);


    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load visualization data');
      console.error('Error loading visualization data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate map bounds
  const mapBounds = useMemo(() => {
    const allPoints: Array<{ lat: number; lon: number }> = [];

    // Add supply bases (Macaé port)
    supplyBases.forEach(base => {
      allPoints.push({ lat: base.location.latitude, lon: base.location.longitude });
    });

    // Add installations
    installations.forEach(inst => {
      allPoints.push({ lat: inst.location.latitude, lon: inst.location.longitude });
    });

    // Add vessels with positions
    vessels.forEach(vessel => {
      if (vessel.position) {
        allPoints.push({ lat: vessel.position.lat, lon: vessel.position.lon });
      }
    });

    if (allPoints.length === 0) {
      // Default to Macaé area
      return {
        minLat: -23,
        maxLat: -21,
        minLon: -42.5,
        maxLon: -40.5,
      };
    }

    const lats = allPoints.map(p => p.lat);
    const lons = allPoints.map(p => p.lon);

    const padding = 0.5; // degrees
    return {
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLon: Math.min(...lons) - padding,
      maxLon: Math.max(...lons) + padding,
    };
  }, [supplyBases, installations, vessels]);

  // Convert lat/lon to map coordinates (0-100%)
  const latToY = (lat: number) => {
    const range = mapBounds.maxLat - mapBounds.minLat;
    return ((mapBounds.maxLat - lat) / range) * 100;
  };

  const lonToX = (lon: number) => {
    const range = mapBounds.maxLon - mapBounds.minLon;
    return ((lon - mapBounds.minLon) / range) * 100;
  };

  // Get vessels in transit
  const vesselsInTransit = vessels.filter(v =>
    v.status === 'in_transit' && v.position
  );

  if (loading) {
    return (
      <div className="visualization-loading">
        <div className="loading-spinner">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualization-error">
        <p>Error: {error}</p>
        <button onClick={loadAllData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="visualization">
      <div className="visualization-header">
        <h2>Offshore Logistics Map</h2>
        <div className="visualization-legend">
          <div className="legend-item">
            <IconPort size={20} />
            <span>Supply Base (Macaé)</span>
          </div>
          <div className="legend-item">
            <IconFPSO size={20} />
            <span>FPSO</span>
          </div>
          <div className="legend-item">
            <IconPlatform size={20} />
            <span>Platform</span>
          </div>
          <div className="legend-item">
            <IconVessel size={20} />
            <span>Vessel in Transit</span>
          </div>
        </div>
      </div>

      <div className="visualization-map-container">
        <div className="visualization-map">
          {/* Supply Bases (Macaé Port) */}
          {supplyBases.map((base) => {
            return (
              <Tooltip
                key={base.id}
                content={
                  <Stack gap="sm" className="map-tooltip-content">
                    <h4>{base.name}</h4>
                    <div><strong>Type:</strong> Supply Base</div>
                    <div><strong>Location:</strong> {base.location.latitude.toFixed(4)}°N, {base.location.longitude.toFixed(4)}°W</div>
                    {base.port_code && <div><strong>Port Code:</strong> {base.port_code}</div>}
                    {base.num_berths && <div><strong>Berths:</strong> {base.num_berths}</div>}
                    {base.operating_hours && <div><strong>Operating Hours:</strong> {base.operating_hours}</div>}
                    {berths.length > 0 && (
                      <div>
                        <strong>Berth Details:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          {berths.map(berth => (
                            <li key={berth.id}>
                              {berth.name} - {berth.status} (Max: {berth.maxLength}m, {berth.maxDraught}m draught)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Stack>
                }
              >
                <div
                  className="map-marker map-marker--base"
                  style={{
                    top: `${latToY(base.location.latitude)}%`,
                    left: `${lonToX(base.location.longitude)}%`,
                  }}
                >
                  <IconPort size={32} />
                </div>
              </Tooltip>
            );
          })}

          {/* Installations */}
          {installations.map((installation) => {
            const details = detailedInstallations[installation.id] || installation;
            return (
              <Tooltip
                key={installation.id}
                content={
                  <Stack gap="sm" className="map-tooltip-content">
                    <h4>{installation.name}</h4>
                    <div><strong>Type:</strong> {installation.type}</div>
                    <div><strong>Location:</strong> {installation.location.latitude.toFixed(4)}°N, {installation.location.longitude.toFixed(4)}°W</div>
                    {installation.distance_from_base_nm && (
                      <div><strong>Distance from Base:</strong> {installation.distance_from_base_nm.toFixed(1)} NM</div>
                    )}
                    {installation.location.water_depth_m && (
                      <div><strong>Water Depth:</strong> {installation.location.water_depth_m.toFixed(0)} m</div>
                    )}
                    {installation.production_capacity_bpd && (
                      <div><strong>Production Capacity:</strong> {installation.production_capacity_bpd.toLocaleString()} bpd</div>
                    )}
                    {installation.operational_limits && (
                      <div>
                        <strong>Operational Limits:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          {installation.operational_limits.max_wind_ms && (
                            <li>Max Wind: {installation.operational_limits.max_wind_ms} m/s</li>
                          )}
                          {installation.operational_limits.max_wave_m && (
                            <li>Max Wave: {installation.operational_limits.max_wave_m} m</li>
                          )}
                          {installation.operational_limits.max_current_kts && (
                            <li>Max Current: {installation.operational_limits.max_current_kts} kts</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {details.storage_levels && details.storage_levels.length > 0 && (
                      <div>
                        <strong>Storage Levels:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          {details.storage_levels.slice(0, 5).map((storage: any, idx: number) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{storage.cargo_type_id}: {storage.current_level.toFixed(1)} / {storage.max_capacity.toFixed(1)} {storage.unit}</span>
                              {storage.status && (
                                <Badge variant={storage.status === 'Critical' ? 'error' : storage.status === 'Low' ? 'warning' : 'success'} size="sm">
                                  {storage.status}
                                </Badge>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {details.consumption_profile && details.consumption_profile.length > 0 && (
                      <div>
                        <strong>Consumption:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          {details.consumption_profile.slice(0, 3).map((profile: any, idx: number) => (
                            <li key={idx}>
                              {profile.cargo_type_id}: {profile.daily_consumption.toFixed(1)} {profile.unit}/day
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Stack>
                }
              >
                <div
                  className={`map-marker map-marker--installation map-marker--${installation.type.toLowerCase()}`}
                  style={{
                    top: `${latToY(installation.location.latitude)}%`,
                    left: `${lonToX(installation.location.longitude)}%`,
                  }}
                >
                  {installation.type === 'FPSO' ? (
                    <IconFPSO size={28} />
                  ) : (
                    <IconPlatform size={28} />
                  )}
                </div>
              </Tooltip>
            );
          })}

          {/* Vessels in Transit */}
          {vesselsInTransit.map((vessel) => {
            if (!vessel.position) return null;
            const details = detailedVessels[vessel.id] || vessel;
            return (
              <Tooltip
                key={vessel.id}
                content={
                  <Stack gap="sm" className="map-tooltip-content">
                    <h4>{vessel.name}</h4>
                    <div><strong>Type:</strong> {vessel.type}</div>
                    <div><strong>Status:</strong> {vessel.status.replace('_', ' ')}</div>
                    <div><strong>Location:</strong> {vessel.position.lat.toFixed(4)}°N, {vessel.position.lon.toFixed(4)}°W</div>
                    {vessel.currentLocation && (
                      <div><strong>Current Location:</strong> {vessel.currentLocation}</div>
                    )}
                    {details.loa_m && (
                      <div><strong>Length:</strong> {details.loa_m} m</div>
                    )}
                    {details.beam_m && (
                      <div><strong>Beam:</strong> {details.beam_m} m</div>
                    )}
                    {details.deck_cargo_capacity_t && (
                      <div><strong>Deck Capacity:</strong> {details.deck_cargo_capacity_t} t</div>
                    )}
                    {details.total_deadweight_t && (
                      <div><strong>Deadweight:</strong> {details.total_deadweight_t} t</div>
                    )}
                    {details.operational_speed_kts && (
                      <div><strong>Operational Speed:</strong> {details.operational_speed_kts} kts</div>
                    )}
                    {details.dp_class && (
                      <div><strong>DP Class:</strong> {details.dp_class}</div>
                    )}
                    {details.availability_status && (
                      <div><strong>Availability:</strong> {details.availability_status}</div>
                    )}
                  </Stack>
                }
              >
                <div
                  className="map-marker map-marker--vessel"
                  style={{
                    top: `${latToY(vessel.position.lat)}%`,
                    left: `${lonToX(vessel.position.lon)}%`,
                  }}
                >
                  <IconVessel size={24} />
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="visualization-stats">
        <Card variant="outlined" padding="md">
          <Stack direction="column" gap="sm">
            <h3>Map Statistics</h3>
            <div className="stat-row">
              <span>Supply Bases:</span>
              <strong>{supplyBases.length}</strong>
            </div>
            <div className="stat-row">
              <span>Installations:</span>
              <strong>{installations.length}</strong>
            </div>
            <div className="stat-row">
              <span>Vessels in Transit:</span>
              <strong>{vesselsInTransit.length}</strong>
            </div>
            <div className="stat-row">
              <span>Total Vessels:</span>
              <strong>{vessels.length}</strong>
            </div>
            <div className="stat-row">
              <span>Berths:</span>
              <strong>{berths.length}</strong>
            </div>
          </Stack>
        </Card>
      </div>
    </div>
  );
}
