import { Router } from 'express';
import { getHealthStatus } from './health.controller';

export const healthRoutes = Router();

healthRoutes.get('/', getHealthStatus);
