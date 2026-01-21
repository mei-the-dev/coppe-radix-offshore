import { useState, useEffect, useRef } from 'react';
import type { Vessel, Berth } from '../../types';
import type { Platform, Port, VesselPosition, SimulationState } from '../../types/simulation';
import { IconVessel, IconPort, IconFPSO, IconPlatform, IconPlay, IconPause, IconReset } from '../../assets/icons';
import { Button } from '../action';
import { Stack } from '../layout';
import { Tooltip } from '../feedback';
import './Simulation.css';

interface SimulationProps {
  vessels: Vessel[];
  berths: Berth[];
  loadingPlans: unknown[];
}

export default function Simulation({ vessels, berths }: SimulationProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [port, setPort] = useState<Port | null>(null);
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    currentTime: new Date(),
    weekStart: new Date(),
    vessels: [],
    loadingOperations: [],
  });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    loadPlatforms();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (simState.isRunning) {
      startSimulation();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [simState.isRunning]);

  const loadPlatforms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/simulation/platforms');
      const data = await response.json();
      setPort(data.port);
      setPlatforms(data.platforms);
    } catch (err) {
      console.error('Error loading platforms:', err);
    }
  };

  const startSimulation = () => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // seconds
      lastUpdateRef.current = now;

      setSimState((prev: SimulationState) => {
        const newVessels = updateVesselPositions(prev.vessels, deltaTime, port, platforms);
        const newLoadingOps = updateLoadingOperations(prev.loadingOperations);
        const newTime = new Date(prev.currentTime.getTime() + deltaTime * 3600 * 1000); // 1 hour per second

        return {
          ...prev,
          vessels: newVessels,
          loadingOperations: newLoadingOps,
          currentTime: newTime,
        };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const updateVesselPositions = (
    currentVessels: VesselPosition[],
    deltaTime: number,
    port: Port | null,
    platforms: Platform[]
  ): VesselPosition[] => {
    if (!port) return currentVessels;

    return currentVessels.map(vessel => {
      if (vessel.status === 'loading') {
        return vessel; // Stay at port during loading
      }

      const destination = platforms.find(p => p.id === vessel.destination) || port;
      const currentPos = { lat: vessel.lat, lon: vessel.lon };
      const targetPos = { lat: destination.lat, lon: destination.lon };

      const distance = calculateDistance(currentPos, targetPos);
      const speedNmPerHour = vessel.speed;
      const distanceTraveled = (speedNmPerHour * deltaTime) / 3600; // NM

      if (distance < 0.1) {
        // Arrived
        if (vessel.status === 'transit' && destination.id !== port.id) {
          // Arrived at platform, start return journey
          return {
            ...vessel,
            status: 'returning',
            destination: port.id,
            progress: 0,
          };
        } else if (vessel.status === 'returning' && destination.id === port.id) {
          // Returned to port, start loading
          return {
            ...vessel,
            status: 'loading',
            lat: port.lat,
            lon: port.lon,
            progress: 0,
          };
        }
        return vessel;
      }

      // Move towards destination
      const progress = Math.min(100, vessel.progress + (distanceTraveled / distance) * 100);
      const ratio = progress / 100;
      const newLat = currentPos.lat + (targetPos.lat - currentPos.lat) * ratio;
      const newLon = currentPos.lon + (targetPos.lon - currentPos.lon) * ratio;

      return {
        ...vessel,
        lat: newLat,
        lon: newLon,
        progress,
      };
    });
  };

  const updateLoadingOperations = (
    operations: SimulationState['loadingOperations']
  ) => {
    return operations.map((op: any) => {
      const totalDuration = op.endTime.getTime() - op.startTime.getTime();
      const elapsed = Date.now() - op.startTime.getTime();
      const progress = Math.min(100, (elapsed / totalDuration) * 100);

      if (progress >= 100) {
        // Loading complete, vessel can depart
        return { ...op, progress: 100 };
      }

      return { ...op, progress };
    });
  };

  const calculateDistance = (pos1: { lat: number; lon: number }, pos2: { lat: number; lon: number }): number => {
    // Haversine formula for distance in NM
    const R = 3440; // Earth radius in NM
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lon - pos1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getVesselMetrics = (vesselPos: VesselPosition) => {
    const vessel = vessels.find(v => v.id === vesselPos.vesselId);
    if (!vessel) return null;

    const destination = platforms.find(p => p.id === vesselPos.destination) || port;
    const currentPos = { lat: vesselPos.lat, lon: vesselPos.lon };
    const targetPos = destination ? { lat: destination.lat, lon: destination.lon } : null;

    const distanceRemaining = targetPos ? calculateDistance(currentPos, targetPos) : 0;
    const etaHours = distanceRemaining > 0 ? distanceRemaining / vesselPos.speed : 0;
    const loadingOp = simState.loadingOperations.find(op => op.vesselId === vesselPos.vesselId);

    // Estimate fuel consumption based on status
    let fuelConsumption = 0;
    if (vesselPos.status === 'transit' || vesselPos.status === 'returning') {
      fuelConsumption = vessel.type === 'Standard PSV' ? 16.5 : vessel.type === 'Large PSV' ? 20 : 25; // tonnes/day
    } else if (vesselPos.status === 'loading') {
      fuelConsumption = vessel.type === 'Standard PSV' ? 3 : vessel.type === 'Large PSV' ? 5 : 7; // tonnes/day
    } else if (vesselPos.status === 'at_platform') {
      fuelConsumption = vessel.type === 'Standard PSV' ? 4 : vessel.type === 'Large PSV' ? 6 : 8; // tonnes/day
    }

    return {
      vessel,
      destination: destination?.name || 'Unknown',
      distanceRemaining: distanceRemaining.toFixed(1),
      etaHours: etaHours.toFixed(1),
      speed: vesselPos.speed.toFixed(1),
      progress: vesselPos.progress.toFixed(1),
      fuelConsumption: fuelConsumption.toFixed(1),
      loadingProgress: loadingOp ? loadingOp.progress.toFixed(1) : null,
      loadingTimeRemaining: loadingOp && loadingOp.progress < 100
        ? ((100 - loadingOp.progress) / 100 * 8).toFixed(1)
        : null,
    };
  };

  const getPlatformMetrics = (platform: Platform) => {
    // Mock consumption data based on inventory.md
    const consumptionRates: Record<string, { diesel: number; water: number; chemicals: number; deck: number }> = {
      'fpso-bravo': { diesel: 500, water: 400, chemicals: 100, deck: 150 },
      'platform-polvo': { diesel: 100, water: 100, chemicals: 20, deck: 50 },
      'fpso-valente': { diesel: 350, water: 250, chemicals: 100, deck: 150 },
      'fpso-forte': { diesel: 500, water: 400, chemicals: 120, deck: 200 },
      'fpso-peregrino': { diesel: 600, water: 400, chemicals: 150, deck: 180 },
      'platform-peregrino-a': { diesel: 50, water: 50, chemicals: 20, deck: 30 },
      'platform-peregrino-b': { diesel: 50, water: 50, chemicals: 20, deck: 30 },
      'platform-peregrino-c': { diesel: 50, water: 50, chemicals: 20, deck: 30 },
    };

    const consumption = consumptionRates[platform.id] || { diesel: 0, water: 0, chemicals: 0, deck: 0 };
    const transitTime = (platform.distance / 12.5).toFixed(1); // hours at average speed

    return {
      distance: platform.distance,
      transitTime,
      weeklyConsumption: consumption,
    };
  };

  const getPortMetrics = () => {
    const activeLoading = simState.loadingOperations.filter(op => op.progress < 100);
    const availableBerths = berths.filter(b => b.status === 'available').length;
    const occupiedBerths = berths.filter(b => b.status === 'occupied').length;

    return {
      totalBerths: berths.length,
      availableBerths,
      occupiedBerths,
      activeLoadingOps: activeLoading.length,
      loadingVessels: activeLoading.map((op: any) => {
        const vessel = vessels.find(v => v.id === op.vesselId);
        const berth = berths.find(b => b.id === op.berthId);
        return { vessel: vessel?.name, berth: berth?.name, progress: op.progress };
      }),
    };
  };

  const startWeeklySimulation = () => {
    // Initialize vessels for weekly simulation
    const initialVessels: VesselPosition[] = vessels
      .filter(v => v.status === 'available' || v.status === 'in_port')
      .slice(0, 3) // Start with 3 vessels
      .map((vessel, index) => {
        const targetPlatform = platforms[index % platforms.length];
        return {
          vesselId: vessel.id,
          vesselName: vessel.name,
          lat: port?.lat || -22.3833,
          lon: port?.lon || -41.7833,
          status: 'loading' as const,
          destination: targetPlatform.id,
          progress: 0,
          speed: vessel.operationalSpeed,
        };
      });

    const loadingOps = initialVessels.map((v, idx) => {
      const berth = berths[idx % berths.length];
      const loadingTime = 8; // hours
      return {
        vesselId: v.vesselId,
        berthId: berth.id,
        startTime: new Date(),
        endTime: new Date(Date.now() + loadingTime * 60 * 60 * 1000),
        progress: 0,
      };
    });

    setSimState({
      isRunning: true,
      currentTime: new Date(),
      weekStart: new Date(),
      vessels: initialVessels,
      loadingOperations: loadingOps,
    });
  };

  const stopSimulation = () => {
    setSimState((prev: SimulationState) => ({ ...prev, isRunning: false }));
  };

  const resetSimulation = () => {
    setSimState({
      isRunning: false,
      currentTime: new Date(),
      weekStart: new Date(),
      vessels: [],
      loadingOperations: [],
    });
  };

  // Calculate map bounds
  const allPoints = port && platforms.length > 0
    ? [port, ...platforms]
    : [];
  const minLat = allPoints.length > 0 ? Math.min(...allPoints.map(p => p.lat)) - 0.5 : -23;
  const maxLat = allPoints.length > 0 ? Math.max(...allPoints.map(p => p.lat)) + 0.5 : -21;
  const minLon = allPoints.length > 0 ? Math.min(...allPoints.map(p => p.lon)) - 0.5 : -42;
  const maxLon = allPoints.length > 0 ? Math.max(...allPoints.map(p => p.lon)) + 0.5 : -40;

  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;

  const latToY = (lat: number) => ((maxLat - lat) / latRange) * 100;
  const lonToX = (lon: number) => ((lon - minLon) / lonRange) * 100;

  return (
    <div className="simulation">
      <div className="simulation-controls">
        <h2>Weekly Vessel Delivery Simulation</h2>
        <Stack direction="row" gap="md" className="control-buttons">
          {!simState.isRunning ? (
            <Button
              variant="success"
              onClick={startWeeklySimulation}
              disabled={simState.isRunning}
            >
              <IconPlay size={18} />
              Start Simulation
            </Button>
          ) : (
            <Button
              variant="warning"
              onClick={stopSimulation}
              disabled={!simState.isRunning}
            >
              <IconPause size={18} />
              Pause
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={resetSimulation}
            disabled={simState.isRunning}
          >
            <IconReset size={18} />
            Reset
          </Button>
        </Stack>
        <div className="simulation-time">
          <strong>Simulation Time:</strong> {simState.currentTime.toLocaleString()}
        </div>
      </div>

      <div className="simulation-map-container">
        <div className="simulation-map">
          {/* Port */}
          {port && (() => {
            const metrics = getPortMetrics();
            return (
              <Tooltip
                content={
                  <div>
                    <h4>Port of Macaé</h4>
                    <div className="tooltip-divider" />
                    <div className="tooltip-section">
                      <div className="tooltip-row">
                        <span className="tooltip-label">Coordinates:</span>
                        <span className="tooltip-value">{port.lat.toFixed(4)}°S, {Math.abs(port.lon).toFixed(4)}°W</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Total Berths:</span>
                        <span className="tooltip-value">{metrics.totalBerths}</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Available:</span>
                        <span className="tooltip-value" style={{ color: 'var(--color-success)' }}>{metrics.availableBerths}</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Occupied:</span>
                        <span className="tooltip-value" style={{ color: 'var(--color-error)' }}>{metrics.occupiedBerths}</span>
                      </div>
                      {metrics.activeLoadingOps > 0 && (
                        <>
                          <div className="tooltip-divider" />
                          <div className="tooltip-section">
                            <strong>Active Loading ({metrics.activeLoadingOps}):</strong>
                            {metrics.loadingVessels.map((lv: any, idx: number) => (
                              <div key={idx} className="tooltip-row" style={{ marginTop: '0.25rem' }}>
                                <span className="tooltip-label">{lv.vessel}:</span>
                                <span className="tooltip-value">{Math.round(lv.progress)}%</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                }
                position="bottom"
              >
                <div
                  className="map-port"
                  style={{
                    left: `${lonToX(port.lon)}%`,
                    top: `${latToY(port.lat)}%`,
                  }}
                >
                  <div className="port-icon">
                    <IconPort size={32} />
                  </div>
                  <div className="port-label">{port.name}</div>
                </div>
              </Tooltip>
            );
          })()}

          {/* Platforms */}
          {platforms.map(platform => {
            const metrics = getPlatformMetrics(platform);
            return (
              <Tooltip
                key={platform.id}
                content={
                  <div>
                    <h4>{platform.name}</h4>
                    <div className="tooltip-divider" />
                    <div className="tooltip-section">
                      <div className="tooltip-row">
                        <span className="tooltip-label">Type:</span>
                        <span className="tooltip-value">{platform.type}</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Distance:</span>
                        <span className="tooltip-value">{platform.distance} NM</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Transit Time:</span>
                        <span className="tooltip-value">~{metrics.transitTime}h @ 12.5 kts</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Coordinates:</span>
                        <span className="tooltip-value">{platform.lat.toFixed(3)}°S, {Math.abs(platform.lon).toFixed(3)}°W</span>
                      </div>
                    </div>
                    <div className="tooltip-divider" />
                    <div className="tooltip-section">
                      <strong>Weekly Consumption:</strong>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Diesel:</span>
                        <span className="tooltip-value">{metrics.weeklyConsumption.diesel} m³</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Water:</span>
                        <span className="tooltip-value">{metrics.weeklyConsumption.water} m³</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Chemicals:</span>
                        <span className="tooltip-value">{metrics.weeklyConsumption.chemicals} m³</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Deck Cargo:</span>
                        <span className="tooltip-value">{metrics.weeklyConsumption.deck} t</span>
                      </div>
                    </div>
                  </div>
                }
                position="top"
              >
                <div
                  className={`map-platform platform-${platform.type.toLowerCase()}`}
                  style={{
                    left: `${lonToX(platform.lon)}%`,
                    top: `${latToY(platform.lat)}%`,
                  }}
                >
                  <div className="platform-icon">
                    {platform.type === 'FPSO' ? <IconFPSO size={40} /> : <IconPlatform size={32} />}
                  </div>
                  <div className="platform-label">{platform.name}</div>
                </div>
              </Tooltip>
            );
          })}

          {/* Vessels */}
          {simState.vessels.map((vesselPos: VesselPosition) => {
            const loadingOp = simState.loadingOperations.find((op: any) => op.vesselId === vesselPos.vesselId);
            const isAtPort = vesselPos.status === 'loading' && loadingOp;
            const metrics = getVesselMetrics(vesselPos);

            if (!metrics) return null;

            return (
              <Tooltip
                key={vesselPos.vesselId}
                content={
                  <div>
                    <h4>{metrics.vessel.name}</h4>
                    <div className="tooltip-divider" />
                    <div className="tooltip-section">
                      <div className="tooltip-row">
                        <span className="tooltip-label">Type:</span>
                        <span className="tooltip-value">{metrics.vessel.type}</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Status:</span>
                        <span className="tooltip-value" style={{ textTransform: 'capitalize' }}>{vesselPos.status.replace('_', ' ')}</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">DP Class:</span>
                        <span className="tooltip-value">{metrics.vessel.dpClass}</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Current Speed:</span>
                        <span className="tooltip-value">{metrics.speed} knots</span>
                      </div>
                    </div>
                    {vesselPos.status !== 'loading' && (
                      <>
                        <div className="tooltip-divider" />
                        <div className="tooltip-section">
                          <div className="tooltip-row">
                            <span className="tooltip-label">Destination:</span>
                            <span className="tooltip-value">{metrics.destination}</span>
                          </div>
                          <div className="tooltip-row">
                            <span className="tooltip-label">Distance Remaining:</span>
                            <span className="tooltip-value">{metrics.distanceRemaining} NM</span>
                          </div>
                          <div className="tooltip-row">
                            <span className="tooltip-label">Progress:</span>
                            <span className="tooltip-value">{metrics.progress}%</span>
                          </div>
                          <div className="tooltip-row">
                            <span className="tooltip-label">ETA:</span>
                            <span className="tooltip-value">~{metrics.etaHours}h</span>
                          </div>
                        </div>
                      </>
                    )}
                    {vesselPos.status === 'loading' && metrics.loadingProgress && (
                      <>
                        <div className="tooltip-divider" />
                        <div className="tooltip-section">
                          <div className="tooltip-row">
                            <span className="tooltip-label">Loading Progress:</span>
                            <span className="tooltip-value">{metrics.loadingProgress}%</span>
                          </div>
                          {metrics.loadingTimeRemaining && (
                            <div className="tooltip-row">
                              <span className="tooltip-label">Time Remaining:</span>
                              <span className="tooltip-value">~{metrics.loadingTimeRemaining}h</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <div className="tooltip-divider" />
                    <div className="tooltip-section">
                      <div className="tooltip-row">
                        <span className="tooltip-label">Fuel Consumption:</span>
                        <span className="tooltip-value">{metrics.fuelConsumption} t/day</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Deck Capacity:</span>
                        <span className="tooltip-value">{metrics.vessel.deckCargoCapacity} t</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Liquid Capacity:</span>
                        <span className="tooltip-value">{metrics.vessel.liquidMudCapacity} m³</span>
                      </div>
                    </div>
                  </div>
                }
                position="top"
              >
                <div
                  className={`map-vessel vessel-${vesselPos.status}`}
                  style={{
                    left: `${lonToX(vesselPos.lon)}%`,
                    top: `${latToY(vesselPos.lat)}%`,
                  }}
                >
                  <div className="vessel-icon">
                    <IconVessel size={28} />
                  </div>
                  {isAtPort && loadingOp && (
                    <div className="loading-indicator">
                      <div className="loading-bar" style={{ width: `${loadingOp.progress}%` }}></div>
                      <span>Loading {Math.round(loadingOp.progress)}%</span>
                    </div>
                  )}
                  <div className="vessel-label">{vesselPos.vesselName}</div>
                  <div className="vessel-status">{vesselPos.status}</div>
                </div>
              </Tooltip>
            );
          })}

          {/* Routes (lines from port to platforms) */}
          {port && platforms.map(platform => (
            <svg
              key={`route-${platform.id}`}
              className="route-line"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <line
                x1={`${lonToX(port.lon)}%`}
                y1={`${latToY(port.lat)}%`}
                x2={`${lonToX(platform.lon)}%`}
                y2={`${latToY(platform.lat)}%`}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.3"
              />
            </svg>
          ))}
        </div>
      </div>

      <div className="simulation-stats">
        <div className="stat-card">
          <h3>Active Vessels</h3>
          <div className="stat-value">{simState.vessels.length}</div>
        </div>
        <div className="stat-card">
          <h3>Loading Operations</h3>
          <div className="stat-value">{simState.loadingOperations.filter((op: any) => op.progress < 100).length}</div>
        </div>
        <div className="stat-card">
          <h3>In Transit</h3>
          <div className="stat-value">{simState.vessels.filter((v: VesselPosition) => v.status === 'transit' || v.status === 'returning').length}</div>
        </div>
      </div>
    </div>
  );
}
