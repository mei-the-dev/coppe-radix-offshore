import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import pool from './connection';
import dotenv from 'dotenv';

dotenv.config();

function isIgnorableError(msg: string): boolean {
  return /already exists|duplicate key|timescaledb|create_hypertable/i.test(msg);
}

/** Strip leading comment and blank lines so CREATE/ALTER/... is first. */
function stripLeadingComments(s: string): string {
  const lines = s.split(/\n/);
  let i = 0;
  while (i < lines.length && /^\s*$|^\s*--/.test(lines[i])) i++;
  return lines.slice(i).join('\n').trim();
}

async function runViaNode(schemaPath: string): Promise<void> {
  const sql = readFileSync(schemaPath, 'utf-8');
  // Split at semicolons that start a new top-level statement (avoids splitting inside $$ blocks).
  // Include "--" in lookahead so we split before comment blocks; then stripLeadingComments gives us the next CREATE.
  const raw = sql.split(/;\s*\n(?=\s*(?:CREATE|ALTER|INSERT|DROP|SELECT|COMMENT|GRANT|REVOKE|--))/i);
  let statements = raw
    .map((s) => stripLeadingComments(s.trim()))
    .filter((s) => s.length > 0);
  // Merge statements that are function bodies: "CREATE ... FUNCTION ... $$" without "$$ LANGUAGE" must be merged with next until we see "$$ LANGUAGE" or "$$;"
  const merged: string[] = [];
  for (let i = 0; i < statements.length; i++) {
    let stmt = statements[i];
    while (
      /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i.test(stmt) &&
      /\$\$/.test(stmt) &&
      !/\$\s*LANGUAGE\s+plpgsql\s*;?\s*$/i.test(stmt.replace(/\s+/g, ' '))
    ) {
      if (i + 1 >= statements.length) break;
      stmt = stmt + ';\n' + statements[++i];
    }
    merged.push(stmt);
  }
  statements = merged;
  let skipped = 0;
  for (const stmt of statements) {
    const full = stmt.endsWith(';') ? stmt : stmt + ';';
    try {
      await pool.query(full);
    } catch (error: any) {
      const msg = String(error?.message || '');
      if (isIgnorableError(msg)) {
        skipped++;
      } else {
        console.error('❌ Migration failed:', msg);
        console.error('   Statement (first 120 chars):', full.slice(0, 120) + '…');
        throw error;
      }
    }
  }
  console.log('✅ Database migration completed successfully!');
  if (skipped) console.log(`   (${skipped} statements skipped: already exists / optional extension)`);
}

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    console.log('📡 Attempting to connect to database...');

    // Test connection first
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful');
    } catch (error: any) {
      console.error('❌ Database connection failed!');
      console.error('\nPlease ensure PostgreSQL is running or check .env / production DB credentials.');
      console.error('Connection error:', error.message);
      process.exit(1);
    }

    // Check if PostGIS is available
    try {
      await pool.query('SELECT PostGIS_version();');
      console.log('✅ PostGIS extension available');
    } catch (error: any) {
      console.warn('⚠️  PostGIS not installed - geographic features will be limited');
    }

    // Schema path: from backend/src/db or backend/dist/db, go to project references/
    const schemaPath = join(__dirname, '../../../references/prio_sql_schema.sql');
    if (!existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      process.exit(1);
    }

    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'prio_logistics';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD ?? '';
    if (process.env.NODE_ENV === 'production' && !dbPassword) {
      throw new Error('DB_PASSWORD must be set in production');
    }

    console.log('📝 Executing SQL schema file...');
    console.log(`   Database: ${dbName}@${dbHost}:${dbPort}`);

    const useNode = process.env.RUN_MIGRATE_VIA_NODE === '1';

    if (useNode) {
      await runViaNode(schemaPath);
      return;
    }

    // Try psql first (when available)
    const env = { ...process.env, PGPASSWORD: dbPassword };
    try {
      const result = execSync(
        `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${schemaPath} 2>&1`,
        { env, encoding: 'utf-8' }
      );
      const lines = result.split('\n');
      let hasErrors = false;
      for (const line of lines) {
        const t = line.trim();
        if (t.includes('ERROR:') && !isIgnorableError(t)) {
          console.error('❌', t);
          hasErrors = true;
        }
      }
      if (!hasErrors) {
        console.log('✅ Database migration completed successfully!');
        return;
      }
      process.exit(1);
    } catch (error: any) {
      const out = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
      if (out.includes('command not found') || out.includes('psql: not found') || /ENOENT|spawn psql/i.test(String(error.code ?? ''))) {
        console.log('⏭️  psql not found; running migration via Node (set RUN_MIGRATE_VIA_NODE=1 to skip psql).');
        await runViaNode(schemaPath);
      } else {
        let critical = false;
        for (const line of out.split('\n')) {
          const t = line.trim();
          if (t.includes('ERROR:') && !isIgnorableError(t)) {
            console.error('❌', t);
            critical = true;
          }
        }
        if (critical) process.exit(1);
        console.log('✅ Database migration completed (with expected warnings).');
      }
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
