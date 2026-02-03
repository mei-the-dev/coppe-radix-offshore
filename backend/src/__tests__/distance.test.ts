/**
 * Distance matrix tests
 */

import type { Pool } from 'pg';
import { mockDistanceMatrix } from '../data/mockData';

const useRealDb = process.env.USE_REAL_DB === 'true';
let pool: Pool | null = null;

if (useRealDb) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const connection = require('../db/connection');
  pool = connection.default ?? connection;

  describe('Distance Matrix Tests (PostgreSQL)', () => {
    afterAll(async () => {
      await pool?.end();
    });

    test('should have distance from Porto do Açu to Peregrino', async () => {
      const result = await pool!.query(`
        SELECT * FROM distance_matrix
        WHERE from_location_id = 'porto-acu' AND to_location_id = 'fpso-peregrino'
      `);
      expect(result.rows.length).toBe(1);
      expect(parseFloat(result.rows[0].distance_nm)).toBe(46);
      expect(parseFloat(result.rows[0].time_12kts_h)).toBeCloseTo(3.8, 1);
    });

    test('should have distance from Porto do Açu to all major installations', async () => {
      const result = await pool!.query(`
        SELECT to_location_id, distance_nm
        FROM distance_matrix
        WHERE from_location_id = 'porto-acu'
        ORDER BY distance_nm
      `);
      expect(result.rows.length).toBeGreaterThanOrEqual(5);

      const distances = result.rows.reduce((acc, row) => {
        acc[row.to_location_id] = parseFloat(row.distance_nm);
        return acc;
      }, {} as Record<string, number>);

      expect(distances['fpso-peregrino']).toBe(46);
      expect(distances['fpso-valente']).toBe(67);
      expect(distances['fpso-bravo']).toBe(70);
    });

    test('should have inter-installation distances', async () => {
      const result = await pool!.query(`
        SELECT * FROM distance_matrix
        WHERE from_location_id = 'platform-polvo' AND to_location_id = 'fpso-bravo'
      `);
      expect(result.rows.length).toBe(1);
      expect(parseFloat(result.rows[0].distance_nm)).toBeCloseTo(5.9, 1);
    });

    test('should have weather factors', async () => {
      const result = await pool!.query(`
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
}

if (!useRealDb) {
  describe('Distance Matrix Tests (Mock Data)', () => {
    test('should have distance from Porto do Açu to Peregrino', () => {
      const entry = mockDistanceMatrix.find(
        (row) => row.fromLocationId === 'porto-acu' && row.toLocationId === 'fpso-peregrino'
      );
      expect(entry).toBeDefined();
      expect(entry?.distanceNm).toBe(46);
      expect(entry?.time12ktsHours).toBeCloseTo(3.8, 1);
    });

    test('should have distance from Porto do Açu to all major installations', () => {
      const portoEntries = mockDistanceMatrix.filter((row) => row.fromLocationId === 'porto-acu');
      expect(portoEntries.length).toBeGreaterThanOrEqual(3);
      const map = portoEntries.reduce<Record<string, number>>((acc, row) => {
        acc[row.toLocationId] = row.distanceNm;
        return acc;
      }, {});
      expect(map['fpso-peregrino']).toBe(46);
      expect(map['fpso-valente']).toBe(67);
      expect(map['fpso-bravo']).toBe(70);
    });

    test('should have inter-installation distances', () => {
      const entry = mockDistanceMatrix.find(
        (row) => row.fromLocationId === 'platform-polvo' && row.toLocationId === 'fpso-bravo'
      );
      expect(entry).toBeDefined();
      expect(entry?.distanceNm).toBeCloseTo(5.9, 1);
    });

    test('should define weather factors', () => {
      mockDistanceMatrix.forEach((row) => {
        expect(row.weatherFactorGood).toBeGreaterThanOrEqual(1);
        expect(row.weatherFactorModerate).toBeGreaterThan(row.weatherFactorGood);
        expect(row.weatherFactorRough).toBeGreaterThan(row.weatherFactorModerate);
      });
    });
  });
}