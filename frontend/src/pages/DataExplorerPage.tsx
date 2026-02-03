import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../components/action';
import { Input } from '../components/action/Input/Input';
import { Card, Badge } from '../components/display';
import { Stack } from '../components/layout';
import { Skeleton } from '../components/feedback/Skeleton/Skeleton';
import { useDataOverview } from '../hooks/useDataOverview';
import type { CargoCategory } from '../types';
import './DataExplorerPage.css';

interface Filters {
  search: string;
  vesselType: string;
  cargoCategory: CargoCategory | 'all';
}

const defaultFilters: Filters = {
  search: '',
  vesselType: 'all',
  cargoCategory: 'all',
};

export default function DataExplorerPage() {
  const { data, isLoading, isError, refetch } = useDataOverview();
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const vesselTypes = useMemo(() => (
    data ? ['all', ...Array.from(new Set(data.vessels.map((vessel) => vessel.type))).sort()] : ['all']
  ), [data]);

  const cargoCategories = useMemo(() => (
    data ? ['all', ...Object.keys(data.breakdowns.cargoByCategory || {})] : ['all']
  ), [data]);

  const filteredVessels = useMemo(() => {
    if (!data) return [];
    const search = filters.search.toLowerCase();
    return data.vessels.filter((vessel) => {
      const locationMatch = vessel.currentLocation ? vessel.currentLocation.toLowerCase().includes(search) : false;
      const matchesSearch = !search ||
        vessel.name.toLowerCase().includes(search) ||
        locationMatch ||
        vessel.status.toLowerCase().includes(search);
      const matchesType = filters.vesselType === 'all' || vessel.type === filters.vesselType;
      return matchesSearch && matchesType;
    });
  }, [data, filters.search, filters.vesselType]);

  const filteredCargoCatalog = useMemo(() => {
    if (!data) return [];
    const search = filters.search.toLowerCase();
    return data.cargoCatalog.filter((cargo) => {
      const matchesSearch = !search || cargo.name.toLowerCase().includes(search) || cargo.type.toLowerCase().includes(search);
      const matchesCategory = filters.cargoCategory === 'all' || cargo.category === filters.cargoCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, filters.search, filters.cargoCategory]);

  const fleetStatusChips = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.breakdowns.fleetByStatus).map(([status, count]) => ({ status, count }));
  }, [data]);

  const lastUpdated = data ? formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true }) : null;

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="data-explorer-page">
        <Skeleton lines={12} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="data-explorer-page">
        <Card className="data-error">
          <p>We could not load the data explorer right now.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: 'Vessels', value: data.counts.vessels },
    { label: 'Installations', value: data.counts.installations },
    { label: 'Cargo Types', value: data.counts.cargoTypes },
    { label: 'Berths', value: data.counts.berths },
  ];

  return (
    <div className="data-explorer-page">
      <header className="data-hero">
        <div>
          <p className="data-kicker">Realtime intelligence</p>
          <h2>Operational Data Explorer</h2>
          <p>
            Search, filter, and cross-reference the latest fleet, cargo, berth, and installation snapshots. Everything on this page is sourced from the
            <code> /analytics/data-overview</code> endpoint.
          </p>
        </div>
        <Stack direction="row" gap="md" className="data-stats">
          {stats.map((stat) => (
            <Card key={stat.label} className="data-stat-card">
              <small>{stat.label}</small>
              <strong>{stat.value}</strong>
            </Card>
          ))}
        </Stack>
      </header>

      <div className="data-controls">
        <Input
          label="Global search"
          placeholder="Find vessels, cargo, or installations"
          value={filters.search}
          onChange={(event) => handleFilterChange('search', event.target.value)}
        />
        <label>
          Vessel type
          <select value={filters.vesselType} onChange={(event) => handleFilterChange('vesselType', event.target.value)}>
            {vesselTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All vessels' : type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cargo category
          <select value={filters.cargoCategory} onChange={(event) => handleFilterChange('cargoCategory', event.target.value)}>
            {cargoCategories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All cargo' : category.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <Button variant="ghost" onClick={() => setFilters(defaultFilters)}>
          Reset filters
        </Button>
      </div>

      <section className="data-grid">
        <Card className="data-card">
          <header>
            <div>
              <p className="section-kicker">Fleet posture</p>
              <h3>Vessels ({filteredVessels.length})</h3>
            </div>
            <Badge variant="info">Updated {lastUpdated ?? 'moments ago'}</Badge>
          </header>
          <div className="chip-row">
            {fleetStatusChips.map((chip) => (
              <Badge key={chip.status} variant="primary">
                {chip.status} · {chip.count}
              </Badge>
            ))}
          </div>
          <div className="fleet-table" role="list">
            {filteredVessels.map((vessel) => (
              <article key={vessel.id} className="fleet-row" role="listitem">
                <div>
                  <h4>{vessel.name}</h4>
                  <p>{vessel.type}</p>
                </div>
                <div>
                  <Badge variant="success">{vessel.status}</Badge>
                  <small>{vessel.currentLocation || 'Unknown position'}</small>
                </div>
                <ul className="fleet-metrics">
                  <li>
                    <span>Deck cap.</span>
                    <strong>{vessel.deckCargoCapacity.toLocaleString()} MT</strong>
                  </li>
                  <li>
                    <span>Speed</span>
                    <strong>{vessel.serviceSpeed} kn</strong>
                  </li>
                  <li>
                    <span>DP</span>
                    <strong>{vessel.dpClass}</strong>
                  </li>
                </ul>
              </article>
            ))}
            {!filteredVessels.length && <p className="empty-state">No vessels match the current filters.</p>}
          </div>
        </Card>

        <Card className="data-card">
          <header>
            <div>
              <p className="section-kicker">Cargo intelligence</p>
              <h3>Catalog ({filteredCargoCatalog.length})</h3>
            </div>
            <Badge variant="info">{data.breakdowns.cargoByCategory.deck_cargo ?? 0} deck references</Badge>
          </header>
          <div className="cargo-list" role="list">
            {filteredCargoCatalog.map((cargo) => (
              <article key={cargo.name} className="cargo-row" role="listitem">
                <div>
                  <h4>{cargo.name}</h4>
                  <Badge variant="primary">{cargo.category}</Badge>
                </div>
                <p>{cargo.type}</p>
                <small>Density: {cargo.density} kg/m³</small>
                {cargo.requiresSegregation && <span className="pill pill--warning">Needs segregation</span>}
                {cargo.incompatibleWith && cargo.incompatibleWith.length > 0 && (
                  <p className="compatibility-note">
                    Avoid: {cargo.incompatibleWith.join(', ')}
                  </p>
                )}
              </article>
            ))}
            {!filteredCargoCatalog.length && <p className="empty-state">No cargo items match the filters.</p>}
          </div>
        </Card>

        <Card className="data-card">
          <header>
            <div>
              <p className="section-kicker">Harbor readiness</p>
              <h3>Berths ({data.berths.length})</h3>
            </div>
            <Badge variant="info">{data.berths.filter((berth) => berth.status === 'available').length} available</Badge>
          </header>
          <div className="berth-grid">
            {data.berths.map((berth) => (
              <article key={berth.id}>
                <h4>{berth.name}</h4>
                <Badge variant={berth.status === 'available' ? 'success' : 'default'}>{berth.status}</Badge>
                <ul>
                  <li>Max draught {berth.maxDraught} m</li>
                  <li>Max length {berth.maxLength} m</li>
                  <li>Max DWT {berth.maxDeadweight.toLocaleString()} t</li>
                </ul>
              </article>
            ))}
          </div>
        </Card>

        <Card className="data-card">
          <header>
            <div>
              <p className="section-kicker">Route matrix</p>
              <h3>Installations ({data.installations.length})</h3>
            </div>
            <Badge variant="info">{Object.keys(data.breakdowns.installationsByType).length} types</Badge>
          </header>
          <div className="installations-list">
            {data.installations.map((installation) => (
              <article key={installation.id}>
                <div>
                  <h4>{installation.name}</h4>
                  {installation.type && <Badge variant="primary">{installation.type}</Badge>}
                </div>
                <p>{installation.distance} nm from base</p>
                {installation.basin && <small>{installation.basin} basin</small>}
              </article>
            ))}
          </div>
        </Card>

        <Card className="data-card">
          <header>
            <div>
              <p className="section-kicker">Compatibility rules</p>
              <h3>Cleaning & sequencing</h3>
            </div>
            <Badge variant="info">{data.compatibilityRules.length} rules</Badge>
          </header>
          <div className="rules-list">
            {data.compatibilityRules.map((rule) => (
              <article key={`${rule.fromCargo}-${rule.toCargo}`}>
                <div>
                  <h4>{rule.fromCargo}</h4>
                  <p>→ {rule.toCargo}</p>
                </div>
                <Badge variant={rule.compatible ? 'success' : 'warning'}>
                  {rule.compatible ? 'Compatible' : 'Requires cleaning'}
                </Badge>
                <small>{rule.cleaningTimeHours} h cleaning window</small>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
