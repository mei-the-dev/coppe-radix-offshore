import request from 'supertest';
import { createApp } from '../server';

const app = createApp();

describe('Schema Diagram API', () => {
  it('returns DOT content', async () => {
    const response = await request(app).get('/schema/diagram');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/vnd.graphviz');
    expect(response.text.startsWith('digraph')).toBe(true);
  });
});
