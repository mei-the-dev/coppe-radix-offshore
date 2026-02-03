/**
 * Database connection and seed data tests
 */

import type { Pool } from 'pg';
import {
  mockBerths,
  mockCargoCatalog,
  mockCompatibilityRules,
  mockInstallations,
  mockVessels,
} from '../data/mockData';

const useRealDb = process.env.USE_REAL_DB === 'true';
let pool: Pool | null = null;

if (useRealDb) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const connection = require('../db/connection');
  pool = connection.default ?? connection;

  describe('Database Tests (PostgreSQL)', () => {
    afterAll(async () => {
      await pool?.end();
    });

    test('should connect to database', async () => {
      const result = await pool!.query('SELECT NOW()');
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should have supply bases populated', async () => {
      const result = await pool!.query('SELECT COUNT(*) as count FROM supply_bases');
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });

    test('should have installations populated', async () => {
      const result = await pool!.query('SELECT COUNT(*) as count FROM installations');
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(8);
    });

    test('should have vessels populated', async () => {
      const result = await pool!.query('SELECT COUNT(*) as count FROM vessels');
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(6);
    });

    test('should have cargo types populated', async () => {
      const result = await pool!.query('SELECT COUNT(*) as count FROM cargo_types');
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(20);
    });

    test('should have distance matrix populated', async () => {
      const result = await pool!.query('SELECT COUNT(*) as count FROM distance_matrix');
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });

    test('should have consumption profiles populated', async () => {
      const result = await pool!.query('SELECT COUNT(*) as count FROM consumption_profiles');
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });

    test('should have installation storage populated', async () => {
      const result = await pool!.query('SELECT COUNT(*) as count FROM installation_storage');
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });

    test('should have cost structures populated', async () => {
      const result = await pool!.query('SELECT COUNT(*) as count FROM cost_structures');
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });
  });
}

if (!useRealDb) {
  describe('Database Tests (Mock Data)', () => {
    test('should expose vessels from mock dataset', () => {
      expect(mockVessels.length).toBeGreaterThanOrEqual(5);
    });

    test('should expose installations from mock dataset', () => {
      expect(mockInstallations.length).toBeGreaterThanOrEqual(8);
    });

    test('should expose berths from mock dataset', () => {
      expect(mockBerths.length).toBeGreaterThan(0);
    });

    test('should expose cargo catalog from mock dataset', () => {
      expect(mockCargoCatalog.some((cargo) => cargo.type === 'diesel')).toBe(true);
    });

    test('should expose compatibility rules from mock dataset', () => {
      expect(mockCompatibilityRules.length).toBeGreaterThan(0);
    });
  });
}