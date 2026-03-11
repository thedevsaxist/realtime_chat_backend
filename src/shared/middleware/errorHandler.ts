import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(`Error: ${err.message}`, { stack: err.stack, path: req.path });

  // Handle specific errors manually if needed
  if (err.name === 'PrismaClientKnownRequestError') {
    error = new AppError('Validation Error', 400);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // Fallback catch-all
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
