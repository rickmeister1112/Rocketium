import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ZodError } from 'zod';

import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error({ err, code: err.code }, 'API error');
    } else {
      logger.warn({ err, code: err.code }, 'Client error');
    }
    const body: ErrorResponse = {
      code: err.code,
      message: err.message,
      details: err.details,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: err.flatten(),
    };
    logger.warn({ err: err.flatten() }, 'Validation failed');
    res.status(StatusCodes.BAD_REQUEST).json(body);
    return;
  }

  const body: ErrorResponse = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  };
  if (process.env.NODE_ENV !== 'production') {
    body.details = {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    };
  }
  logger.error({ err }, 'Unhandled error');

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(body);
};

