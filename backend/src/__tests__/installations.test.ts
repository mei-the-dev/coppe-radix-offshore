/**
 * Installations API tests
 */

import type { Pool } from 'pg';
import { mockInstallations, mockInstallationStorage } from '../data/mockData';

const useRealDb = process.env.USE_REAL_DB === 'true';
let pool: Pool | null = null;

if (useRealDb) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const connection = require('../db/connection');
  pool = connection.default ?? connection;

  describe('Installations Data Tests (PostgreSQL)', () => {
    afterAll(async () => {
      await pool?.end();
    });

    test('should have FPSO Bravo in database', async () => {
      const result = await pool!.query(
        "SELECT * FROM installations WHERE id = 'fpso-bravo'"
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toContain('FPSO Bravo');
      expect(result.rows[0].type).toBe('FPSO');
      expect(parseFloat(result.rows[0].distance_from_base_nm)).toBe(70);
    });

    test('should have FPSO Valente in database', async () => {
      const result = await pool!.query(
        "SELECT * FROM installations WHERE id = 'fpso-valente'"
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toContain('FPSO Valente');
      expect(parseFloat(result.rows[0].water_depth_m)).toBe(1200);
    });

    test('should have all Peregrino installations', async () => {
      const result = await pool!.query(
        "SELECT * FROM installations WHERE name LIKE '%Peregrino%'"
      );
      expect(result.rows.length).toBe(4); // FPSO + 3 platforms
    });

    test('should have storage capacities for installations', async () => {
      const result = await pool!.query(`
        SELECT i.name, ist.cargo_type_id, ist.max_capacity, ist.current_level, ist.safety_stock
        FROM installations i
        JOIN installation_storage ist ON i.id = ist.installation_id
        WHERE i.id = 'fpso-bravo'
        LIMIT 5
      `);
      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach((row) => {
        expect(parseFloat(row.max_capacity)).toBeGreaterThan(0);
        expect(parseFloat(row.safety_stock)).toBeGreaterThan(0);
      });
    });
  });
}

if (!useRealDb) {
  describe('Installations Data Tests (Mock Data)', () => {
    test('should include FPSO Bravo', () => {
      const inst = mockInstallations.find((i) => i.id === 'fpso-bravo');
      expect(inst).toBeDefined();
      expect(inst?.type).toBe('FPSO');
      expect(inst?.distance).toBe(70);
    });

    test('should include FPSO Valente', () => {
      const inst = mockInstallations.find((i) => i.id === 'fpso-valente');
      expect(inst).toBeDefined();
      expect(inst?.distance).toBe(67);
    });

    test('should group Peregrino installations', () => {
      const peregrino = mockInstallations.filter((i) => i.name.includes('Peregrino'));
      expect(peregrino.length).toBeGreaterThanOrEqual(4);
    });

    test('should define storage capacities for FPSO Bravo', () => {
      const storage = mockInstallationStorage.filter((entry) => entry.installationId === 'fpso-bravo');
      expect(storage.length).toBeGreaterThan(0);
      storage.forEach((entry) => {
        expect(entry.maxCapacity).toBeGreaterThan(0);
        expect(entry.safetyStock).toBeGreaterThan(0);
      });
    });
  });
}