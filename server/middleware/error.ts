import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', error);
  const status = error instanceof ApiError ? error.status : error.status || error.statusCode || 500;
  const code = error instanceof ApiError ? error.code : error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'Internal Server Error';
  const details = error instanceof ApiError ? error.details : error.details || null;

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
}
