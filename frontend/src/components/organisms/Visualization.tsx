import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Vessel, Berth } from '../../types';
import { IconVessel, IconPort, IconFPSO, IconPlatform, IconZoomIn, IconZoomOut, IconReset, IconClose } from '../../assets/icons';
import { Card } from '../display';
import { Badge } from '../display';
import { Stack } from '../layout';
import { IconButton } from '../action';
import { api, prioAPI } from '../../api/client';
import './Visualization.css';

// Constants
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 5;
const ZOOM_STEP = 1.3;
const MAP_PADDING = 0.1;
const BOUNDS_PADDING = 0.2;
const MIN_PADDING_DEGREES = 0.3;
const DEFAULT_MAP_SIZE = { width: 1000, height: 600 };
const MACAE_PORT = {
  id: 'macae-port',
  name: 'Port of Macaé',
  location: { latitude: -22.3833, longitude: -41.7833 },
  port_code: 'BRMEA'
};

// Helper functions
const isValidCoordinate = (value: number | undefined | null): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
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

type MarkerType = 'port' | 'installation' | 'vessel';

interface MarkerData {
  type: MarkerType;
  data: SupplyBase | Installation | Vessel;
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

  // Map navigation state
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<MarkerData | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState(DEFAULT_MAP_SIZE);

  // Fetch all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Update map size on mount and resize using ResizeObserver
  useEffect(() => {
    const updateMapSize = () => {
      if (mapRef.current) {
        const { offsetWidth, offsetHeight } = mapRef.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
          setMapSize({ width: offsetWidth, height: offsetHeight });
        }
      }
    };

    const timeoutId = setTimeout(updateMapSize, 0);

    let observer: ResizeObserver | null = null;
    if (mapRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateMapSize);
      observer.observe(mapRef.current);
    }

    const handleResize = () => updateMapSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all vessels from database
      let currentVessels = propsVessels || [];
      try {
        const vesselsResponse = await prioAPI.vessels.list();
        const vesselsData = vesselsResponse.data || [];

        // Normalize vessel position data
        const normalizedVessels = vesselsData.map((vessel: any) => {
          // If position is not set but we have location data, use it
          if (!vessel.position && vessel.location) {
            if (typeof vessel.location === 'string' && vessel.location.startsWith('POINT')) {
              const match = vessel.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
              if (match) {
                vessel.position = {
                  lon: parseFloat(match[1]),
                  lat: parseFloat(match[2]),
                };
              }
            } else if (vessel.location.latitude !== undefined && vessel.location.longitude !== undefined) {
              vessel.position = {
                lat: vessel.location.latitude,
                lon: vessel.location.longitude,
              };
            }
          }
          // If position uses lat/lon instead of lat/lon structure
          else if (vessel.position && vessel.position.latitude !== undefined) {
            vessel.position = {
              lat: vessel.position.latitude,
              lon: vessel.position.longitude,
            };
          }
          return vessel;
        });

        currentVessels = normalizedVessels;
        console.log('Fetched vessels:', normalizedVessels.length, normalizedVessels);
        setVessels(normalizedVessels);
      } catch (err) {
        console.warn('Failed to fetch vessels from PRIO API, trying legacy endpoint:', err);
        try {
          const legacyVessels = await api.getVessels();
          currentVessels = legacyVessels;
          setVessels(legacyVessels);
        } catch (legacyErr) {
          console.error('Failed to fetch vessels from both APIs:', legacyErr);
          // Keep existing vessels from props if available
        }
      }

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

      console.log('Fetched installations:', normalizedInstallations.length, normalizedInstallations);
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

      // Fetch berths if not provided as props
      let currentBerths = propsBerths || [];
      if (!propsBerths || propsBerths.length === 0) {
        try {
          const berthsData = await api.getBerths();
          currentBerths = berthsData;
          setBerths(berthsData);
        } catch (err) {
          console.warn('Failed to fetch berths:', err);
        }
      }

      // Fetch supply bases (berths are at Macaé port)
      const supplyBaseData: SupplyBase[] = [{
        id: 'macae-port',
        name: 'Port of Macaé',
        location: {
          latitude: MACAE_PORT.location.latitude,
          longitude: MACAE_PORT.location.longitude,
        },
        port_code: MACAE_PORT.port_code,
        num_berths: currentBerths.length,
        operating_hours: '24/7',
      }];
      setSupplyBases(supplyBaseData);

