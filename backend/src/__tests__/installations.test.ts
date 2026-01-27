/**
 * Installations API tests
 */

import pool from '../db/connection';

describe('Installations Data Tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('should have FPSO Bravo in database', async () => {
    const result = await pool.query(
      "SELECT * FROM installations WHERE id = 'fpso-bravo'"
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toContain('FPSO Bravo');
    expect(result.rows[0].type).toBe('FPSO');
    expect(parseFloat(result.rows[0].distance_from_base_nm)).toBe(70);
  });

  test('should have FPSO Valente in database', async () => {
    const result = await pool.query(
      "SELECT * FROM installations WHERE id = 'fpso-valente'"
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toContain('FPSO Valente');
    expect(parseFloat(result.rows[0].water_depth_m)).toBe(1200);
  });

  test('should have all Peregrino installations', async () => {
    const result = await pool.query(
      "SELECT * FROM installations WHERE name LIKE '%Peregrino%'"
    );
    expect(result.rows.length).toBe(4); // FPSO + 3 platforms
  });

  test('should have storage capacities for installations', async () => {
    const result = await pool.query(`
      SELECT i.name, ist.cargo_type_id, ist.max_capacity, ist.current_level, ist.safety_stock
      FROM installations i
      JOIN installation_storage ist ON i.id = ist.installation_id
      WHERE i.id = 'fpso-bravo'
      LIMIT 5
    `);
    expect(result.rows.length).toBeGreaterThan(0);
    result.rows.forEach(row => {
      expect(parseFloat(row.max_capacity)).toBeGreaterThan(0);
      expect(parseFloat(row.safety_stock)).toBeGreaterThan(0);
    });
  });
});