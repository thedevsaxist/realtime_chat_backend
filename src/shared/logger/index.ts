import winston from 'winston';
import { config } from '../../config';

export const logger = winston.createLogger({
  level: config.isProduction ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    config.isProduction ? winston.format.json() : winston.format.prettyPrint(),
  ),
  defaultMeta: { service: 'realtime-chat-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}\n\n`),
      ),
    }),
  ],
});
