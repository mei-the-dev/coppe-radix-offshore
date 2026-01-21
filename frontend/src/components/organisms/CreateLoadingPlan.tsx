import { useState, useEffect } from 'react';
import './CreateLoadingPlan.css';
import type { Vessel, Berth, CargoItem, Installation } from '../../types';
import { api } from '../../api/client';
import { Button } from '../action';
import { Alert } from '../feedback';
import { Stack } from '../layout';
import { useCreateLoadingPlan } from '../../hooks';

interface CreateLoadingPlanProps {
  vessels: Vessel[];
  berths: Berth[];
  onClose: () => void;
  onPlanCreated: (plan: any) => void;
}

export default function CreateLoadingPlan({ vessels, berths, onClose, onPlanCreated }: CreateLoadingPlanProps) {
  const [selectedVessel, setSelectedVessel] = useState<string>('');
  const [selectedBerth, setSelectedBerth] = useState<string>('');
  const [scheduledStart, setScheduledStart] = useState<string>('');
  const [cargoCatalog, setCargoCatalog] = useState<any[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<CargoItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCargoData();
  }, []);

  const loadCargoData = async () => {
    try {
      const [catalog, inst] = await Promise.all([
        api.getCargoCatalog(),
        api.getInstallations(),
      ]);
      setCargoCatalog(catalog);
      setInstallations(inst);
    } catch (err) {
      console.error('Error loading cargo data:', err);
    }
  };

  const addCargoItem = (cargoType: any) => {
    const newItem: CargoItem = {
      id: `cargo-${Date.now()}-${Math.random()}`,
      type: cargoType.type,
      category: cargoType.category,
      name: cargoType.name,
      density: cargoType.density,
      volume: cargoType.category !== 'deck_cargo' ? 100 : undefined,
      weight: cargoType.category === 'deck_cargo' ? 10 : undefined,
      destination: installations[0]?.id || '',
      requiresSegregation: cargoType.requiresSegregation,
      incompatibleWith: cargoType.incompatibleWith,
    };
    setSelectedCargo([...selectedCargo, newItem]);
  };

  const removeCargoItem = (id: string) => {
    setSelectedCargo(selectedCargo.filter(c => c.id !== id));
  };

  const createPlanMutation = useCreateLoadingPlan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVessel || !selectedBerth || !scheduledStart || selectedCargo.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);

    try {
      const plan = await createPlanMutation.mutateAsync({
        vesselId: selectedVessel,
        berthId: selectedBerth,
        scheduledStart,
        cargoItems: selectedCargo,
        scheduledEnd: new Date(new Date(scheduledStart).getTime() + 8 * 60 * 60 * 1000).toISOString(),
        estimatedDuration: 8,
      });
      onPlanCreated(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create loading plan');
    }
  };

  const loading = createPlanMutation.isPending;

  const availableBerths = berths.filter(b => b.status === 'available');

  return (
    <form onSubmit={handleSubmit} className="create-plan-form">
          <Stack direction="column" gap="md">
            <div className="form-group">
              <label>Vessel *</label>
              <select
                value={selectedVessel}
                onChange={(e) => setSelectedVessel(e.target.value)}
                required
                className="form-select"
              >
                <option value="">Select vessel</option>
                {vessels.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Berth *</label>
              <select
                value={selectedBerth}
                onChange={(e) => setSelectedBerth(e.target.value)}
                required
                className="form-select"
              >
                <option value="">Select berth</option>
                {availableBerths.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Scheduled Start *</label>
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </Stack>

          <div className="form-group">
            <label>Add Cargo</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const cargo = cargoCatalog.find(c => c.type === e.target.value);
                  if (cargo) addCargoItem(cargo);
                  e.target.value = '';
                }
              }}
            >
              <option value="">Select cargo type...</option>
              {cargoCatalog.map(c => (
                <option key={c.type} value={c.type}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedCargo.length > 0 && (
            <div className="selected-cargo">
              <h4>Selected Cargo ({selectedCargo.length})</h4>
              <Stack direction="column" gap="sm">
                {selectedCargo.map(cargo => (
                  <Stack key={cargo.id} direction="row" justify="space-between" align="center" gap="md" className="cargo-item">
                    <span>{cargo.name}</span>
                    <Stack direction="row" gap="md">
                      {cargo.volume && <span>{cargo.volume}m³</span>}
                      {cargo.weight && <span>{cargo.weight}t</span>}
                    </Stack>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCargoItem(cargo.id)}>
                      Remove
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </div>
          )}

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Stack direction="row" justify="end" gap="md" className="form-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} loading={loading}>
              Create Plan
            </Button>
          </Stack>
        </form>
  );
}
