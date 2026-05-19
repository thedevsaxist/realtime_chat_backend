import * as dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';

const candidates =
  process.env.NODE_ENV === 'production'
    ? ['.env.prod', '.env.production', '.env']
    : ['.env.local', '.env.development', '.env'];

const envFile = candidates.find((f) => existsSync(path.resolve(f)));
if (envFile) dotenv.config({ path: path.resolve(envFile) });
else dotenv.config();

import { defineConfig } from 'prisma/config';


export default defineConfig({
  schema: 'src/infrastructure/database/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
