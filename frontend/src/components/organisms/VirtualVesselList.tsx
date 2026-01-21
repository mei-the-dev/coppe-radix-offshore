import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Vessel } from '../../types';
import { VesselCard } from '../display/VesselCard';
import './VirtualVesselList.css';

interface VirtualVesselListProps {
  vessels: Vessel[];
  height?: number;
}

export function VirtualVesselList({ vessels, height = 600 }: VirtualVesselListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: vessels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  if (vessels.length === 0) {
    return (
      <div className="vessel-list-empty">
        <p className="empty-message">No vessels available</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="virtual-vessel-list"
      style={{ height: `${height}px`, overflow: 'auto' }}
      role="list"
      aria-label="Vessel fleet"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const vessel = vessels[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <VesselCard.Root vessel={vessel}>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