      // Fetch detailed vessel data for all vessels
      const vesselDetails: Record<string, any> = {};
      for (const vessel of currentVessels) {
        try {
          const detail = await api.getVessel(vessel.id);
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
      const allPoints: Array<{ lat: number; lon: number }> = [
        { lat: MACAE_PORT.location.latitude, lon: MACAE_PORT.location.longitude }
      ];

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
        // Fallback to Campos Basin area
        return { minLat: -23.0, maxLat: -21.0, minLon: -42.0, maxLon: -40.0 };
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

  // Calculate map scales
  const mapScales = useMemo(() => {
    const width = mapSize.width;
    const height = mapSize.height;
    const latRange = mapBounds.maxLat - mapBounds.minLat;
    const lonRange = mapBounds.maxLon - mapBounds.minLon;

    if (latRange === 0 || lonRange === 0) {
      return { scaleX: 1, scaleY: 1, padding: MAP_PADDING };
    }

    const boundsAspect = lonRange / latRange;
    const mapAspect = width / height;
    const availableWidth = width * (1 - MAP_PADDING * 2);
    const availableHeight = height * (1 - MAP_PADDING * 2);

    let scaleX: number, scaleY: number;
    if (boundsAspect > mapAspect) {
      scaleX = availableWidth / lonRange;
      scaleY = scaleX;
    } else {
      scaleY = availableHeight / latRange;
      scaleX = scaleY;
    }

    return { scaleX, scaleY, padding: MAP_PADDING };
  }, [mapBounds, mapSize]);

  // Calculate center offset
  const centerOffset = useMemo(() => {
    const width = mapSize.width;
    const height = mapSize.height;
    const centerLat = (mapBounds.minLat + mapBounds.maxLat) / 2;
    const centerLon = (mapBounds.minLon + mapBounds.maxLon) / 2;

    const centerX = (centerLon - mapBounds.minLon) * mapScales.scaleX;
    const centerY = (mapBounds.maxLat - centerLat) * mapScales.scaleY;
    const paddingX = width * mapScales.padding;
    const paddingY = height * mapScales.padding;

    return {
      x: paddingX + (width - paddingX * 2) / 2 - centerX,
      y: paddingY + (height - paddingY * 2) / 2 - centerY,
    };
  }, [mapBounds, mapSize, mapScales]);

  // Coordinate conversion functions
  const latToY = useCallback((lat: number): number => {
    if (!isValidCoordinate(lat)) return mapSize.height / 2;
    const baseY = (mapBounds.maxLat - lat) * mapScales.scaleY;
    return (baseY * zoom) + pan.y + centerOffset.y;
  }, [mapBounds, zoom, pan.y, centerOffset.y, mapScales, mapSize]);

  const lonToX = useCallback((lon: number): number => {
    if (!isValidCoordinate(lon)) return mapSize.width / 2;
    const baseX = (lon - mapBounds.minLon) * mapScales.scaleX;
    return (baseX * zoom) + pan.x + centerOffset.x;
  }, [mapBounds, zoom, pan.x, centerOffset.x, mapScales, mapSize]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.preventDefault();
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    e.preventDefault();
  }, [pan]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    e.preventDefault();
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => clamp(prev * ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => clamp(prev / ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  }, []);

  const handleResetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setSelectedMarker(null);
    if (mapRef.current) {
      setMapSize({
        width: mapRef.current.offsetWidth,
        height: mapRef.current.offsetHeight,
      });
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => clamp(prev * delta, ZOOM_MIN, ZOOM_MAX));
  }, []);

  // Attach/detach event listeners
  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Filter vessels with positions (all vessels that have location data)
  const vesselsWithPositions = useMemo(() => {
    const valid = vessels.filter(v => {
      const hasPosition = v.position && isValidCoordinate(v.position.lat) && isValidCoordinate(v.position.lon);
      if (!hasPosition) {
        console.log('Vessel filtered out:', v.id, v.name, 'position:', v.position);
      }
      return hasPosition;
    });
    console.log('Vessels with positions:', valid.length, 'out of', vessels.length);
    return valid;
  }, [vessels]);

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

