import winston from 'winston';
import { config } from '../../config';

/** Keys merged onto Winston's log info that should not be printed as arbitrary metadata. */
const printfMetaSkip = new Set([
  'level',
  'message',
  'timestamp',
  'service',
  'splat',
  'stack',
  'label',
]);

function formatMetaSuffix(info: winston.Logform.TransformableInfo): string {
  const meta: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(info)) {
    if (!printfMetaSkip.has(key)) {
      meta[key] = value;
    }
  }
  if (Object.keys(meta).length === 0) {
    return '';
  }
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return ' [metadata: could not serialize]';
  }
}

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
        winston.format.printf(
          (info) =>
            `[${info.timestamp}] ${info.level}: ${info.message}${formatMetaSuffix(info)}\n\n`,
        ),
      ),
    }),
  ],
});
