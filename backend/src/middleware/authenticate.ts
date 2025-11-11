import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import type { RequestUser } from '../types/user';
import { SessionService } from '../services/SessionService';

interface TokenPayload {
  sub: string;
  name?: string;
  email?: string;
  exp?: number;
  iat?: number;
  sid?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestUser;
  }
}

const sessionService = new SessionService();

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const header = req.header('authorization') ?? req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing authentication token');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing authentication token');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    if (!decoded.sub || !decoded.sid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid authentication token');
    }

    const valid = await sessionService.validateSession(decoded.sid);
    if (!valid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Session expired or revoked');
    }

    const requestUser: RequestUser = {
      id: decoded.sub,
      sessionId: decoded.sid,
    };
    if (decoded.name) {
      requestUser.name = decoded.name;
    }
    if (decoded.email) {
      requestUser.email = decoded.email;
    }
    req.user = requestUser;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid authentication token');
  }
};

