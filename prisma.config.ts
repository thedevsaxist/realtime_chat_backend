import * as dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config();

export default defineConfig({
  schema: 'src/infrastructure/database/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
