import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';

const envFileCandidates =
  process.env.NODE_ENV === 'production'
    ? ['.env.prod', '.env.production', '.env']
    : ['.env.local', '.env.development', '.env'];

const envFile = envFileCandidates.find((file) => existsSync(file));

if (envFile) {
  dotenv.config({ path: path.resolve(envFile) });
} else {
  dotenv.config();
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL!,
  sentry: {
    dsn: process.env.SENTRY_DSN ?? '',
  },
};
