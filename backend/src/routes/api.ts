/**
 * API discovery and descriptor.
 * GET /api - Human- and tool-friendly index of endpoints
 * GET /api/openapi.json - OpenAPI 3.0 minimal spec for codegen/Swagger/Postman
 */
import type { Request, Response } from 'express';

export const ENDPOINTS = {
  auth: [
    { method: 'POST', path: '/auth/login', summary: 'Authenticate and receive JWT' },
  ],
  network: [
    { method: 'GET', path: '/installations', summary: 'List installations' },
    { method: 'GET', path: '/installations/:id', summary: 'Get installation' },
    { method: 'GET', path: '/installations/:id/inventory', summary: 'Get/update inventory' },
    { method: 'GET', path: '/supply-bases', summary: 'List supply bases' },
    { method: 'GET', path: '/supply-bases/:id/berths', summary: 'Berths for supply base' },
    { method: 'GET', path: '/network/distances', summary: 'Distance matrix' },
  ],
  fleet: [
    { method: 'GET', path: '/fleet/vessels', summary: 'List vessels' },
    { method: 'GET', path: '/fleet/vessels/:id', summary: 'Get vessel' },
    { method: 'GET', path: '/fleet/vessels/:id/schedule', summary: 'Vessel schedule' },
    { method: 'POST', path: '/fleet/vessels/:id/availability', summary: 'Update availability' },
  ],
  cargo: [
    { method: 'GET', path: '/cargo/types', summary: 'List cargo types' },
    { method: 'GET', path: '/demands', summary: 'List demands' },
    { method: 'POST', path: '/demands', summary: 'Create demand' },
    { method: 'GET', path: '/orders', summary: 'List orders' },
    { method: 'GET', path: '/orders/:id', summary: 'Get order' },
    { method: 'PATCH', path: '/orders/:id/status', summary: 'Update order status' },
  ],
  trips: [
    { method: 'GET', path: '/trips', summary: 'List trips' },
    { method: 'GET', path: '/trips/:id/tracking', summary: 'Trip tracking' },
    { method: 'POST', path: '/trips', summary: 'Create trip' },
  ],
  operations: [
    { method: 'GET', path: '/operations/time-windows', summary: 'Time windows' },
  ],
  weather: [
    { method: 'GET', path: '/weather/forecasts', summary: 'Weather forecasts' },
    { method: 'GET', path: '/weather/windows', summary: 'Weather windows' },
  ],
  optimization: [
    { method: 'POST', path: '/optimization/runs', summary: 'Create optimization run' },
    { method: 'GET', path: '/optimization/runs/:id', summary: 'Get run result' },
  ],
  analytics: [
    { method: 'GET', path: '/analytics/kpis', summary: 'KPI dashboard' },
    { method: 'GET', path: '/analytics/vessels/:id/performance', summary: 'Vessel performance' },
  ],
  legacy: [
    { method: 'GET', path: '/api/vessels', summary: 'Legacy vessels' },
    { method: 'GET', path: '/api/berths', summary: 'Legacy berths' },
    { method: 'GET', path: '/api/cargo', summary: 'Legacy cargo' },
    { method: 'GET', path: '/api/loading-plans', summary: 'Loading plans' },
    { method: 'GET', path: '/api/simulation', summary: 'Simulation' },
  ],
} as const;

export function getApiIndex(_req: Request): object {
  const base = process.env.API_BASE_URL || '';
  return {
    name: 'PRIO Offshore Logistics API',
    version: '1.0',
    openapi: base ? `${base}/api/openapi.json` : '/api/openapi.json',
    docs: 'See references/prio_api_spec.md',
    endpoints: ENDPOINTS,
    paths: Object.values(ENDPOINTS).flat().map((e) => `${e.method} ${e.path}`),
  };
}

export function getOpenApiSpec(req: Request): object {
  const base = process.env.API_BASE_URL || (req.protocol + '://' + (req.get('host') || ''));
  const paths: Record<string, Record<string, unknown>> = {};
  for (const group of Object.values(ENDPOINTS)) {
    for (const e of group) {
      const key = e.path.replace(/:id/g, '{id}').replace(/:(\w+)/g, '{$1}');
      if (!paths[key]) paths[key] = {};
      paths[key][e.method.toLowerCase()] = {
        summary: e.summary,
        responses: { 200: { description: 'OK' } },
      };
    }
  }
  return {
    openapi: '3.0.3',
    info: { title: 'PRIO Offshore Logistics API', version: '1.0' },
    servers: [{ url: base, description: 'API root' }],
    paths: {
      '/health': {
        get: { summary: 'Health check', responses: { 200: { description: 'OK' } } },
      },
      ...paths,
    },
  };
}
