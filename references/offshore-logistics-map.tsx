import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// Constants
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 8;
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

// Type definitions
interface Location {
  latitude: number;
  longitude: number;
  water_depth_m?: number;
}

interface Installation {
  id: string;
  name: string;
  type: 'FPSO' | 'FixedPlatform' | 'WellheadPlatform';
  location: Location;
  distance_from_base_nm?: number;
  production_capacity_bpd?: number;
  storage_levels?: Array<{
    cargo_type_id: string;
    max_capacity: number;
    current_level: number;
    safety_stock: number;
    unit: string;
    status: string;
  }>;
}

interface Vessel {
  id: string;
  name: string;
  type: string;
  status: string;
  position?: { lat: number; lon: number };
  currentLocation?: string;
  destination?: string;
  loa_m?: number;
  beam_m?: number;
  deck_cargo_capacity_t?: number;
  operational_speed_kts?: number;
  dp_class?: string;
  heading?: number;
}

interface Berth {
  id: string;
  name: string;
  status: string;
  maxLength: number;
  maxDraught: number;
}

interface VisualizationProps {
  vessels: Vessel[];
  berths: Berth[];
  installations?: Installation[];
  onError?: (error: Error) => void;
}

// Icon components
const IconPort = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/>
    <path d="M12 12v10"/>
    <path d="M7 9.5l5 2.5 5-2.5"/>
  </svg>
);

const IconFPSO = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="8" width="18" height="10" rx="2"/>
    <path d="M3 13h18"/>
    <circle cx="8" cy="10.5" r="0.5" fill="currentColor"/>
    <circle cx="16" cy="10.5" r="0.5" fill="currentColor"/>
  </svg>
);

const IconPlatform = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="12" rx="1"/>
    <path d="M7 16v4M12 16v4M17 16v4"/>
    <path d="M4 10h16"/>
  </svg>
);

const IconVessel = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 18l9-15 9 15H3z"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const IconZoomIn = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
  </svg>
);

const IconZoomOut = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35M8 11h6"/>
  </svg>
);

const IconReset = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
  </svg>
);

const IconClose = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const IconLayers = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const IconSearch = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconMaximize = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
);

const IconRuler = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.42 8.58l-6-6a2 2 0 0 0-2.83 0l-12 12a2 2 0 0 0 0 2.83l6 6a2 2 0 0 0 2.83 0l12-12a2 2 0 0 0 0-2.83z"/>
    <path d="M6.5 9.5l1 1M9.5 6.5l1 1M12.5 9.5l1 1M9.5 12.5l1 1"/>
  </svg>
);