  // Render marker scale based on zoom
  const markerScale = Math.min(zoom, 1.5);

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
              <strong>{vesselsWithPositions.length}</strong>
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
              <span>Zoom:</span>
              <strong>{zoom.toFixed(1)}x</strong>
            </div>
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

        <div
          ref={mapRef}
          className={`visualization-map ${isDragging ? 'map-dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onWheel={handleWheel}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          role="img"
          aria-label="Interactive map of offshore installations and vessels"
        >
          {/* Ocean Background */}
          <div className="map-ocean-background" />

          {/* Grid Lines */}
          <svg className="map-grid-overlay" aria-hidden="true">
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>

          {/* Supply Bases (Macaé Port) */}
          {supplyBases.map((base) => {
            const baseY = latToY(base.location.latitude);
            const baseX = lonToX(base.location.longitude);
            return (
              <div
                key={base.id}
                className="map-marker map-marker--base"
                style={{
                  top: `${baseY}px`,
                  left: `${baseX}px`,
                  transform: `translate(-50%, -50%) scale(${markerScale})`,
                }}
                onMouseEnter={() => setHoveredMarker({ type: 'port', data: base })}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => setSelectedMarker({ type: 'port', data: base })}
              >
                <div className="map-marker-content">
                  <div className="map-marker-halo map-marker-halo--base" />
                  <IconPort size={32} />
                  <div className="map-marker-label">{base.name}</div>
                </div>
              </div>
            );
          })}

          {/* Installations */}
          {validInstallations.map((installation) => {
            const instY = latToY(installation.location.latitude);
            const instX = lonToX(installation.location.longitude);
            return (
              <div
                key={installation.id}
                className={`map-marker map-marker--installation map-marker--${installation.type.toLowerCase()}`}
                style={{
                  top: `${instY}px`,
                  left: `${instX}px`,
                  transform: `translate(-50%, -50%) scale(${markerScale})`,
                }}
                onMouseEnter={() => setHoveredMarker({ type: 'installation', data: installation })}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => setSelectedMarker({ type: 'installation', data: installation })}
              >
                <div className="map-marker-content">
                  <div className={`map-marker-halo ${installation.type === 'FPSO' ? 'map-marker-halo--fpso' : 'map-marker-halo--platform'}`} />
                  {installation.type === 'FPSO' ? (
                    <IconFPSO size={28} />
                  ) : (
                    <IconPlatform size={28} />
                  )}
                  <div className="map-marker-label">{installation.name}</div>
                </div>
              </div>
            );
          })}

          {/* All Vessels with Positions */}
          {vesselsWithPositions.map((vessel) => {
            const vesselY = latToY(vessel.position!.lat);
            const vesselX = lonToX(vessel.position!.lon);
            return (
              <div
                key={vessel.id}
                className={`map-marker map-marker--vessel map-marker--vessel-${vessel.status?.replace('_', '-') || 'default'}`}
                style={{
                  top: `${vesselY}px`,
                  left: `${vesselX}px`,
                  transform: `translate(-50%, -50%) scale(${markerScale})`,
                }}
                onMouseEnter={() => setHoveredMarker({ type: 'vessel', data: vessel })}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => setSelectedMarker({ type: 'vessel', data: vessel })}
              >
                <div className="map-marker-content">
                  <div className="map-marker-halo map-marker-halo--vessel" />
                  <IconVessel size={24} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredMarker && !selectedMarker && (
          <div
            className="map-hover-tooltip"
            style={{
              top: hoveredMarker.type === 'port'
                ? `${latToY((hoveredMarker.data as SupplyBase).location.latitude) + 50}px`
                : hoveredMarker.type === 'installation'
                ? `${latToY((hoveredMarker.data as Installation).location.latitude) + 50}px`
                : `${latToY((hoveredMarker.data as Vessel).position!.lat) + 40}px`,
              left: hoveredMarker.type === 'port'
                ? `${lonToX((hoveredMarker.data as SupplyBase).location.longitude)}px`
                : hoveredMarker.type === 'installation'
                ? `${lonToX((hoveredMarker.data as Installation).location.longitude)}px`
                : `${lonToX((hoveredMarker.data as Vessel).position!.lon)}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="map-hover-tooltip-name">
              {hoveredMarker.data.name}
            </div>
            <div className="map-hover-tooltip-hint">Click for details</div>
          </div>
        )}

        {/* Detail Panel */}
        {selectedMarker && (
          <Card variant="outlined" padding="md" className="map-detail-panel">
            <Stack direction="column" gap="md">
              <div className="map-detail-header">
                <div>
                  <h3>{selectedMarker.data.name}</h3>
                  <div className="map-detail-type">
                    {selectedMarker.type === 'port'
                      ? 'Supply Base'
                      : selectedMarker.type === 'installation'
                      ? (selectedMarker.data as Installation).type
                      : (selectedMarker.data as Vessel).type}
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
                {selectedMarker.type === 'port' && (
                  <>
                    <div className="map-detail-row">
                      <span>Port Code:</span>
                      <strong>{(selectedMarker.data as SupplyBase).port_code}</strong>
                    </div>
                    <div className="map-detail-row">
                      <span>Location:</span>
                      <strong>
                        {Math.abs((selectedMarker.data as SupplyBase).location.latitude).toFixed(4)}°S,{' '}
                        {Math.abs((selectedMarker.data as SupplyBase).location.longitude).toFixed(4)}°W
                      </strong>
                    </div>
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
                )}

                {selectedMarker.type === 'installation' && (() => {
                  const inst = selectedMarker.data as Installation;
                  const details = detailedInstallations[inst.id] || inst;
                  return (
                    <>
                      <div className="map-detail-row">
                        <span>Type:</span>
                        <strong>{inst.type}</strong>
                      </div>
                      <div className="map-detail-row">
                        <span>Location:</span>
                        <strong>
                          {Math.abs(inst.location.latitude).toFixed(4)}°S, {Math.abs(inst.location.longitude).toFixed(4)}°W
                        </strong>
                      </div>
                      {inst.distance_from_base_nm && (
                        <div className="map-detail-row">
                          <span>Distance from Base:</span>
                          <strong>{inst.distance_from_base_nm.toFixed(1)} NM</strong>
                        </div>
                      )}
                      {inst.location.water_depth_m && (
                        <div className="map-detail-row">
                          <span>Water Depth:</span>
                          <strong>{inst.location.water_depth_m.toFixed(0)} m</strong>
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
                            {details.storage_levels.slice(0, 5).map((storage: any, idx: number) => (
                              <div key={idx} className="map-detail-row">
                                <span>
                                  {storage.cargo_type_id}: {storage.current_level.toFixed(1)} / {storage.max_capacity.toFixed(1)} {storage.unit}
                                </span>
                                {storage.status && (
                                  <Badge
                                    variant={storage.status === 'Critical' ? 'error' : storage.status === 'Low' ? 'warning' : 'success'}
                                    size="sm"
                                  >
                                    {storage.status}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </Stack>
                        </div>
                      )}
                      {details.consumption_profile && details.consumption_profile.length > 0 && (
                        <div className="map-detail-section">
                          <div className="map-detail-section-title">Consumption:</div>
                          <Stack direction="column" gap="xs">
                            {details.consumption_profile.slice(0, 3).map((profile: any, idx: number) => (
                              <div key={idx} className="map-detail-row">
                                <span>
                                  {profile.cargo_type_id}: {profile.daily_consumption.toFixed(1)} {profile.unit}/day
                                </span>
                              </div>
                            ))}
                          </Stack>
                        </div>
                      )}
                    </>
                  );
                })()}

                {selectedMarker.type === 'vessel' && (() => {
                  const vessel = selectedMarker.data as Vessel;
                  const details = detailedVessels[vessel.id] || vessel;
                  return (
                    <>
                      <div className="map-detail-row">
                        <span>Type:</span>
                        <strong>{vessel.type}</strong>
                      </div>
                      <div className="map-detail-row">
                        <span>Status:</span>
                        <strong>{vessel.status.replace('_', ' ')}</strong>
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
              </div>
            </Stack>
          </Card>
        )}
      </div>
    </div>
  );
}
