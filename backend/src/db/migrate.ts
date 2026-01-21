import { execSync } from 'child_process';
import { join } from 'path';
import pool from './connection';
import dotenv from 'dotenv';

dotenv.config();

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
      console.error('\nPlease ensure PostgreSQL is running:');
      console.error('  sudo systemctl start postgresql');
      console.error('\nOr check your .env file configuration.');
      console.error('\nConnection error:', error.message);
      process.exit(1);
    }

    // Check if PostGIS is available
    try {
      await pool.query('SELECT PostGIS_version();');
      console.log('✅ PostGIS extension available');
    } catch (error: any) {
      console.warn('⚠️  PostGIS not installed - geographic features will be limited');
      console.warn('   Install with: sudo pacman -S postgis');
      console.warn('   The schema requires PostGIS for GEOGRAPHY type support');
    }

    // Read the SQL schema file path
    const schemaPath = join(__dirname, '../../../references/prio_sql_schema.sql');

    // Use psql to execute the file directly - it handles all SQL parsing correctly
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'prio_logistics';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || '';

    console.log('📝 Executing SQL schema file...');
    console.log(`   Database: ${dbName}@${dbHost}:${dbPort}`);

    // Set PGPASSWORD environment variable for psql
    const env = { ...process.env, PGPASSWORD: dbPassword };

    try {
      // Execute with psql, capturing output
      const result = execSync(
        `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${schemaPath} 2>&1`,
        {
          env,
          encoding: 'utf-8'
        }
      );

      // Filter and display results
      const lines = result.split('\n');
      let hasErrors = false;
      let hasWarnings = false;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.includes('ERROR:')) {
          // Check if it's an "already exists" error or TimescaleDB (safe to ignore)
          if (trimmed.includes('already exists') ||
              trimmed.includes('duplicate key') ||
              trimmed.includes('timescaledb') ||
              trimmed.includes('create_hypertable')) {
            console.log(`⏭️  ${trimmed} (optional extension, skipping)`);
            hasWarnings = true;
          } else {
            console.error(`❌ ${trimmed}`);
            hasErrors = true;
          }
        } else if (trimmed.includes('WARNING:')) {
          console.log(`⚠️  ${trimmed}`);
          hasWarnings = true;
        } else if (trimmed.includes('CREATE') || trimmed.includes('ALTER') || trimmed.includes('INSERT')) {
          // Quiet success for DDL statements
        }
      }

      if (!hasErrors) {
        console.log('✅ Database migration completed successfully!');
        if (hasWarnings) {
          console.log('   (Some expected warnings about existing objects were ignored)');
        }
      } else {
        console.error('❌ Migration completed with errors');
        process.exit(1);
      }

    } catch (error: any) {
      // execSync throws on non-zero exit, but we want to check the output
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
      const lines = output.split('\n');

      let criticalErrors = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.includes('ERROR:')) {
          if (!trimmed.includes('already exists') &&
              !trimmed.includes('duplicate key') &&
              !trimmed.includes('timescaledb') &&
              !trimmed.includes('create_hypertable')) {
            console.error(`❌ ${trimmed}`);
            criticalErrors = true;
          } else {
            console.log(`⏭️  ${trimmed} (optional extension, skipping)`);
          }
        }
      }

      if (criticalErrors) {
        console.error('❌ Migration failed with critical errors');
        process.exit(1);
      } else {
        console.log('✅ Database migration completed (with some expected warnings)');
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
