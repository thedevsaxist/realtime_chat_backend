import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config } from '.';
import { expressIntegration } from '@sentry/node';

export function initSentry() {
  if (!config.isProduction || !config.sentry.dsn) return;

  Sentry.init({
    dsn: config.sentry.dsn,
    integrations: [expressIntegration(), nodeProfilingIntegration()],
    tracesSampleRate: 0.2,
    profilesSampleRate: 0.1,
  });
}
