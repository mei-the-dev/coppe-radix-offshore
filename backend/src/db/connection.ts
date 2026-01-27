import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function getDbPassword(): string {
  const p = process.env.DB_PASSWORD;
  if (process.env.NODE_ENV === 'production' && (p === undefined || p === '')) {
    // Do not throw: keeps server up so /health and /auth/login work. First DB use will fail.
    console.warn('DB_PASSWORD missing in production; DB features will fail until set (e.g. ${db.PASSWORD})');
    return '';
  }
  return p ?? 'postgres';
}

const dbHost = process.env.DB_HOST || 'localhost';
const useSsl =
  process.env.DB_SSLMODE === 'require' ||
  (dbHost.includes('ondigitalocean.com') && process.env.DB_SSLMODE !== 'disable');

const connectionTimeout = useSsl
  ? parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '15000')
  : parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '2000');

const sslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' && process.env.DB_SSL_REJECT_UNAUTHORIZED !== '0';

const pool = new Pool({
  host: dbHost,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'prio_logistics',
  user: process.env.DB_USER || 'postgres',
  password: getDbPassword(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: connectionTimeout,
  ...(useSsl ? { ssl: { rejectUnauthorized: sslRejectUnauthorized } } : {}),
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

// Log only; do not exit. Keeps /health and /auth/login (and other non-DB routes) working
// when DB is unreachable (e.g. production with DB_HOST=localhost and no local Postgres).
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
