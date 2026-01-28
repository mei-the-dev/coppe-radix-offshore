/**
 * Run supply-base migration (macaé → porto-acu) and verify production DB.
 * Usage: from project root with production env set, or:
 *   cd backend && DB_HOST=... DB_PORT=... DB_NAME=db DB_USER=... DB_PASSWORD=... npx tsx scripts/run-migrate-and-verify.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import pool from '../src/db/connection';

const MIGRATION_SQL = join(__dirname, '../../scripts/migrate-supply-base-to-porto-acu.sql');

function stripComments(s: string): string {
  return s
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
}

function splitStatements(sql: string): string[] {
  const stripped = stripComments(sql);
  return stripped
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function runMigration(client: import('pg').PoolClient): Promise<void> {
  if (!existsSync(MIGRATION_SQL)) {
    console.error('Migration file not found:', MIGRATION_SQL);
    process.exit(1);
  }
  const sql = readFileSync(MIGRATION_SQL, 'utf-8');
  const statements = splitStatements(sql);
  console.log('Running', statements.length, 'migration statement(s)...');
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const full = stmt.endsWith(';') ? stmt : stmt + ';';
    try {
      const res = await client.query(full);
      console.log('  OK:', full.slice(0, 60).replace(/\s+/g, ' ') + '...', 'rows:', res.rowCount ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/does not exist|relation|column/i.test(msg)) {
        console.warn('  Skip (table/column missing):', msg.slice(0, 80));
      } else {
        throw err;
      }
    }
  }
}

async function verify(client: import('pg').PoolClient): Promise<void> {
  console.log('\n--- Supply bases ---');
  const sb = await client.query(`
    SELECT id, name, port_code,
           ROUND((ST_Y(location::geometry))::numeric, 4) AS lat,
           ROUND((ST_X(location::geometry))::numeric, 4) AS lon,
           max_draught_m, max_vessel_length_m, max_deadweight_t
    FROM supply_bases
    ORDER BY id
  `);
  if (sb.rows.length === 0) {
    console.log('  (none)');
  } else {
    sb.rows.forEach((r: Record<string, unknown>) => console.log('  ', r));
  }

  console.log('\n--- Distance matrix (from supply base) ---');
  const dm = await client.query(`
    SELECT from_location_id, to_location_id, distance_nm, time_12kts_h, time_14kts_h
    FROM distance_matrix
    WHERE from_location_id IN ('macaé', 'porto-acu')
    ORDER BY from_location_id, distance_nm
    LIMIT 12
  `);
  if (dm.rows.length === 0) {
    console.log('  (none)');
  } else {
    dm.rows.forEach((r: Record<string, unknown>) => console.log('  ', r));
  }

  console.log('\n--- Vessels (current_location_id) ---');
  const v = await client.query(`
    SELECT id, name, current_location_id
    FROM vessels
    ORDER BY id
    LIMIT 10
  `);
  if (v.rows.length === 0) {
    console.log('  (none)');
  } else {
    v.rows.forEach((r: Record<string, unknown>) => console.log('  ', r));
  }
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to DB:', process.env.DB_HOST || 'localhost', process.env.DB_NAME || 'prio_logistics');
    await runMigration(client);
    await verify(client);
    console.log('\nDone.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
