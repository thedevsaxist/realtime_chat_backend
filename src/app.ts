import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middleware/errorHandler';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { chatRoutes } from './modules/chat/chat.routes';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { authMiddleware } from './shared/middleware/auth.middleware';

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);

// Apply auth middleware for all protected routes below this line
app.use(authMiddleware);

app.use('/messages', chatRoutes);

// Global Error Handler
app.use(errorHandler);
