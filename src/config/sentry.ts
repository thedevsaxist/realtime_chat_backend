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
    // Send structured logs to Sentry
    enableLogs: true,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });
}
