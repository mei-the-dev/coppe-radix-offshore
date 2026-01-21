import React, { createContext, useContext } from 'react';
import type { Berth } from '../../../types';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Stack } from '../../layout';
import './BerthCard.css';

const BerthCardContext = createContext<Berth | null>(null);

// Map berth status to Badge variant
const getStatusVariant = (status: Berth['status']): 'success' | 'info' | 'warning' | 'error' => {
  switch (status) {
    case 'available': return 'success';
    case 'occupied': return 'error';
    case 'reserved': return 'warning';
    case 'maintenance': return 'error';
    default: return 'info';
  }
};

interface RootProps {
  berth: Berth;
  children: React.ReactNode;
  className?: string;
}

function Root({ berth, children, className }: RootProps) {
  return (
    <BerthCardContext.Provider value={berth}>
      <Card variant="default" padding="md" hoverable className={`berth-card ${className || ''}`}>
        {children}
      </Card>
    </BerthCardContext.Provider>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" justify="space-between" align="center" gap="md" className="berth-header">
      {children}
    </Stack>
  );
}

function Title() {
  const berth = useContext(BerthCardContext);
  if (!berth) return null;
  return (
    <h4 id={`berth-${berth.id}-name`} className="berth-name">
      {berth.name}
    </h4>
  );
}

function Status() {
  const berth = useContext(BerthCardContext);
  if (!berth) return null;
  return (
    <Badge
      variant={getStatusVariant(berth.status)}
      size="sm"
      aria-label={`Status: ${berth.status}`}
    >
      {berth.status}
    </Badge>
  );
}

function Specs({ children }: { children: React.ReactNode }) {
  return (
    <div className="berth-specs">
      {children}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="berth-spec-item">
      <span className="berth-spec-label">{label}</span>
      <span className="berth-spec-value">{value}</span>
    </div>
  );
}

function CurrentVessel() {
  const berth = useContext(BerthCardContext);
  if (!berth || !berth.currentVesselId) return null;
  return (
    <div className="berth-vessel">
      <span className="berth-vessel-label">Current Vessel:</span>
      <span className="berth-vessel-value">{berth.currentVesselId}</span>
    </div>
  );
}

export const BerthCard = {
  Root,
  Header,
  Title,
  Status,
  Specs,
  SpecItem,
  CurrentVessel,
};
