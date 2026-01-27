/**
 * Cargo types and compatibility tests
 */

import pool from '../db/connection';

describe('Cargo Data Tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('should have diesel cargo type', async () => {
    const result = await pool.query(
      "SELECT * FROM cargo_types WHERE id = 'diesel'"
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].category).toBe('Liquid');
    expect(parseFloat(result.rows[0].density_kg_m3)).toBe(850);
  });

  test('should have cargo incompatibility rules', async () => {
    const result = await pool.query(`
      SELECT * FROM cargo_incompatibility
      WHERE cargo_type_id_1 = 'diesel' AND cargo_type_id_2 = 'fresh_water'
    `);
    expect(result.rows.length).toBe(1);
    expect(parseFloat(result.rows[0].cleaning_time_h)).toBe(4);
  });

  test('should have methanol with highest cleaning time', async () => {
    const result = await pool.query(`
      SELECT MAX(cleaning_time_h) as max_cleaning_time
      FROM cargo_incompatibility
      WHERE cargo_type_id_1 = 'methanol' OR cargo_type_id_2 = 'methanol'
    `);
    expect(parseFloat(result.rows[0].max_cleaning_time)).toBe(8);
  });

  test('should have all cargo categories represented', async () => {
    const result = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM cargo_types
      GROUP BY category
    `);
    const categories = result.rows.map(r => r.category);
    expect(categories).toContain('Liquid');
    expect(categories).toContain('DryBulk');
    expect(categories).toContain('DeckCargo');
  });
});