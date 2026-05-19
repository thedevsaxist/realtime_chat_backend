import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config } from '.';

export function initSentry() {
  if (!config.isProduction || !config.sentry.dsn) return;

  Sentry.init({
    dsn: config.sentry.dsn,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 0.2,
    profilesSampleRate: 0.1,
  });
}
