import { memo } from 'react';
import './VesselList.css';
import type { Vessel } from '../../types';
import { VesselCard } from '../display/VesselCard';
import { useRenderLogger } from '../../utils/renderLogger';
import { useEffect, useRef } from 'react';
import { trackRender } from '../../utils/debug';

interface VesselListProps {
  vessels: Vessel[];
}

function VesselListComponent({ vessels }: VesselListProps) {
  // Debug logging
  useRenderLogger('VesselList', { vessels: vessels?.length || 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      trackRender('VesselList', { vesselCount: vessels?.length || 0 });
    }
  }, [vessels]);

  if (!vessels || vessels.length === 0) {
    return (
      <div className="vessel-list-empty">
        <p className="empty-message">No vessels available</p>
      </div>
    );
  }

  return (
    <div className="vessel-list" role="list" aria-label="Vessel fleet" ref={containerRef}>
      {vessels.map((vessel) => (
        <VesselCard.Root key={vessel.id} vessel={vessel}>
          <VesselCard.Header>
            <VesselCard.Title />
            <VesselCard.Status />
          </VesselCard.Header>
          <VesselCard.Details>
            <VesselCard.Type />
            <VesselCard.Location />
            <VesselCard.Capacity />
          </VesselCard.Details>
        </VesselCard.Root>
      ))}
    </div>
  );
}

export default memo(VesselListComponent);
