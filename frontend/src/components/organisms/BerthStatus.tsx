import { memo } from 'react';
import './BerthStatus.css';
import type { Berth } from '../../types';
import { BerthCard } from '../display/BerthCard';
import { useRenderLogger } from '../../utils/renderLogger';
import { useRef } from 'react';

interface BerthStatusProps {
  berths: Berth[];
}

function BerthStatusComponent({ berths }: BerthStatusProps) {
  // Debug logging
  useRenderLogger('BerthStatus', { berths: berths?.length || 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!berths || berths.length === 0) {
    return (
      <div className="berth-status-empty">
        <p className="empty-message">No berths available</p>
      </div>
    );
  }

  return (
    <div className="berth-status" role="list" aria-label="Berth availability" ref={containerRef}>
      {berths.map((berth) => (
        <BerthCard.Root key={berth.id} berth={berth}>
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
      ))}
    </div>
  );
}

export default memo(BerthStatusComponent);
