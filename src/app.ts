import { initSentry } from './config/sentry';
initSentry(); // must be the very first call

import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import { config } from './config'; // ✅ moved up

import { errorHandler } from './shared/middleware/errorHandler';
import { logger } from './shared/logger';
import { chatRoutes } from './modules/chat/chat.routes';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { authMiddleware } from './shared/middleware/auth.middleware';
import { searchUsersRoutes } from './modules/search-users/search-users.routes';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
  });
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);

app.use(authMiddleware);

app.use('/', chatRoutes);
app.use('/', searchUsersRoutes);


// app.get('/debug-sentry', function mainHandler(req, res) {
//   // Send a log before throwing the error
//   Sentry.logger.info('User triggered test error', {
//     action: 'test_error_endpoint',
//   });
//   throw new Error('My first Sentry error!');
// });

// ✅ Sentry error handler BEFORE your custom error handler
Sentry.setupExpressErrorHandler(app);

// ✅ Your custom error handler last
app.use(errorHandler);
