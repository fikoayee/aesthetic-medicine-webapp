import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(400, message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    Object.values((err as any).errors).forEach((error: any) => {
      errors[error.path] = error.message;
    });

    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID format'
    });
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(409).json({
      status: 'error',
      message: `${field} already exists`
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors })
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
};
