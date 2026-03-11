import dotenv from 'dotenv';
import path from 'path';

// Load .env relative to project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};
