import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Vessel, Berth, Trip } from '../../types';
import { IconVessel, IconPort, IconFPSO, IconPlatform, IconZoomIn, IconZoomOut, IconReset, IconClose } from '../../assets/icons';
import { Card } from '../display';
import { Badge } from '../display';
import { Stack } from '../layout';
import { IconButton } from '../action';
import { prioAPI } from '../../api/client';
import { useTrips } from '../../hooks/useTrips';
import { useLoadingPlans } from '../../hooks/useLoadingPlans';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Visualization.css';

// Constants (used for map bounds; Leaflet handles zoom/pan)
const BOUNDS_PADDING = 0.2;
const MIN_PADDING_DEGREES = 0.3;

// Helper functions
const isValidCoordinate = (value: number | undefined | null): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/** Custom bubble pin icon by type (Port, FPSO, Platform, Vessel) */
const createPinIcon = (type: 'port' | 'fpso' | 'platform' | 'vessel', label: string): L.DivIcon => {
  const colors: Record<string, string> = {
    port: '#0ea5e9',
    fpso: '#8b5cf6',
    platform: '#10b981',
    vessel: '#f59e0b',
  };
  const short = type === 'port' ? 'P' : type === 'fpso' ? 'F' : type === 'platform' ? 'R' : 'V';
  const color = colors[type] ?? '#6b7280';
  const title = label ? `${short}: ${label}` : type;
  return L.divIcon({
    html: `<div class="map-pin-bubble map-pin-bubble--${type}" style="background:${color}" title="${title.replace(/"/g, '&quot;')}"><span class="map-pin-bubble__letter">${short}</span><span class="map-pin-bubble__label">${(label || type).slice(0, 12)}</span></div>`,
    className: 'map-pin-bubble-container',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

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
  vessels?: Vessel[];
  berths?: Berth[];
}

type MarkerType = 'port' | 'installation' | 'vessel' | 'trip';

interface MarkerData {
  type: MarkerType;
  data: SupplyBase | Installation | Vessel | Trip;
}

export default function Visualization({ vessels: propsVessels, berths: propsBerths }: VisualizationProps) {
  const [vessels, setVessels] = useState<Vessel[]>(propsVessels || []);
  const [berths, setBerths] = useState<Berth[]>(propsBerths || []);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [supplyBases, setSupplyBases] = useState<SupplyBase[]>([]);
  const [detailedVessels, setDetailedVessels] = useState<Record<string, any>>({});
  const [detailedInstallations, setDetailedInstallations] = useState<Record<string, Installation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trips data from database (SSO)
  const { data: trips = [], isLoading: tripsLoading } = useTrips({
    status: undefined, // Get all trips for now
  });

  // Log trips data source
  useEffect(() => {
    if (trips.length > 0) {
      console.log('✅ Fetched trips from database (SSO):', trips.length);
    } else if (!tripsLoading) {
      console.warn('⚠️ No trips found in database. Please populate the trips table.');
    }
  }, [trips, tripsLoading]);

  // Fetch orders/loading plans from database (SSO)
  const { data: orders = [] } = useLoadingPlans();

  // Log orders data source
  useEffect(() => {
    if (orders.length > 0) {
      console.log('✅ Fetched orders from database (SSO):', orders.length);
    }
  }, [orders]);

  // Map navigation state
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [hoveredTrip, setHoveredTrip] = useState<Trip | null>(null);
  const [showTrips, setShowTrips] = useState(true); // Toggle trip routes
  const [showCargoFlows, setShowCargoFlows] = useState(true); // Toggle cargo flows
  const [showLoadingOps, setShowLoadingOps] = useState(true); // Toggle loading operations
  const [filterStatus, setFilterStatus] = useState<string>('all'); // Filter by status
  const [filterVessel, setFilterVessel] = useState<string>('all'); // Filter by vessel
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  // Unique key per mount so Leaflet never reuses a container (fixes Strict Mode “Map container is already initialized”)
  const [mapInstanceKey, setMapInstanceKey] = useState<number | null>(null);
  useEffect(() => {
    setMapInstanceKey(() => Date.now());
  }, []);

  // Fix Leaflet default icon when bundling with Vite (icons load from CDN)
  useEffect(() => {
    if (typeof L !== 'undefined' && L.Icon?.Default) {
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }
  }, []);

  // Fetch all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all vessels from database (SSO - Single Source of Truth)
      const vesselsResponse = await prioAPI.vessels.list();
      const vesselsData = vesselsResponse.data || [];

      // Normalize vessel position data from database
      const normalizedVessels = vesselsData.map((vessel: any) => {
        // Database returns current_lat and current_lon from PostGIS coordinates
        let position = undefined;
        if (vessel.current_lat !== null && vessel.current_lat !== undefined && 
            vessel.current_lon !== null && vessel.current_lon !== undefined) {
          position = {
            lat: parseFloat(vessel.current_lat),
            lon: parseFloat(vessel.current_lon),
          };
        }
        
        // Map database fields to frontend Vessel type
        const mappedVessel: Vessel = {
          id: vessel.id,
          name: vessel.name,
          type: (vessel.class || vessel.type || 'Standard PSV') as Vessel['type'],
          status: vessel.availability?.status === 'InUse' ? 'in_transit' :
                 vessel.availability?.status === 'Available' ? 'available' :
                 vessel.availability?.status === 'Maintenance' ? 'maintenance' :
                 vessel.availability?.status === 'Drydock' ? 'maintenance' :
                 vessel.status || 'available',
          lengthOverall: vessel.specifications?.loa_m || vessel.lengthOverall || 0,
          beam: vessel.specifications?.beam_m || vessel.beam || 0,
          draughtLoaded: vessel.specifications?.draught_m || vessel.draughtLoaded || 0,
          totalDeadweight: vessel.specifications?.total_deadweight_t || vessel.totalDeadweight || 0,
          deckCargoCapacity: vessel.specifications?.deck_cargo_capacity_t || vessel.deckCargoCapacity || 0,
          clearDeckArea: vessel.clearDeckArea || 0,
          fuelOilCapacity: vessel.fuelOilCapacity || 0,
          freshWaterCapacity: vessel.freshWaterCapacity || 0,
          liquidMudCapacity: vessel.liquidMudCapacity || 0,
          dryBulkCapacity: vessel.dryBulkCapacity || 0,
          serviceSpeed: vessel.serviceSpeed || 0,
          operationalSpeed: vessel.specifications?.operational_speed_kts || vessel.operationalSpeed || 0,
          dpClass: (vessel.dp_class || vessel.dpClass || 'None') as Vessel['dpClass'],
          currentLocation: vessel.availability?.current_location?.name || vessel.currentLocation,
          position: position,
        };
        
        return mappedVessel;
      });

      console.log('✅ Fetched vessels from database (SSO):', normalizedVessels.length);
      if (normalizedVessels.length === 0) {
        console.warn('⚠️ No vessels found in database. Please populate the vessels table.');
      }
      setVessels(normalizedVessels);

      // Fetch all installations/platforms from database
      const installationsResponse = await prioAPI.installations.list({ include_storage: true });
      const installationsData = installationsResponse.data || [];

      // Normalize installation location data (handle PostGIS geography point format)
      const normalizedInstallations = installationsData.map((inst: any) => {
        if (inst.location) {
          // If location is a PostGIS point string (POINT(lon lat)), parse it
          if (typeof inst.location === 'string' && inst.location.startsWith('POINT')) {
            const match = inst.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
            if (match) {
              inst.location = {
                longitude: parseFloat(match[1]),
                latitude: parseFloat(match[2]),
              };
            }
          }
          // If location is an object with lat/lon instead of latitude/longitude
          else if (inst.location.lat !== undefined && inst.location.lon !== undefined) {
            inst.location = {
              latitude: inst.location.lat,
              longitude: inst.location.lon,
            };
          }
        }
        return inst;
      });

      console.log('✅ Fetched installations from database (SSO):', normalizedInstallations.length);
      if (normalizedInstallations.length === 0) {
        console.warn('⚠️ No installations found in database. Please populate the installations table.');
      }
      setInstallations(normalizedInstallations);

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

      // Fetch supply bases from database (SSO)
      const supplyBasesResponse = await prioAPI.supplyBases.list();
      const supplyBasesData = supplyBasesResponse.data || [];
      
      const fetchedSupplyBases: SupplyBase[] = supplyBasesData.map((base: any) => ({
        id: base.id,
        name: base.name,
        location: base.location || {
          latitude: base.latitude,
          longitude: base.longitude,
        },
        port_code: base.port_code,
        num_berths: base.specifications?.num_berths || 0,
        operating_hours: base.specifications?.operating_hours || '24/7',
        max_draught_m: base.specifications?.max_draught_m,
        max_vessel_length_m: base.specifications?.max_vessel_length_m,
      }));
      
      console.log('✅ Fetched supply bases from database (SSO):', fetchedSupplyBases.length);
      if (fetchedSupplyBases.length === 0) {
        console.warn('⚠️ No supply bases found in database. Please populate the supply_bases table.');
      }
      setSupplyBases(fetchedSupplyBases);

      // Fetch berths from supply bases (database SSO)
      if (!propsBerths || propsBerths.length === 0) {
        // Get berths from the first supply base (typically Macaé)
        // In production, you might want to filter for a specific port
        const primaryBase = fetchedSupplyBases.find(b => 
          b.port_code === 'BRMEA' || 
          b.name.toLowerCase().includes('macae')
        ) || fetchedSupplyBases[0];
        
        if (primaryBase) {
          const berthsData = await prioAPI.supplyBases.getBerths(primaryBase.id);
          console.log('✅ Fetched berths from database (SSO):', berthsData.length);
          if (berthsData.length === 0) {
            console.warn('⚠️ No berths found for supply base. Check supply_bases.num_berths in database.');
          }
          setBerths(berthsData);
        } else {
          console.warn('No supply base found for berth retrieval');
          setBerths([]);
        }
      }

      // Fetch detailed vessel data from database (SSO)
      const vesselDetails: Record<string, any> = {};
      for (const vessel of normalizedVessels) {
        try {
          const detail = await prioAPI.vessels.get(vessel.id);
          vesselDetails[vessel.id] = detail;
        } catch (err) {
          console.warn(`Failed to fetch details for vessel ${vessel.id}:`, err);
          vesselDetails[vessel.id] = vessel;
        }
      }
      setDetailedVessels(vesselDetails);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load visualization data';
      setError(errorMessage);
      console.error('Error loading visualization data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate map bounds
  const mapBounds = useMemo(() => {
    try {
      const allPoints: Array<{ lat: number; lon: number }> = [];

      // Add supply bases
      supplyBases.forEach(base => {
        if (isValidCoordinate(base.location.latitude) && isValidCoordinate(base.location.longitude)) {
          allPoints.push({ lat: base.location.latitude, lon: base.location.longitude });
        }
      });

      // Add installations
      installations.forEach(inst => {
        if (isValidCoordinate(inst.location?.latitude) && isValidCoordinate(inst.location?.longitude)) {
          allPoints.push({ lat: inst.location.latitude, lon: inst.location.longitude });
        }
      });

      // Add vessels with positions
      vessels.forEach(vessel => {
        if (vessel.position && isValidCoordinate(vessel.position.lat) && isValidCoordinate(vessel.position.lon)) {
          allPoints.push({ lat: vessel.position.lat, lon: vessel.position.lon });
        }
      });

      if (allPoints.length === 0) {
        // If no data points, return empty bounds (will be handled by component)
        console.warn('No valid data points found for map bounds calculation');
        return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
      }

      const lats = allPoints.map(p => p.lat);
      const lons = allPoints.map(p => p.lon);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      const latRange = maxLat - minLat;
      const lonRange = maxLon - minLon;
      const latPadding = Math.max(latRange * BOUNDS_PADDING, MIN_PADDING_DEGREES);
      const lonPadding = Math.max(lonRange * BOUNDS_PADDING, MIN_PADDING_DEGREES);

      return {
        minLat: minLat - latPadding,
        maxLat: maxLat + latPadding,
        minLon: minLon - lonPadding,
        maxLon: maxLon + lonPadding,
      };
    } catch (error) {
      console.error('Error calculating map bounds:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate map bounds');
      return { minLat: -23.0, maxLat: -21.0, minLon: -42.0, maxLon: -40.0 };
    }
  }, [supplyBases, installations, vessels]);

  // Zoom handlers (drive Leaflet map)
  const handleZoomIn = useCallback(() => {
    leafletMapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    leafletMapRef.current?.zoomOut();
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedMarker(null);
    setSelectedTrip(null);
    const map = leafletMapRef.current;
    if (map) {
      const { minLat, maxLat, minLon, maxLon } = mapBounds;
      if (maxLat > minLat && maxLon > minLon) {
        map.fitBounds([[minLat, minLon], [maxLat, maxLon]], { padding: [50, 50] });
      }
    }
  }, [mapBounds]);

  // Vessels with positions; ensure at least one vessel per type/model is shown (use supply base as fallback position)
  const vesselsToShow = useMemo(() => {
    const fallback = supplyBases[0]?.location
      ? { lat: supplyBases[0].location.latitude, lon: supplyBases[0].location.longitude }
      : { lat: -22.37, lon: -41.79 };
    const withPos = vessels.filter(
      v => v.position && isValidCoordinate(v.position.lat) && isValidCoordinate(v.position.lon)
    );
    const typesSeen = new Set(withPos.map(v => v.type ?? 'Standard PSV'));
    const withoutPos = vessels.filter(
      v => !v.position || !isValidCoordinate(v.position.lat) || !isValidCoordinate(v.position.lon)
    );
    const onePerType = withoutPos.filter(v => {
      const t = v.type ?? 'Standard PSV';
      if (typesSeen.has(t)) return false;
      typesSeen.add(t);
      return true;
    });
    const withFallback = onePerType.map(v => ({
      ...v,
      position: { lat: fallback.lat, lon: fallback.lon },
    }));
    return [...withPos, ...withFallback];
  }, [vessels, supplyBases]);

  // Filter vessels in transit for statistics
  const vesselsInTransit = useMemo(() =>
    vessels.filter(v => v.status === 'in_transit' && v.position),
    [vessels]
  );

  // Filter installations with valid coordinates
  const validInstallations = useMemo(() => {
    const valid = installations.filter(inst => {
      const hasLat = isValidCoordinate(inst.location?.latitude);
      const hasLon = isValidCoordinate(inst.location?.longitude);
      if (!hasLat || !hasLon) {
        console.log('Installation filtered out:', inst.id, inst.name, 'location:', inst.location);
      }
      return hasLat && hasLon;
    });
    console.log('Valid installations:', valid.length, 'out of', installations.length);
    return valid;
  }, [installations]);

  // Combined loading state
  const isLoading = loading || tripsLoading;

  if (isLoading) {
    return (
      <div className="visualization-loading">
        <div className="loading-spinner">Loading map data from database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visualization-error">
        <p>Error loading data from database: {error}</p>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)' }}>
          Please ensure the database is connected and contains data.
        </p>
        <button onClick={loadAllData}>Retry</button>
      </div>
    );
  }

  // Validate we have data from database
  if (vessels.length === 0 && installations.length === 0 && supplyBases.length === 0) {
    return (
      <div className="visualization-error">
        <p>No data available from database</p>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)' }}>
          The database appears to be empty. Please populate the database with vessels, installations, and supply bases.
        </p>
        <button onClick={loadAllData}>Refresh</button>
      </div>
    );
  }

  return (
    <div className="visualization">
      <div className="visualization-header">
        <h2>Offshore Logistics Map</h2>
        {/* Filter Controls */}
        <div className="visualization-filters">
          <div className="filter-group">
            <label>Status</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Planned">Planned</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Loading">Loading</option>
              <option value="InTransit">In Transit</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Vessel</label>
            <select
              className="filter-select"
              value={filterVessel}
              onChange={(e) => setFilterVessel(e.target.value)}
            >
              <option value="all">All Vessels</option>
              {vessels.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
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
          {showTrips && (
            <>
              <div className="legend-item">
                <div className="legend-line legend-line--planned" />
                <span>Planned Trip</span>
              </div>
              <div className="legend-item">
                <div className="legend-line legend-line--in-progress" />
                <span>Active Trip</span>
              </div>
              <div className="legend-item">
                <div className="legend-line legend-line--completed" />
                <span>Completed Trip</span>
              </div>
            </>
          )}
        </div>
        <div className="visualization-controls">
          <button
            className={`toggle-button ${showTrips ? 'toggle-button--active' : ''}`}
            onClick={() => setShowTrips(!showTrips)}
            aria-label={showTrips ? 'Hide trip routes' : 'Show trip routes'}
          >
            {showTrips ? 'Hide' : 'Show'} Trip Routes
          </button>
          <button
            className={`toggle-button ${showCargoFlows ? 'toggle-button--active' : ''}`}
            onClick={() => setShowCargoFlows(!showCargoFlows)}
            aria-label={showCargoFlows ? 'Hide cargo flows' : 'Show cargo flows'}
          >
            {showCargoFlows ? 'Hide' : 'Show'} Cargo Flows
          </button>
          <button
            className={`toggle-button ${showLoadingOps ? 'toggle-button--active' : ''}`}
            onClick={() => setShowLoadingOps(!showLoadingOps)}
            aria-label={showLoadingOps ? 'Hide loading ops' : 'Show loading ops'}
          >
            {showLoadingOps ? 'Hide' : 'Show'} Loading Ops
          </button>
        </div>
      </div>

      {/* Loading Operations Panel */}
      {showLoadingOps && orders.filter(o => o.status === 'Loading' || o.status === 'in_progress').length > 0 && (
        <div className="map-loading-operation">
          <Card variant="outlined" padding="md" className="loading-operation-card">
            <div className="loading-operation-header">
              <h4>Active Loading Operations</h4>
              <Badge variant="info" size="sm">
                {orders.filter(o => o.status === 'Loading' || o.status === 'in_progress').length}
              </Badge>
            </div>
            <Stack direction="column" gap="sm">
              {orders
                .filter(o => o.status === 'Loading' || o.status === 'in_progress')
                .slice(0, 3)
                .map((order) => {
                  const vessel = vessels.find(v => v.id === order.vesselId);
                  const berth = berths.find(b => b.id === order.berthId);
                  const startTime = new Date(order.scheduledStart);
                  const endTime = new Date(order.scheduledEnd);
                  const now = new Date();
                  const progress = Math.max(0, Math.min(100, ((now.getTime() - startTime.getTime()) / (endTime.getTime() - startTime.getTime())) * 100));

                  return (
                    <div key={order.id} className="loading-operation-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-1)' }}>
                        <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          {vessel?.name || 'Unknown Vessel'}
                        </span>
                        <Badge 
                          variant={order.status === 'Loading' ? 'info' : 'warning'} 
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      {berth && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                          Berth: {berth.name}
                        </div>
                      )}
                      <div className="loading-operation-progress">
                        <div 
                          className="loading-operation-progress-bar" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-1)' }}>
                        {order.cargoItems?.length || 0} cargo items
                      </div>
                      {order.cargoItems && order.cargoItems.length > 0 && (
                        <div className="loading-operation-cargo">
                          {order.cargoItems.slice(0, 3).map((item: any, idx: number) => (
                            <span key={idx} className="loading-operation-cargo-item">
                              {item.name || item.type}
                            </span>
                          ))}
                          {order.cargoItems.length > 3 && (
                            <span className="loading-operation-cargo-item">
                              +{order.cargoItems.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </Stack>
          </Card>
        </div>
      )}

      <div className="visualization-map-container">
        {/* Statistics Panel */}
        <Card variant="outlined" padding="md" className="map-stats-panel">
          <Stack direction="column" gap="sm">
            <h3>Statistics</h3>
            <div className="stat-row">
              <span>Supply Bases:</span>
              <strong>{supplyBases.length}</strong>
            </div>
            <div className="stat-row">
              <span>Installations:</span>
              <strong>{validInstallations.length}</strong>
            </div>
            <div className="stat-row">
              <span>Vessels on Map:</span>
              <strong>{vesselsToShow.length}</strong>
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
            <div className="stat-row stat-row--zoom">
              <span>Map:</span>
              <strong>OSM</strong>
            </div>
            {showTrips && (
              <>
                <div className="stat-row">
                  <span>Active Trips:</span>
                  <strong>{trips.filter(t => t.status === 'InProgress').length}</strong>
                </div>
                <div className="stat-row">
                  <span>Total Trips:</span>
                  <strong>{trips.length}</strong>
                </div>
              </>
            )}
          </Stack>
        </Card>

        {/* Zoom Controls */}
        <div className="map-controls">
          <IconButton
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="map-control-button"
            icon={<IconZoomIn size={20} />}
          />
          <IconButton
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="map-control-button"
            icon={<IconZoomOut size={20} />}
          />
          <IconButton
            onClick={handleResetView}
            aria-label="Reset view"
            className="map-control-button"
            icon={<IconReset size={20} />}
          />
        </div>

        <div ref={mapRef} className="visualization-map" role="img" aria-label="Interactive map of offshore installations and vessels">
          {mapInstanceKey === null ? (
            <div style={{ height: '100%', minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Loading map…
            </div>
          ) : (
          <MapContainer
            key={mapInstanceKey}
            ref={leafletMapRef}
            bounds={[[mapBounds.minLat, mapBounds.minLon], [mapBounds.maxLat, mapBounds.maxLon]]}
            boundsOptions={{ padding: [50, 50] }}
            style={{ height: '100%', width: '100%', minHeight: 600 }}
            scrollWheelZoom
            className="visualization-map-leaflet"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

          {/* Cargo Flow Lines - Leaflet Polylines */}
          {showCargoFlows && orders
            .filter(order => {
              if (filterStatus !== 'all' && order.status !== filterStatus) return false;
              if (filterVessel !== 'all' && order.vesselId !== filterVessel) return false;
              return order.status === 'Loading' || order.status === 'InTransit' || order.status === 'Confirmed';
            })
            .map((order) => {
              const supplyBase = supplyBases.find(b => b.id === 'macae-port');
              if (!supplyBase) return null;
              const destination = installations.find(inst =>
                order.cargoItems?.some((item: any) => item.destination === inst.id) ||
                (order as any).destination?.installation_id === inst.id
              );
              if (!destination?.location) return null;
              const from: [number, number] = [supplyBase.location.latitude, supplyBase.location.longitude];
              const to: [number, number] = [destination.location.latitude, destination.location.longitude];
              const cargoCategory = order.cargoItems?.[0]?.category || 'deck_cargo';
              const color = cargoCategory === 'liquid_bulk' ? '#3b82f6' : cargoCategory === 'dry_bulk' ? '#f59e0b' : '#6b7280';
              return (
                <Polyline
                  key={`cargo-flow-${order.id}`}
                  positions={[from, to]}
                  pathOptions={{ color, weight: 3, opacity: 0.6, dashArray: '10, 5' }}
                  eventHandlers={{
                    click: () => {
                      const v = vessels.find(ve => ve.id === order.vesselId);
                      if (v) setSelectedMarker({ type: 'vessel', data: v });
                    },
                  }}
                />
              );
            })
            .filter(Boolean)
          }

          {/* Trip Routes - Leaflet Polylines */}
          {showTrips && trips
            .filter(trip => trip.route && trip.route.length >= 1)
            .map((trip) => {
              const positions: [number, number][] = [];
              for (const waypoint of trip.route) {
                let lat: number | null = null;
                let lon: number | null = null;
                if (waypoint.type === 'SupplyBase') {
                  const base = supplyBases.find(b => b.id === waypoint.location_id) ?? supplyBases[0];
                  if (base?.location) { lat = base.location.latitude; lon = base.location.longitude; }
                } else if (waypoint.type === 'Installation') {
                  const inst = installations.find(i => i.id === waypoint.location_id || i.name === waypoint.location_name) ?? installations[0];
                  if (inst?.location) { lat = inst.location.latitude; lon = inst.location.longitude; }
                }
                if (lat != null && lon != null && isValidCoordinate(lat) && isValidCoordinate(lon)) {
                  positions.push([lat, lon]);
                }
              }
              if (positions.length === 1 && validInstallations[0]) {
                positions.push([validInstallations[0].location.latitude, validInstallations[0].location.longitude]);
              }
              if (positions.length < 2) return null;
              const color = trip.status === 'Completed' ? '#10b981' : trip.status === 'InProgress' ? '#3b82f6' : trip.status === 'Delayed' ? '#ef4444' : '#6b7280';
              const isSelected = selectedTrip?.id === trip.id;
              return (
                <Polyline
                  key={trip.id}
                  positions={positions}
                  pathOptions={{
                    color,
                    weight: isSelected ? 3 : 2,
                    opacity: isSelected ? 1 : 0.5,
                    dashArray: trip.status === 'Planned' ? '5, 5' : undefined,
                  }}
                  eventHandlers={{
                    click: () => { setSelectedTrip(trip); setSelectedMarker({ type: 'trip', data: trip }); },
                    mouseover: () => setHoveredTrip(trip),
                    mouseout: () => setHoveredTrip(null),
                  }}
                />
              );
            })
            .filter(Boolean)
          }

          {/* Supply Bases - informative bubble pins */}
          {supplyBases.map((base) => (
            <Marker
              key={base.id}
              position={[base.location.latitude, base.location.longitude]}
              icon={createPinIcon('port', base.name)}
              eventHandlers={{ click: () => setSelectedMarker({ type: 'port', data: base }) }}
            >
              <Popup>{base.name} <small>(Supply Base)</small></Popup>
            </Marker>
          ))}

          {/* Installations - bubble by type (FPSO / Platform) */}
          {validInstallations.map((installation) => (
            <Marker
              key={installation.id}
              position={[installation.location.latitude, installation.location.longitude]}
              icon={createPinIcon(
                installation.type === 'FPSO' ? 'fpso' : 'platform',
                installation.name
              )}
              eventHandlers={{ click: () => setSelectedMarker({ type: 'installation', data: installation }) }}
            >
              <Popup>{installation.name} <small>({installation.type})</small></Popup>
            </Marker>
          ))}

          {/* Vessels - at least one per model */}
          {vesselsToShow.map((vessel) => (
            <Marker
              key={vessel.id}
              position={[vessel.position!.lat, vessel.position!.lon]}
              icon={createPinIcon('vessel', vessel.name)}
              eventHandlers={{ click: () => setSelectedMarker({ type: 'vessel', data: vessel }) }}
            >
              <Popup>{vessel.name} <small>({vessel.type ?? 'Vessel'})</small></Popup>
            </Marker>
          ))}
          </MapContainer>
          )}
        </div>

        {/* Trip Hover Tooltip */}
        {hoveredTrip && !selectedTrip && (
          <div
            className="map-hover-tooltip map-hover-tooltip--trip"
            style={{
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="map-hover-tooltip-name">
              Trip: {hoveredTrip.vessel_name || hoveredTrip.vessel_id}
            </div>
            <div className="map-hover-tooltip-hint">
              Status: {hoveredTrip.status} • {hoveredTrip.route.length} waypoints
            </div>
          </div>
        )}

        {/* Detail Panel */}
        {selectedMarker && selectedMarker.data && (
          <Card variant="outlined" padding="md" className="map-detail-panel">
            <Stack direction="column" gap="md">
              <div className="map-detail-header">
                <div>
                  <h3>
                    {selectedMarker.type === 'trip'
                      ? `Trip: ${(selectedMarker.data as Trip)?.vessel_name ?? (selectedMarker.data as Trip)?.vessel_id ?? '—'}`
                      : String((selectedMarker.data as SupplyBase | Installation | Vessel)?.name ?? '—')}
                  </h3>
                  <div className="map-detail-type">
                    {selectedMarker.type === 'port'
                      ? 'Supply Base'
                      : selectedMarker.type === 'installation'
                      ? (selectedMarker.data as Installation)?.type ?? '—'
                      : selectedMarker.type === 'trip'
                      ? 'Trip Route'
                      : (selectedMarker.data as Vessel)?.type ?? '—'}
                  </div>
                </div>
                <IconButton
                  onClick={() => setSelectedMarker(null)}
                  aria-label="Close details"
                  className="map-detail-close"
                  icon={<IconClose size={20} />}
                />
              </div>

              <div className="map-detail-content">
                {selectedMarker.type === 'port' && (() => {
                  const base = selectedMarker.data as SupplyBase;
                  const lat = base?.location?.latitude;
                  const lon = base?.location?.longitude;
                  return (
                  <>
                    <div className="map-detail-row">
                      <span>Port Code:</span>
                      <strong>{base?.port_code ?? '—'}</strong>
                    </div>
                    {lat != null && lon != null && (
                    <div className="map-detail-row">
                      <span>Location:</span>
                      <strong>
                        {Math.abs(lat).toFixed(4)}°S, {Math.abs(lon).toFixed(4)}°W
                      </strong>
                    </div>
                    )}
                    <div className="map-detail-row">
                      <span>Berths:</span>
                      <strong>{berths.length}</strong>
                    </div>
                    {berths.length > 0 && (
                      <div className="map-detail-section">
                        <div className="map-detail-section-title">Berth Status:</div>
                        <Stack direction="column" gap="xs">
                          {berths.map(berth => (
                            <div key={berth.id} className="map-detail-berth">
                              <span className="map-detail-berth-name">{berth.name}</span>
                              <Badge
                                variant={berth.status === 'occupied' ? 'error' : berth.status === 'available' ? 'success' : 'warning'}
                                size="sm"
                              >
                                {berth.status}
                              </Badge>
                            </div>
                          ))}
                        </Stack>
                      </div>
                    )}
                  </>
                  );
                })()}

                {selectedMarker.type === 'installation' && (() => {
                  const inst = selectedMarker.data as Installation;
                  if (!inst) return null;
                  const details = detailedInstallations[inst.id] || inst;
                  const lat = inst.location?.latitude;
                  const lon = inst.location?.longitude;
                  return (
                    <>
                      <div className="map-detail-row">
                        <span>Type:</span>
                        <strong>{inst.type ?? '—'}</strong>
                      </div>
                      {lat != null && lon != null && (
                      <div className="map-detail-row">
                        <span>Location:</span>
                        <strong>
                          {Math.abs(lat).toFixed(4)}°S, {Math.abs(lon).toFixed(4)}°W
                        </strong>
                      </div>
                      )}
                      {inst.distance_from_base_nm && (
                        <div className="map-detail-row">
                          <span>Distance from Base:</span>
                          <strong>{inst.distance_from_base_nm.toFixed(1)} NM</strong>
                        </div>
                      )}
                      {inst.location?.water_depth_m != null && (
                        <div className="map-detail-row">
                          <span>Water Depth:</span>
                          <strong>{Number(inst.location.water_depth_m).toFixed(0)} m</strong>
                        </div>
                      )}
                      {inst.production_capacity_bpd && (
                        <div className="map-detail-row">
                          <span>Production Capacity:</span>
                          <strong>{inst.production_capacity_bpd.toLocaleString()} bpd</strong>
                        </div>
                      )}
                      {inst.operational_limits && (
                        <div className="map-detail-section">
                          <div className="map-detail-section-title">Operational Limits:</div>
                          <Stack direction="column" gap="xs">
                            {inst.operational_limits.max_wind_ms && (
                              <div className="map-detail-row">
                                <span>Max Wind:</span>
                                <strong>{inst.operational_limits.max_wind_ms} m/s</strong>
                              </div>
                            )}
                            {inst.operational_limits.max_wave_m && (
                              <div className="map-detail-row">
                                <span>Max Wave:</span>
                                <strong>{inst.operational_limits.max_wave_m} m</strong>
                              </div>
                            )}
                            {inst.operational_limits.max_current_kts && (
                              <div className="map-detail-row">
                                <span>Max Current:</span>
                                <strong>{inst.operational_limits.max_current_kts} kts</strong>
                              </div>
                            )}
                          </Stack>
                        </div>
                      )}
                      {details.storage_levels && details.storage_levels.length > 0 && (
                        <div className="map-detail-section">
                          <div className="map-detail-section-title">Storage Levels:</div>
                          <Stack direction="column" gap="xs">
                            {details.storage_levels.slice(0, 5).map((storage: any, idx: number) => {
                              const current = Number(storage?.current_level);
                              const max = Number(storage?.max_capacity);
                              const currentStr = Number.isFinite(current) ? current.toFixed(1) : '—';
                              const maxStr = Number.isFinite(max) ? max.toFixed(1) : '—';
                              return (
                              <div key={idx} className="map-detail-row">
                                <span>
                                  {storage?.cargo_type_id ?? '—'}: {currentStr} / {maxStr} {storage?.unit ?? ''}
                                </span>
                                {storage?.status && (
                                  <Badge
                                    variant={storage.status === 'Critical' ? 'error' : storage.status === 'Low' ? 'warning' : 'success'}
                                    size="sm"
                                  >
                                    {storage.status}
                                  </Badge>
                                )}
                              </div>
                              );
                            })}
                          </Stack>
                        </div>
                      )}
                      {details.consumption_profile && details.consumption_profile.length > 0 && (
                        <div className="map-detail-section">
                          <div className="map-detail-section-title">Consumption:</div>
                          <Stack direction="column" gap="xs">
                            {details.consumption_profile.slice(0, 3).map((profile: any, idx: number) => {
                              const val = Number(profile?.daily_consumption);
                              const valStr = Number.isFinite(val) ? val.toFixed(1) : '—';
                              return (
                              <div key={idx} className="map-detail-row">
                                <span>
                                  {profile?.cargo_type_id ?? '—'}: {valStr} {profile?.unit ?? ''}/day
                                </span>
                              </div>
                              );
                            })}
                          </Stack>
                        </div>
                      )}
                    </>
                  );
                })()}

                {selectedMarker.type === 'vessel' && (() => {
                  const vessel = selectedMarker.data as Vessel;
                  if (!vessel || typeof vessel !== 'object') return null;
                  const details = detailedVessels[vessel.id] || vessel;
                  return (
                    <>
                      <div className="map-detail-row">
                        <span>Type:</span>
                        <strong>{vessel.type ?? '—'}</strong>
                      </div>
                      <div className="map-detail-row">
                        <span>Status:</span>
                        <strong>{vessel.status != null ? String(vessel.status).replace('_', ' ') : '—'}</strong>
                      </div>
                      {vessel.position && (
                        <div className="map-detail-row">
                          <span>Location:</span>
                          <strong>
                            {Math.abs(vessel.position.lat).toFixed(4)}°S, {Math.abs(vessel.position.lon).toFixed(4)}°W
                          </strong>
                        </div>
                      )}
                      {vessel.currentLocation && (
                        <div className="map-detail-row">
                          <span>Current Location:</span>
                          <strong>{vessel.currentLocation}</strong>
                        </div>
                      )}
                      {details.loa_m && (
                        <div className="map-detail-row">
                          <span>Length:</span>
                          <strong>{details.loa_m} m</strong>
                        </div>
                      )}
                      {details.beam_m && (
                        <div className="map-detail-row">
                          <span>Beam:</span>
                          <strong>{details.beam_m} m</strong>
                        </div>
                      )}
                      {details.deck_cargo_capacity_t && (
                        <div className="map-detail-row">
                          <span>Deck Capacity:</span>
                          <strong>{details.deck_cargo_capacity_t} t</strong>
                        </div>
                      )}
                      {details.total_deadweight_t && (
                        <div className="map-detail-row">
                          <span>Deadweight:</span>
                          <strong>{details.total_deadweight_t} t</strong>
                        </div>
                      )}
                      {details.operational_speed_kts && (
                        <div className="map-detail-row">
                          <span>Operational Speed:</span>
                          <strong>{details.operational_speed_kts} kts</strong>
                        </div>
                      )}
                      {details.dp_class && (
                        <div className="map-detail-row">
                          <span>DP Class:</span>
                          <strong>{details.dp_class}</strong>
                        </div>
                      )}
                      {details.availability_status && (
                        <div className="map-detail-row">
                          <span>Availability:</span>
                          <strong>{details.availability_status}</strong>
                        </div>
                      )}
                    </>
                  );
                })()}

                {selectedMarker.type === 'trip' && (() => {
                  const trip = selectedMarker.data as Trip;
                  if (!trip || typeof trip !== 'object') return null;
                  return (
                    <>
                      <div className="map-detail-row">
                        <span>Vessel:</span>
                        <strong>{trip.vessel_name || trip.vessel_id}</strong>
                      </div>
                      <div className="map-detail-row">
                        <span>Status:</span>
                        <Badge
                          variant={
                            trip.status === 'Completed' ? 'success' :
                            trip.status === 'InProgress' ? 'info' :
                            trip.status === 'Delayed' ? 'error' :
                            'default'
                          }
                          size="sm"
                        >
                          {trip.status}
                        </Badge>
                      </div>
                      {trip.metrics && (
                        <div className="map-detail-section">
                          <div className="map-detail-section-title">Trip Metrics:</div>
                          <Stack direction="column" gap="xs">
                            <div className="map-detail-row">
                              <span>Distance:</span>
                              <strong>{trip.metrics.total_distance_nm.toFixed(1)} NM</strong>
                            </div>
                            <div className="map-detail-row">
                              <span>Duration:</span>
                              <strong>{trip.metrics.total_duration_h.toFixed(1)} h</strong>
                            </div>
                            <div className="map-detail-row">
                              <span>Fuel Consumed:</span>
                              <strong>{trip.metrics.fuel_consumed_t.toFixed(1)} t</strong>
                            </div>
                            <div className="map-detail-row">
                              <span>Total Cost:</span>
                              <strong>${trip.metrics.total_cost_usd.toLocaleString()}</strong>
                            </div>
                          </Stack>
                        </div>
                      )}
                      {trip.route && trip.route.length > 0 && (
                        <div className="map-detail-section">
                          <div className="map-detail-section-title">Route ({trip.route.length} waypoints):</div>
                          <Stack direction="column" gap="xs">
                            {trip.route.map((waypoint, idx) => (
                              <div key={idx} className="map-detail-waypoint">
                                <span className="map-detail-waypoint-seq">{idx + 1}</span>
                                <div className="map-detail-waypoint-info">
                                  <div className="map-detail-waypoint-name">{waypoint.location_name}</div>
                                  <div className="map-detail-waypoint-type">{waypoint.type}</div>
                                  {waypoint.planned_arrival && (
                                    <div className="map-detail-waypoint-time">
                                      Arrival: {new Date(waypoint.planned_arrival).toLocaleString()}
                                    </div>
                                  )}
                                  {waypoint.operations && waypoint.operations.length > 0 && (
                                    <div className="map-detail-waypoint-ops">
                                      {waypoint.operations.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </Stack>
                        </div>
                      )}
                      {trip.cargo_manifest && trip.cargo_manifest.length > 0 && (
                        <div className="map-detail-section">
                          <div className="map-detail-section-title">Cargo Manifest:</div>
                          <Stack direction="column" gap="xs">
                            {trip.cargo_manifest.slice(0, 5).map((cargo, idx) => (
                              <div key={idx} className="map-detail-row">
                                <span>{cargo.cargo_name}:</span>
                                <strong>{cargo.quantity} {cargo.unit} ({cargo.action})</strong>
                              </div>
                            ))}
                            {trip.cargo_manifest.length > 5 && (
                              <div className="map-detail-row">
                                <span>+ {trip.cargo_manifest.length - 5} more items</span>
                              </div>
                            )}
                          </Stack>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </Stack>
          </Card>
        )}
      </div>
    </div>
  );
}
