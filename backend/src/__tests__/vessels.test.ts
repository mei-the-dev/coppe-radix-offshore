/**
 * Vessels data tests
 */

import type { Pool } from 'pg';
import {
  mockVessels,
  mockVesselCompartments,
  mockVesselSchedules,
} from '../data/mockData';

const useRealDb = process.env.USE_REAL_DB === 'true';
let pool: Pool | null = null;

if (useRealDb) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const connection = require('../db/connection');
  pool = connection.default ?? connection;

  describe('Vessels Data Tests (PostgreSQL)', () => {
    afterAll(async () => {
      await pool?.end();
    });

    test('should have CSV Normand Pioneer', async () => {
      const result = await pool!.query(
        "SELECT * FROM vessels WHERE name LIKE '%Normand Pioneer%'"
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].class).toBe('CSV');
      expect(parseFloat(result.rows[0].charter_rate_daily_usd)).toBeGreaterThan(40000);
    });

    test('should have Standard PSV vessels', async () => {
      const result = await pool!.query(
        "SELECT * FROM vessels WHERE class = 'StandardPSV'"
      );
      expect(result.rows.length).toBeGreaterThanOrEqual(2);
      result.rows.forEach((vessel) => {
        expect(parseFloat(vessel.deck_cargo_capacity_t)).toBeGreaterThanOrEqual(2450);
        expect(vessel.dp_class).toBe('DP2');
      });
    });

    test('should have vessel compartments', async () => {
      const result = await pool!.query(`
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
      const result = await pool!.query('SELECT COUNT(*) as count FROM vessel_schedules');
      expect(parseInt(result.rows[0].count)).toBeGreaterThan(0);
    });
  });
}

if (!useRealDb) {
  describe('Vessels Data Tests (Mock Data)', () => {
    test('should include CSV Normand Pioneer', () => {
      const csv = mockVessels.find((vessel) => vessel.name.includes('Normand Pioneer'));
      expect(csv).toBeDefined();
      expect(csv?.type).toBe('CSV');
      expect(csv?.deckCargoCapacity).toBeGreaterThan(3500);
    });

    test('should have Standard PSV vessels with expected capabilities', () => {
      const standardPsvs = mockVessels.filter((vessel) => vessel.type === 'Standard PSV');
      expect(standardPsvs.length).toBeGreaterThanOrEqual(2);
      standardPsvs.forEach((vessel) => {
        expect(vessel.deckCargoCapacity).toBeGreaterThanOrEqual(2450);
        expect(vessel.dpClass).toBe('DP-2');
      });
    });

    test('should have compartment data for standard vessels', () => {
      const standardIds = mockVessels
        .filter((vessel) => vessel.type === 'Standard PSV')
        .map((vessel) => vessel.id);
      const compartmentCount = mockVesselCompartments.filter((compartment) =>
        standardIds.includes(compartment.vesselId)
      );
      expect(compartmentCount.length).toBeGreaterThan(0);
    });

    test('should include vessel schedules', () => {
      expect(mockVesselSchedules.length).toBeGreaterThan(0);
      expect(mockVesselSchedules.every((schedule) => !!schedule.nextAvailable)).toBe(true);
    });
  });
}