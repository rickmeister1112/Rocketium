import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncHandler } from '../utils/asyncHandler';
import {
  createSessionSchema,
  forgotPasswordSchema,
  loginSchema,
  profileUpdateSchema,
  registerSchema,
} from '../validators/authValidators';
import { UserService } from '../services/UserService';
import { SessionService } from '../services/SessionService';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class AuthController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) {}

  readonly createSession = asyncHandler(async (req: Request, res: Response) => {
    const payload = createSessionSchema.parse(req.body);
    const session = await this.sessionService.issueSession(payload);

    res.status(StatusCodes.CREATED).json({
      code: 'SESSION_CREATED',
      message: 'Session token issued',
      data: session,
    });
  });

  readonly register = asyncHandler(async (req: Request, res: Response) => {
    const payload = registerSchema.parse(req.body);
    const user = await this.userService.register(payload);
    const session = await this.sessionService.issueSession({
      name: user.displayName,
      userId: user.id,
      email: user.email,
    });

    res.status(StatusCodes.CREATED).json({
      code: 'USER_REGISTERED',
      message: 'Account created successfully',
      data: session,
    });
  });

  readonly login = asyncHandler(async (req: Request, res: Response) => {
    const payload = loginSchema.parse(req.body);
    const user = await this.userService.login(payload);
    const session = await this.sessionService.issueSession({
      name: user.displayName,
      userId: user.id,
      email: user.email,
    });

    res.status(StatusCodes.OK).json({
      code: 'LOGIN_SUCCESS',
      message: 'Logged in successfully',
      data: session,
    });
  });

  readonly forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const payload = forgotPasswordSchema.parse(req.body);
    if (payload.email) {
      logger.info({ email: payload.email }, 'User requested password reset instructions');
    }
    res.status(StatusCodes.OK).json({
      code: 'FORGOT_PASSWORD',
      message: 'Please contact the administrator to reset your password.',
    });
  });

  readonly updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
    }
    const payload = profileUpdateSchema.parse(req.body);
    const updated = await this.userService.updateDisplayName(user.id, payload.name);
    const session = await this.sessionService.issueSession({
      name: updated.displayName,
      userId: updated.id,
      email: updated.email,
    });

    res.status(StatusCodes.OK).json({
      code: 'PROFILE_UPDATED',
      message: 'Profile updated successfully',
      data: session,
    });
  });
}


