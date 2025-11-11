import { randomUUID } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { SessionRepository } from '../repositories/SessionRepository';
import { DEFAULT_SESSION_NAME } from '../config/constants';
import { logger } from '../utils/logger';

const sessionRepository = new SessionRepository();

interface IssueSessionInput {
  name: string;
  userId?: string | undefined;
  email?: string;
}

interface IssueSessionResult {
  token: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
}

export class SessionService {
  async issueSession({ name, userId, email }: IssueSessionInput): Promise<IssueSessionResult> {
    const trimmedName = name.trim() || DEFAULT_SESSION_NAME;
    const id = userId ?? randomUUID();

    await sessionRepository.ensureCapacity(id);
    const sessionId = randomUUID();
    await sessionRepository.create(id, sessionId);

    const tokenPayload: Record<string, unknown> = {
      sub: id,
      name: trimmedName,
      sid: sessionId,
    };

    if (email) {
      tokenPayload.email = email;
    }

    const token = jwt.sign(tokenPayload, env.jwtSecret, { expiresIn: '30d' });

    const userSession: IssueSessionResult['user'] = {
      id,
      name: trimmedName,
    };

    if (email) {
      userSession.email = email;
    }

    return {
      token,
      user: userSession,
    };
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await sessionRepository.findBySessionId(sessionId);
      if (!session) {
        return false;
      }
      await sessionRepository.touch(sessionId);
      return true;
    } catch (error) {
      logger.error({ err: error, sessionId }, 'Failed to validate session');
      return false;
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    await sessionRepository.deleteById(sessionId);
  }
}


