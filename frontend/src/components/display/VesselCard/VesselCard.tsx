import React, { createContext, useContext } from 'react';
import type { Vessel } from '../../../types';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Stack } from '../../layout';
import './VesselCard.css';

const VesselCardContext = createContext<Vessel | null>(null);

// Map vessel status to Badge variant
const getStatusVariant = (status: Vessel['status']): 'success' | 'info' | 'warning' | 'primary' | 'error' => {
  switch (status) {
    case 'available': return 'success';
    case 'in_port': return 'info';
    case 'in_transit': return 'warning';
    case 'at_platform': return 'primary';
    case 'maintenance': return 'error';
    default: return 'info';
  }
};

interface RootProps {
  vessel: Vessel;
  children: React.ReactNode;
  className?: string;
}

function Root({ vessel, children, className }: RootProps) {
  return (
    <VesselCardContext.Provider value={vessel}>
      <Card variant="default" padding="md" hoverable className={`vessel-card ${className || ''}`}>
        {children}
      </Card>
    </VesselCardContext.Provider>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" justify="space-between" align="center" gap="md" className="vessel-header">
      {children}
    </Stack>
  );
}

function Title() {
  const vessel = useContext(VesselCardContext);
  if (!vessel) return null;
  return (
    <h4 id={`vessel-${vessel.id}-name`} className="vessel-name">
      {vessel.name}
    </h4>
  );
}

function Status() {
  const vessel = useContext(VesselCardContext);
  if (!vessel) return null;
  return (
    <Badge
      variant={getStatusVariant(vessel.status)}
      size="sm"
      aria-label={`Status: ${vessel.status.replace('_', ' ')}`}
    >
      {vessel.status.replace('_', ' ')}
    </Badge>
  );
}

function Details({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="column" gap="sm" className="vessel-details">
      {children}
    </Stack>
  );
}

function Type() {
  const vessel = useContext(VesselCardContext);
  if (!vessel) return null;
  return <div className="vessel-type">{vessel.type}</div>;
}

function Location() {
  const vessel = useContext(VesselCardContext);
  if (!vessel) return null;
  return <div className="vessel-location">{vessel.currentLocation || 'Unknown'}</div>;
}

function Capacity() {
  const vessel = useContext(VesselCardContext);
  if (!vessel) return null;
  return (
    <Stack direction="row" gap="sm" className="vessel-capacity">
      <span className="capacity-item">Deck: {vessel.deckCargoCapacity}t</span>
      {vessel.clearDeckArea > 0 && (
        <span className="capacity-item">Deck area: {vessel.clearDeckArea} m²</span>
      )}
      <span className="capacity-item">Liquid: {vessel.liquidMudCapacity}m³</span>
    </Stack>
  );
}

export const VesselCard = {
  Root,
  Header,
  Title,
  Status,
  Details,
  Type,
  Location,
  Capacity,
};
