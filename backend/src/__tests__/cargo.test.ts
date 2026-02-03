/**
 * Cargo types and compatibility tests
 */

import type { Pool } from 'pg';
import { mockCargoCatalog, mockCompatibilityRules } from '../data/mockData';

const useRealDb = process.env.USE_REAL_DB === 'true';
let pool: Pool | null = null;

if (useRealDb) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const connection = require('../db/connection');
  pool = connection.default ?? connection;

  describe('Cargo Data Tests (PostgreSQL)', () => {
    afterAll(async () => {
      await pool?.end();
    });

    test('should have diesel cargo type', async () => {
      const result = await pool!.query(
        "SELECT * FROM cargo_types WHERE id = 'diesel'"
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].category).toBe('Liquid');
      expect(parseFloat(result.rows[0].density_kg_m3)).toBe(850);
    });

    test('should have cargo incompatibility rules', async () => {
      const result = await pool!.query(`
        SELECT * FROM cargo_incompatibility
        WHERE cargo_type_id_1 = 'diesel' AND cargo_type_id_2 = 'fresh_water'
      `);
      expect(result.rows.length).toBe(1);
      expect(parseFloat(result.rows[0].cleaning_time_h)).toBe(4);
    });

    test('should have methanol with highest cleaning time', async () => {
      const result = await pool!.query(`
        SELECT MAX(cleaning_time_h) as max_cleaning_time
        FROM cargo_incompatibility
        WHERE cargo_type_id_1 = 'methanol' OR cargo_type_id_2 = 'methanol'
      `);
      expect(parseFloat(result.rows[0].max_cleaning_time)).toBe(8);
    });

    test('should have all cargo categories represented', async () => {
      const result = await pool!.query(`
        SELECT category, COUNT(*) as count
        FROM cargo_types
        GROUP BY category
      `);
      const categories = result.rows.map((r) => r.category);
      expect(categories).toContain('Liquid');
      expect(categories).toContain('DryBulk');
      expect(categories).toContain('DeckCargo');
    });
  });
}

if (!useRealDb) {
  describe('Cargo Data Tests (Mock Data)', () => {
    test('should include diesel cargo type', () => {
      const diesel = mockCargoCatalog.find((cargo) => cargo.type === 'diesel');
      expect(diesel).toBeDefined();
      expect(diesel?.category).toBe('liquid_bulk');
      expect(diesel?.density).toBe(850);
    });

    test('should include compatibility rules for diesel and fresh water', () => {
      const rule = mockCompatibilityRules.find(
        (entry) => entry.fromCargo === 'diesel' && entry.toCargo === 'fresh_water'
      );
      expect(rule).toBeDefined();
      expect(rule?.cleaningTimeHours).toBe(4);
      expect(rule?.compatible).toBe(false);
    });

    test('should keep methanol as most restrictive cargo', () => {
      const methanolRules = mockCompatibilityRules.filter(
        (entry) => entry.fromCargo === 'methanol'
      );
      expect(methanolRules.some((entry) => entry.cleaningTimeHours === 8)).toBe(true);
    });

    test('should represent all cargo categories', () => {
      const categories = new Set(mockCargoCatalog.map((cargo) => cargo.category));
      expect(categories.has('liquid_bulk')).toBe(true);
      expect(categories.has('dry_bulk')).toBe(true);
      expect(categories.has('deck_cargo')).toBe(true);
    });
  });
}