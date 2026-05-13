import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middleware/errorHandler';
import { logger } from './shared/logger';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { query: req.query, body: req.method !== 'GET' ? req.body : undefined });
  next();
});

import { chatRoutes } from './modules/chat/chat.routes';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { authMiddleware } from './shared/middleware/auth.middleware';
import { searchUsersRoutes } from './modules/search-users/search-users.routes';

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);

// Apply auth middleware for all protected routes below this line
app.use(authMiddleware);

app.use('/', chatRoutes);

app.use('/users', searchUsersRoutes);

// Global Error Handler
app.use(errorHandler);
