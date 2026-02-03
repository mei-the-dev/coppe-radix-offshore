import { test, expect } from '@playwright/test';

const DOT_FIXTURE = `digraph {
  "vessels" [label=<<TABLE border="0" cellborder="1" cellspacing="0">
    <tr><td colspan="2">vessels</td></tr>
    <tr><td>id\\nUUID</td><td>identifier</td></tr>
    <tr><td>name\\nTEXT</td><td>friendly name</td></tr>
    <tr><td>Operations</td></tr>
  </TABLE>>];
}`;

const DATA_FIXTURE = {
  updatedAt: '2025-01-01T00:00:00.000Z',
  counts: { vessels: 1, installations: 1, cargoTypes: 1, berths: 1 },
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
    { id: 'fpso-bravo', name: 'FPSO Bravo', distance: 70, type: 'FPSO', basin: 'Campos Basin' },
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
    { fromCargo: 'diesel', toCargo: 'fresh_water', cleaningTimeHours: 4, compatible: false },
  ],
  breakdowns: {
    fleetByType: { 'Standard PSV': 1 },
    fleetByStatus: { available: 1 },
    installationsByType: { FPSO: 1 },
    cargoByCategory: { liquid_bulk: 1, deck_cargo: 0 },
  },
};

test.describe('Diagram & Data Explorer routes', () => {
  test('renders the diagram route with stubbed DOT payload', async ({ page }) => {
    await page.route('**/schema/diagram', (route) =>
      route.fulfill({ body: DOT_FIXTURE, contentType: 'text/vnd.graphviz' })
    );

    await page.goto('/diagram');
    await page.waitForSelector('.diagram-page', { timeout: 15000 });
    await expect(page.getByText('PRIO Offshore data model')).toBeVisible();
    await expect(page.getByRole('button', { name: /vessels/i })).toBeVisible();
  });

  test('renders the data explorer route with stubbed analytics payload', async ({ page }) => {
    await page.route('**/analytics/data-overview', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(DATA_FIXTURE),
      })
    );

    await page.goto('/data');
    await page.waitForSelector('.data-explorer-page', { timeout: 15000 });
    await expect(page.getByText('Operational Data Explorer')).toBeVisible();
    await expect(page.getByText('PSV Standard Alpha')).toBeVisible();
  });
});
