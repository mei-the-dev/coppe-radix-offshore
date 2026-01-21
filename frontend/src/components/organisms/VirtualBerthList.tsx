import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Berth } from '../../types';
import { BerthCard } from '../display/BerthCard';
import './VirtualBerthList.css';

interface VirtualBerthListProps {
  berths: Berth[];
  height?: number;
}

export function VirtualBerthList({ berths, height = 600 }: VirtualBerthListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: berths.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
  });

  if (berths.length === 0) {
    return (
      <div className="berth-list-empty">
        <p className="empty-message">No berths available</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="virtual-berth-list"
      style={{ height: `${height}px`, overflow: 'auto' }}
      role="list"
      aria-label="Berth availability"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const berth = berths[virtualRow.index];
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
              <BerthCard.Root berth={berth}>
                <BerthCard.Header>
                  <BerthCard.Title />
                  <BerthCard.Status />
                </BerthCard.Header>
                <BerthCard.Specs>
                  <BerthCard.SpecItem label="Max Draught" value={`${berth.maxDraught}m`} />
                  <BerthCard.SpecItem label="Max Length" value={`${berth.maxLength}m`} />
                  <BerthCard.SpecItem label="Max DWT" value={`${berth.maxDeadweight}t`} />
                </BerthCard.Specs>
                {berth.currentVesselId && <BerthCard.CurrentVessel />}
              </BerthCard.Root>
            </div>
          );
        })}
      </div>
    </div>
  );
}
