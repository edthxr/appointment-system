import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '@/lib/env';

const connectionString = env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is required');
}

export const pool = new Pool({
  connectionString,
});

// Test connection
pool.connect((err: Error | undefined, _client: any, release: () => void) => {
  if (err) {
    return console.error('❌ Error acquiring client', err.stack);
  }
  console.log('✅ Database connected successfully');
  release();
});

export const db = drizzle(pool, { schema });

// Helper to check if DB is available
export const isDbReady = () => !!db;
