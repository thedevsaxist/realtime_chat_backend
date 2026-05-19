
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';
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

export default defineConfig({
  schema: 'src/infrastructure/database/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});