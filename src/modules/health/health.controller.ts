import { Request, Response } from 'express';

export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running healthily',
    timestamp: new Date().toISOString(),
  });
};
