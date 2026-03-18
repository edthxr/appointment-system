import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/env';

// For MVP, we allow client to be null if DATABASE_URL is missing
const connectionString = env.DATABASE_URL;

if (!connectionString && env.USE_MOCK_DB === 'false') {
  console.error('❌ DATABASE_URL is required when USE_MOCK_DB is false');
}

export const client = connectionString ? postgres(connectionString) : null;
export const db = client ? drizzle(client, { schema }) : null;

// Helper to check if DB is available
export const isDbReady = () => !!db && env.USE_MOCK_DB === 'false';
