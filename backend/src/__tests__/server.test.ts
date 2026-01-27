/**
 * Server bootstrap tests. createApp() is the app factory used by index.ts.
 */
import { createApp } from '../server';

describe('Server', () => {
  test('createApp returns an Express application', () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.get).toBe('function');
    expect(typeof app.use).toBe('function');
    expect(typeof app.listen).toBe('function');
  });
});
