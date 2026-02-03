import request from 'supertest';
import { createApp } from '../server';

const app = createApp();

describe('Analytics Data Overview API', () => {
  it('returns overview payload with counts and breakdowns', async () => {
    const response = await request(app).get('/analytics/data-overview');
    expect(response.status).toBe(200);
    expect(response.body.counts).toBeDefined();
    expect(Array.isArray(response.body.vessels)).toBe(true);
    expect(Array.isArray(response.body.installations)).toBe(true);
    expect(response.body.breakdowns?.fleetByType).toBeDefined();
  });
});