/**
 * Database connection and seed data tests
 */

import pool from '../db/connection';

describe('Database Tests', () => {
  beforeAll(async () => {
    // Ensure database connection is available
  });

  afterAll(async () => {
    await pool.end();
  });

  test('should connect to database', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toBeGreaterThan(0);
  });

  test('should have supply bases populated', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM supply_bases');
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });

  test('should have installations populated', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM installations');
    expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(8);
  });

  test('should have vessels populated', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM vessels');
    expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(6);
  });

  test('should have cargo types populated', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM cargo_types');
    expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(20);
  });

  test('should have distance matrix populated', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM distance_matrix');
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });

  test('should have consumption profiles populated', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM consumption_profiles');
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });

  test('should have installation storage populated', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM installation_storage');
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });

  test('should have cost structures populated', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM cost_structures');
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });
});