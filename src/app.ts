import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middleware/errorHandler';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

import { chatRoutes } from './modules/chat/chat.routes';
import { healthRoutes } from './modules/health/health.routes';

// Routes
app.use('/health', healthRoutes);
app.use('/messages', chatRoutes);

// Global Error Handler
app.use(errorHandler);
