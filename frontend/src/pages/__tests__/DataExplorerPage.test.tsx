import { describe, expect, it, beforeEach, vi } from 'vitest';
import DataExplorerPage from '../DataExplorerPage';
import { render, screen } from '../../test-utils/testUtils';
import type { DataOverviewResponse } from '../../types';

const mockUseDataOverview = vi.fn();

vi.mock('../../hooks/useDataOverview', () => ({
  useDataOverview: () => mockUseDataOverview(),
}));

const mockOverviewResponse: DataOverviewResponse = {
  updatedAt: '2025-01-01T00:00:00.000Z',
  counts: {
    vessels: 1,
    installations: 1,
    cargoTypes: 1,
    berths: 1,
  },
  vessels: [
    {
      id: 'vessel-001',
      name: 'PSV Standard Alpha',
      type: 'Standard PSV',
      lengthOverall: 71.9,
      beam: 16,
      draughtLoaded: 5.7,
      deckCargoCapacity: 2450,
      clearDeckArea: 950,
      totalDeadweight: 4500,
      fuelOilCapacity: 900,
      freshWaterCapacity: 800,
      liquidMudCapacity: 2500,
      dryBulkCapacity: 600,
      serviceSpeed: 15,
      operationalSpeed: 13,
      dpClass: 'DP-2',
      status: 'available',
      currentLocation: 'Porto do Açu',
    },
  ],
  installations: [
    {
      id: 'fpso-bravo',
      name: 'FPSO Bravo',
      distance: 70,
      type: 'FPSO',
      basin: 'Campos Basin',
    },
  ],
  cargoCatalog: [
    {
      type: 'diesel',
      category: 'liquid_bulk',
      name: 'Marine Diesel Oil',
      density: 850,
      requiresSegregation: true,
      incompatibleWith: ['fresh_water'],
    },
  ],
  berths: [
    {
      id: 'porto-acu-berth-1',
      name: 'Porto do Açu Berth 1',
      port: 'Porto do Açu',
      maxDraught: 21.7,
      maxLength: 350,
      maxDeadweight: 200000,
      status: 'available',
    },
  ],
  compatibilityRules: [
    {
      fromCargo: 'diesel',
      toCargo: 'fresh_water',
      cleaningTimeHours: 4,
      compatible: false,
    },
  ],
  breakdowns: {
    fleetByType: { 'Standard PSV': 1 },
    fleetByStatus: { available: 1 },
    installationsByType: { FPSO: 1 },
    cargoByCategory: { liquid_bulk: 1, deck_cargo: 0 },
  },
};

describe('DataExplorerPage', () => {
  beforeEach(() => {
    mockUseDataOverview.mockReset();
  });

  it('renders page sections when data loads successfully', () => {
    mockUseDataOverview.mockReturnValue({
      data: mockOverviewResponse,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<DataExplorerPage />);

    expect(screen.getByText(/Operational Data Explorer/i)).toBeInTheDocument();
    expect(screen.getByText('PSV Standard Alpha')).toBeVisible();
    expect(screen.getByText('Marine Diesel Oil')).toBeVisible();
    expect(screen.getByText('Porto do Açu Berth 1')).toBeVisible();
  });

  it('renders an error card when the query fails', () => {
    const refetch = vi.fn();
    mockUseDataOverview.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    render(<DataExplorerPage />);

    expect(
      screen.getByText(/could not load the data explorer/i)
    ).toBeVisible();
  });
});
