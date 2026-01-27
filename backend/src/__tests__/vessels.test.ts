/**
 * Vessels data tests
 */

import pool from '../db/connection';

describe('Vessels Data Tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('should have CSV Normand Pioneer', async () => {
    const result = await pool.query(
      "SELECT * FROM vessels WHERE name LIKE '%Normand Pioneer%'"
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].class).toBe('CSV');
    expect(parseFloat(result.rows[0].charter_rate_daily_usd)).toBeGreaterThan(40000);
  });

  test('should have Standard PSV vessels', async () => {
    const result = await pool.query(
      "SELECT * FROM vessels WHERE class = 'StandardPSV'"
    );
    expect(result.rows.length).toBeGreaterThanOrEqual(2);
    result.rows.forEach(vessel => {
      expect(parseFloat(vessel.deck_cargo_capacity_t)).toBeGreaterThanOrEqual(2450);
      expect(vessel.dp_class).toBe('DP2');
    });
  });

  test('should have vessel compartments', async () => {
    const result = await pool.query(`
      SELECT v.name, COUNT(vc.id) as compartment_count
      FROM vessels v
      LEFT JOIN vessel_compartments vc ON v.id = vc.vessel_id
      WHERE v.class = 'StandardPSV'
      GROUP BY v.id, v.name
      LIMIT 1
    `);
    expect(result.rows.length).toBeGreaterThan(0);
    expect(parseInt(result.rows[0].compartment_count)).toBeGreaterThan(0);
  });

  test('should have vessel schedules', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM vessel_schedules');
    expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
  });
});