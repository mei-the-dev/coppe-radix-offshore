/**
 * Distance matrix tests
 */

import pool from '../db/connection';

describe('Distance Matrix Tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('should have distance from Macaé to Peregrino', async () => {
    const result = await pool.query(`
      SELECT * FROM distance_matrix
      WHERE from_location_id = 'macaé' AND to_location_id = 'fpso-peregrino'
    `);
    expect(result.rows.length).toBe(1);
    expect(parseFloat(result.rows[0].distance_nm)).toBe(46);
    expect(parseFloat(result.rows[0].time_12kts_h)).toBeCloseTo(3.8, 1);
  });

  test('should have distance from Macaé to all major installations', async () => {
    const result = await pool.query(`
      SELECT to_location_id, distance_nm
      FROM distance_matrix
      WHERE from_location_id = 'macaé'
      ORDER BY distance_nm
    `);
    expect(result.rows.length).toBeGreaterThanOrEqual(5);
    
    // Check specific distances
    const distances = result.rows.reduce((acc, row) => {
      acc[row.to_location_id] = parseFloat(row.distance_nm);
      return acc;
    }, {} as Record<string, number>);
    
    expect(distances['fpso-peregrino']).toBe(46);
    expect(distances['fpso-valente']).toBe(67);
    expect(distances['fpso-bravo']).toBe(70);
  });

  test('should have inter-installation distances', async () => {
    const result = await pool.query(`
      SELECT * FROM distance_matrix
      WHERE from_location_id = 'platform-polvo' AND to_location_id = 'fpso-bravo'
    `);
    expect(result.rows.length).toBe(1);
    expect(parseFloat(result.rows[0].distance_nm)).toBeCloseTo(5.9, 1);
  });

  test('should have weather factors', async () => {
    const result = await pool.query(`
      SELECT weather_factor_good, weather_factor_moderate, weather_factor_rough
      FROM distance_matrix
      LIMIT 1
    `);
    expect(result.rows.length).toBe(1);
    expect(parseFloat(result.rows[0].weather_factor_good)).toBe(1.0);
    expect(parseFloat(result.rows[0].weather_factor_moderate)).toBeGreaterThan(1.0);
    expect(parseFloat(result.rows[0].weather_factor_rough)).toBeGreaterThan(1.0);
  });
});