// Helper functions
const isValidCoordinate = (value: number | undefined | null): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function OffshoreLogisticsMap({ 
  vessels, 
  berths, 
  installations = [],
  onError 
}: VisualizationProps) {
  // State
  const [selectedMarker, setSelectedMarker] = useState<{ type: string; data: any } | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<{ type: string; data: any } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapSize, setMapSize] = useState(DEFAULT_MAP_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [measuringMode, setMeasuringMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<Array<{ lat: number; lon: number }>>([]);
  const [pinchStart, setPinchStart] = useState<number | null>(null);
  
  // Layer visibility
  const [layers, setLayers] = useState({
    vessels: true,
    installations: true,
    routes: true,
    labels: true,
    grid: true
  });
  
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMarker(null);
        setMeasuringMode(false);
        setMeasurePoints([]);
        setShowSearch(false);
        setShowLayers(false);
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowSearch(prev => !prev);
      } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowLayers(prev => !prev);
      } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleResetView();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Update map size with ResizeObserver
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

  // Calculate map bounds
  const mapBounds = useMemo(() => {
    try {
      const allPoints: Array<{ lat: number; lon: number }> = [
        { lat: MACAE_PORT.location.latitude, lon: MACAE_PORT.location.longitude }
      ];

      installations.forEach(inst => {
        if (isValidCoordinate(inst.location?.latitude) && isValidCoordinate(inst.location?.longitude)) {
          allPoints.push({ lat: inst.location.latitude, lon: inst.location.longitude });
        }
      });

      vessels.forEach(vessel => {
        if (vessel.position && isValidCoordinate(vessel.position.lat) && isValidCoordinate(vessel.position.lon)) {
          allPoints.push({ lat: vessel.position.lat, lon: vessel.position.lon });
        }
      });

      if (allPoints.length === 0) {
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
      onError?.(error instanceof Error ? error : new Error('Failed to calculate map bounds'));
      return { minLat: -23.0, maxLat: -21.0, minLon: -42.0, maxLon: -40.0 };
    }
  }, [installations, vessels, onError]);

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

  // Inverse conversion for measuring
  const xToLon = useCallback((x: number): number => {
    const baseX = (x - pan.x - centerOffset.x) / zoom;
    return (baseX / mapScales.scaleX) + mapBounds.minLon;
  }, [pan.x, centerOffset.x, zoom, mapScales.scaleX, mapBounds.minLon]);

  const yToLat = useCallback((y: number): number => {
    const baseY = (y - pan.y - centerOffset.y) / zoom;
    return mapBounds.maxLat - (baseY / mapScales.scaleY);
  }, [pan.y, centerOffset.y, zoom, mapScales.scaleY, mapBounds.maxLat]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    if (measuringMode) {
      const rect = mapRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const lat = yToLat(y);
        const lon = xToLon(x);
        setMeasurePoints(prev => [...prev, { lat, lon }]);
      }
      return;
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.preventDefault();
  }, [pan, measuringMode, yToLat, xToLon]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers with pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setPinchStart(distance);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
    e.preventDefault();
  }, [pan]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && pinchStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = distance / pinchStart;
      setZoom(prev => clamp(prev * scale, ZOOM_MIN, ZOOM_MAX));
      setPinchStart(distance);
    } else if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
    e.preventDefault();
  }, [isDragging, dragStart, pinchStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setPinchStart(null);
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
    setMeasurePoints([]);
    setMeasuringMode(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => clamp(prev * delta, ZOOM_MIN, ZOOM_MAX));
  }, []);

  // Attach/detach event listeners
  useEffect(() => {
    if (!isDragging && !pinchStart) return;

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
  }, [isDragging, pinchStart, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Filter vessels and installations
  const vesselsInTransit = useMemo(() => 
    vessels.filter(v => v.status === 'in_transit' && v.position), 
    [vessels]
  );

  const filteredEntities = useMemo(() => {
    if (!searchQuery) return { vessels, installations };
    
    const query = searchQuery.toLowerCase();
    return {
      vessels: vessels.filter(v => 
        v.name.toLowerCase().includes(query) || 
        v.type.toLowerCase().includes(query) ||
        v.currentLocation?.toLowerCase().includes(query)
      ),
      installations: installations.filter(i => 
        i.name.toLowerCase().includes(query) || 
        i.type.toLowerCase().includes(query)
      )
    };
  }, [vessels, installations, searchQuery]);

  // Calculate scale bar
  const scaleBarWidth = useMemo(() => {
    const nmPerPixel = 1 / (mapScales.scaleX * zoom * 60); // Approximate
    const desiredNM = 50; // Show 50 NM scale
    return desiredNM / nmPerPixel;
  }, [mapScales.scaleX, zoom]);

  const markerScale = Math.min(zoom, 1.5);

  // Find installation by vessel destination
  const getVesselDestination = (vessel: Vessel) => {
    if (!vessel.destination) return null;
    return installations.find(i => 
      i.name === vessel.destination || 
      vessel.destination?.includes(i.name)
    );
  };

  return (
    <div ref={containerRef} className="w-full h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Offshore Logistics Map</h1>
            <p className="text-sm text-slate-600">Campos Basin, Brazil • Real-time tracking</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
              title="Search (Ctrl+F)"
            >
              <IconSearch size={20} />
            </button>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`p-2 rounded-lg transition-colors ${showLayers ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
              title="Layers (Ctrl+L)"
            >
              <IconLayers size={20} />
            </button>
            <button
              onClick={() => {
                setMeasuringMode(!measuringMode);
                setMeasurePoints([]);
              }}
              className={`p-2 rounded-lg transition-colors ${measuringMode ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
              title="Measure distance"
            >
              <IconRuler size={20} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Toggle fullscreen"
            >
              <IconMaximize size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <main className="flex-1 relative overflow-hidden">
        {/* Search Panel */}
        {showSearch && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white rounded-lg shadow-2xl p-4 w-96">
            <div className="flex items-center gap-2 mb-3">
              <IconSearch size={20} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search vessels, installations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm"
                autoFocus
              />
              <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600">
                <IconClose size={18} />
              </button>
            </div>
            {searchQuery && (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredEntities.vessels.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedMarker({ type: 'vessel', data: v });
                      setShowSearch(false);
                      if (v.position) {
                        const targetX = lonToX(v.position.lon);
                        const targetY = latToY(v.position.lat);
                        setPan({ 
                          x: mapSize.width / 2 - targetX / zoom,
                          y: mapSize.height / 2 - targetY / zoom
                        });
                      }
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm"
                  >
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.type} • {v.status}</div>
                  </button>
                ))}
                {filteredEntities.installations.map(i => (
                  <button
                    key={i.id}
                    onClick={() => {
                      setSelectedMarker({ type: 'installation', data: i });
                      setShowSearch(false);
                      const targetX = lonToX(i.location.longitude);
                      const targetY = latToY(i.location.latitude);
                      setPan({ 
                        x: mapSize.width / 2 - targetX / zoom,
                        y: mapSize.height / 2 - targetY / zoom
                      });
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm"
                  >
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-slate-500">{i.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Layers Panel */}
        {showLayers && (
          <div className="absolute top-4 right-20 z-30 bg-white rounded-lg shadow-2xl p-4 w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Map Layers</h3>
              <button onClick={() => setShowLayers(false)} className="text-slate-400 hover:text-slate-600">
                <IconClose size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(layers).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setLayers(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="Zoom In (+)"
          >
            <IconZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="Zoom Out (-)"
          >
            <IconZoomOut size={20} />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
            title="Reset View (Ctrl+R)"
          >
            <IconReset size={20} />
          </button>
        </div>

        {/* Stats Panel */}
        <aside className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 w-64">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center justify-between">
            <span>Live Statistics</span>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Supply Bases:</dt>
              <dd className="font-semibold">1</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Installations:</dt>
              <dd className="font-semibold">{installations.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Vessels in Transit:</dt>
              <dd className="font-semibold text-green-600">{vesselsInTransit.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Total Vessels:</dt>
              <dd className="font-semibold">{vessels.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Berths:</dt>
              <dd className="font-semibold">{berths.length}</dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <dt className="text-slate-600">Zoom:</dt>
              <dd className="font-semibold">{zoom.toFixed(1)}x</dd>
            </div>
          </dl>
        </aside>

        {/* Compass */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-bold text-red-600">N</div>
            </div>
            <svg viewBox="0 0 48 48" className="w-full h-full">
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300" />
              <path d="M24 8 L28 20 L24 16 L20 20 Z" fill="currentColor" className="text-red-600" />
              <circle cx="24" cy="24" r="2" fill="currentColor" className="text-slate-400" />
            </svg>
          </div>
        </div>

        {/* Scale Bar */}
        <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
          <div className="text-xs text-slate-600 mb-1 text-center">Scale</div>
          <div className="flex items-end gap-1">
            <div 
              className="h-1 bg-slate-900 border-l-2 border-r-2 border-slate-900"
              style={{ width: `${Math.min(scaleBarWidth, 150)}px` }}
            />
          </div>
          <div className="text-xs text-slate-600 mt-1 text-center">50 NM</div>
        </div>

        {/* Measuring Mode Indicator */}
        {measuringMode && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
            <IconRuler size={16} />
            <span>Click on map to measure distance • {measurePoints.length} point{measurePoints.length !== 1 ? 's' : ''}</span>
            <button 
              onClick={() => {
                setMeasuringMode(false);
                setMeasurePoints([]);
              }}
              className="ml-2 hover:bg-blue-700 px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Map */}
        <div
          ref={mapRef}
          className="w-full h-full relative"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onWheel={handleWheel}
          style={{ cursor: measuringMode ? 'crosshair' : isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Ocean Background with depth gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50" />
          
          {/* Grid Lines */}
          {layers.grid && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-300"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Route Lines */}
          {layers.routes && vesselsInTransit.map((vessel) => {
            const destination = getVesselDestination(vessel);
            if (!destination || !vessel.position) return null;

            return (
              <svg key={`route-${vessel.id}`} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <line
                  x1={lonToX(vessel.position.lon)}
                  y1={latToY(vessel.position.lat)}
                  x2={lonToX(destination.location.longitude)}
                  y2={latToY(destination.location.latitude)}
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              </svg>
            );
          })}

          {/* Measuring Lines */}
          {measurePoints.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
              {measurePoints.map((point, idx) => (
                <g key={idx}>
                  <circle
                    cx={lonToX(point.lon)}
                    cy={latToY(point.lat)}
                    r="6"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {idx > 0 && (
                    <>
                      <line
                        x1={lonToX(measurePoints[idx - 1].lon)}
                        y1={latToY(measurePoints[idx - 1].lat)}
                        x2={lonToX(point.lon)}
                        y2={latToY(point.lat)}
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />
                      <text
                        x={(lonToX(measurePoints[idx - 1].lon) + lonToX(point.lon)) / 2}
                        y={(latToY(measurePoints[idx - 1].lat) + latToY(point.lat)) / 2 - 10}
                        fill="#1e40af"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {calculateDistance(
                          measurePoints[idx - 1].lat,
                          measurePoints[idx - 1].lon,
                          point.lat,
                          point.lon
                        ).toFixed(1)} NM
                      </text>
                    </>
                  )}
                </g>
              ))}
            </svg>
          )}

          {/* Macaé Port */}
          <div
            className="absolute transition-all duration-200"
            style={{
              top: `${latToY(MACAE_PORT.location.latitude)}px`,
              left: `${lonToX(MACAE_PORT.location.longitude)}px`,
              transform: `translate(-50%, -50%) scale(${markerScale})`,
              zIndex: 10
            }}
            onMouseEnter={() => setHoveredMarker({ type: 'port', data: MACAE_PORT })}
            onMouseLeave={() => setHoveredMarker(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMarker({ type: 'port', data: MACAE_PORT });
            }}
          >
            <div className="relative cursor-pointer group">
              <div className="absolute -inset-4 bg-blue-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute -inset-6 bg-blue-400 rounded-full opacity-10 animate-ping" />
              <IconPort size={32} className="text-blue-600 relative z-10 drop-shadow-lg" />
              {layers.labels && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded shadow-lg text-xs font-semibold text-slate-700 whitespace-nowrap pointer-events-none">
                  {MACAE_PORT.name}
                </div>
              )}
            </div>
          </div>

          {/* Installations */}
          {layers.installations && installations.map((inst) => {
            if (!isValidCoordinate(inst.location?.latitude) || !isValidCoordinate(inst.location?.longitude)) {
              return null;
            }
            
            return (
              <div
                key={inst.id}
                className="absolute transition-all duration-200"
                style={{
                  top: `${latToY(inst.location.latitude)}px`,
                  left: `${lonToX(inst.location.longitude)}px`,
                  transform: `translate(-50%, -50%) scale(${markerScale})`,
                  zIndex: 10
                }}
                onMouseEnter={() => setHoveredMarker({ type: 'installation', data: inst })}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarker({ type: 'installation', data: inst });
                }}
              >
                <div className="relative cursor-pointer group">
                  <div className={`absolute -inset-4 rounded-full opacity-20 group-hover:opacity-40 transition-opacity ${
                    inst.type === 'FPSO' ? 'bg-orange-500' : 'bg-purple-500'
                  }`} />
                  {inst.type === 'FPSO' ? (
                    <IconFPSO size={28} className="text-orange-600 relative z-10 drop-shadow-lg" />
                  ) : (
                    <IconPlatform size={28} className="text-purple-600 relative z-10 drop-shadow-lg" />
                  )}
                  {layers.labels && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded shadow-lg text-xs font-semibold text-slate-700 whitespace-nowrap pointer-events-none">
                      {inst.name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Vessels */}
          {layers.vessels && vesselsInTransit.map((vessel) => {
            if (!vessel.position || !isValidCoordinate(vessel.position.lat) || !isValidCoordinate(vessel.position.lon)) {
              return null;
            }

            const heading = vessel.heading || 0;

            return (
              <div
                key={vessel.id}
                className="absolute transition-all duration-200"
                style={{
                  top: `${latToY(vessel.position.lat)}px`,
                  left: `${lonToX(vessel.position.lon)}px`,
                  transform: `translate(-50%, -50%) scale(${markerScale}) rotate(${heading}deg)`,
                  zIndex: 15
                }}
                onMouseEnter={() => setHoveredMarker({ type: 'vessel', data: vessel })}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarker({ type: 'vessel', data: vessel });
                }}
              >
                <div className="relative cursor-pointer group">
                  <div className="absolute -inset-3 bg-green-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute -inset-5 bg-green-400 rounded-full opacity-10 animate-pulse" />
                  <IconVessel size={24} className="text-green-600 relative z-10 drop-shadow-lg" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredMarker && !selectedMarker && (
          <div 
            className="absolute z-20 bg-slate-900 text-white rounded-lg shadow-xl p-3 text-sm pointer-events-none max-w-xs"
            style={{
              top: hoveredMarker.type === 'port' 
                ? `${latToY(hoveredMarker.data.location.latitude) + 50}px`
                : hoveredMarker.type === 'installation'
                ? `${latToY(hoveredMarker.data.location.latitude) + 50}px`
                : `${latToY(hoveredMarker.data.position.lat) + 40}px`,
              left: hoveredMarker.type === 'port'
                ? `${lonToX(hoveredMarker.data.location.longitude)}px`
                : hoveredMarker.type === 'installation'
                ? `${lonToX(hoveredMarker.data.location.longitude)}px`
                : `${lonToX(hoveredMarker.data.position.lon)}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold">{hoveredMarker.data.name}</div>
            <div className="text-xs text-slate-300 mt-1">
              {hoveredMarker.type === 'vessel' && hoveredMarker.data.currentLocation}
              {hoveredMarker.type === 'installation' && `${hoveredMarker.data.type} • ${hoveredMarker.data.distance_from_base_nm?.toFixed(0)} NM from base`}
              {hoveredMarker.type === 'port' && `${berths.length} berths`}
            </div>
            <div className="text-xs text-blue-300 mt-2">Click for details</div>
          </div>
        )}

        {/* Detail Panel */}
        {selectedMarker && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white rounded-xl shadow-2xl p-6 w-[28rem] max-h-[32rem] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">{selectedMarker.data.name}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedMarker.type === 'port' 
                    ? 'Supply Base' 
                    : selectedMarker.type === 'installation' 
                    ? selectedMarker.data.type 
                    : selectedMarker.data.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded"
              >
                <IconClose size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedMarker.type === 'port' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Port Code</div>
                      <div className="font-semibold text-lg">{selectedMarker.data.port_code}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Total Berths</div>
                      <div className="font-semibold text-lg">{berths.length}</div>
                    </div>
                  </div>
                  {berths.length > 0 && (
                    <div className="mt-4">
                      <div className="font-semibold text-slate-700 mb-3">Berth Status</div>
                      <div className="space-y-2">
                        {berths.map(berth => (
                          <div key={berth.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                            <div>
                              <div className="font-medium">{berth.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">Max: {berth.maxLength}m × {berth.maxDraught}m</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              berth.status === 'occupied' ? 'bg-red-100 text-red-700' :
                              berth.status === 'available' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {berth.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedMarker.type === 'installation' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMarker.data.distance_from_base_nm && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 mb-1">Distance</div>
                        <div className="font-semibold text-lg">{selectedMarker.data.distance_from_base_nm.toFixed(1)} NM</div>
                      </div>
                    )}
                    {selectedMarker.data.location?.water_depth_m && (
                      <div className="bg-cyan-50 p-3 rounded-lg">
                        <div className="text-xs text-cyan-600 mb-1">Water Depth</div>
                        <div className="font-semibold text-lg">{selectedMarker.data.location.water_depth_m.toFixed(0)} m</div>
                      </div>
                    )}
                    {selectedMarker.data.production_capacity_bpd && (
                      <div className="bg-orange-50 p-3 rounded-lg col-span-2">
                        <div className="text-xs text-orange-600 mb-1">Production Capacity</div>
                        <div className="font-semibold text-lg">{selectedMarker.data.production_capacity_bpd.toLocaleString()} bpd</div>
                      </div>
                    )}
                  </div>
                  {selectedMarker.data.storage_levels && selectedMarker.data.storage_levels.length > 0 && (
                    <div className="mt-4">
                      <div className="font-semibold text-slate-700 mb-3">Storage Levels</div>
                      <div className="space-y-3">
                        {selectedMarker.data.storage_levels.map((storage: any, idx: number) => {
                          const percentage = (storage.current_level / storage.max_capacity) * 100;
                          return (
                            <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{storage.cargo_type_id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  storage.status === 'Critical' ? 'bg-red-100 text-red-700' :
                                  storage.status === 'Low' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {storage.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
                                    <div
                                      className={`h-3 rounded-full transition-all duration-500 ${
                                        storage.status === 'Critical' ? 'bg-red-500' :
                                        storage.status === 'Low' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                                    <span>{storage.current_level.toFixed(1)} {storage.unit}</span>
                                    <span>{storage.max_capacity.toFixed(1)} {storage.unit}</span>
                                  </div>
                                </div>
                                <div className="text-lg font-bold text-slate-700">
                                  {percentage.toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedMarker.type === 'vessel' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg col-span-2">
                      <div className="text-xs text-green-600 mb-1">Status</div>
                      <div className="font-semibold text-lg capitalize flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {selectedMarker.data.status.replace('_', ' ')}
                      </div>
                    </div>
                    {selectedMarker.data.loa_m && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Length</div>
                        <div className="font-semibold">{selectedMarker.data.loa_m} m</div>
                      </div>
                    )}
                    {selectedMarker.data.beam_m && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Beam</div>
                        <div className="font-semibold">{selectedMarker.data.beam_m} m</div>
                      </div>
                    )}
                    {selectedMarker.data.deck_cargo_capacity_t && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 mb-1">Deck Capacity</div>
                        <div className="font-semibold">{selectedMarker.data.deck_cargo_capacity_t.toLocaleString()} t</div>
                      </div>
                    )}
                    {selectedMarker.data.operational_speed_kts && (
                      <div className="bg-cyan-50 p-3 rounded-lg">
                        <div className="text-xs text-cyan-600 mb-1">Speed</div>
                        <div className="font-semibold">{selectedMarker.data.operational_speed_kts} kts</div>
                      </div>
                    )}
                  </div>
                  {selectedMarker.data.currentLocation && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Current Location</div>
                      <div className="font-medium">{selectedMarker.data.currentLocation}</div>
                    </div>
                  )}
                  {selectedMarker.data.position && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Coordinates</div>
                      <div className="font-mono text-sm">
                        {Math.abs(selectedMarker.data.position.lat).toFixed(4)}°S, {Math.abs(selectedMarker.data.position.lon).toFixed(4)}°W
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs text-slate-600">
        <div className="font-semibold mb-1">Shortcuts:</div>
        <div>Ctrl+F: Search • Ctrl+L: Layers • +/-: Zoom • Esc: Close</div>
      </div>
    </div>
  );
}