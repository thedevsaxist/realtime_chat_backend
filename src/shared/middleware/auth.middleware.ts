import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const excludePaths = ['/auth', '/health'];

    if (excludePaths.includes(req.path)) {
      next();
      return;
    } 

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`authMiddleware: missing or malformed token on ${req.method} ${req.path}`);
      res.status(401).json({ message: 'Authorization token missing or invalid' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    req.user = decoded;
    logger.debug(`authMiddleware: authenticated userId=${decoded.userId} on ${req.method} ${req.path}`);
    next();
  } catch (error) {
    logger.warn(`authMiddleware: invalid or expired token on ${req.method} ${req.path}`);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
