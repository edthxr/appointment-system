import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  USE_MOCK_DB: z.enum(['true', 'false']).default('true'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const envParsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  USE_MOCK_DB: process.env.USE_MOCK_DB,
  NODE_ENV: process.env.NODE_ENV,
});

if (!envParsed.success) {
  console.warn('⚠️ Environment validation warning:', envParsed.error.format());
}

export const env = envParsed.success 
  ? envParsed.data 
  : { 
      NODE_ENV: 'development', 
      DATABASE_URL: undefined,
      USE_MOCK_DB: 'true' as const 
    };
