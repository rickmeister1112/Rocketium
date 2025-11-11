import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';

import type { IUserRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

const DEFAULT_NAME_PREFIX = 'Designer';

interface RegisterInput {
  email: string;
  password: string;
  name?: string | undefined;
}

interface LoginInput {
  email: string;
  password: string;
}

export class UserService {
  constructor(private readonly users: IUserRepository) {}

  async register({ email, password, name }: RegisterInput) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.users.findByEmail(normalizedEmail);
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'EMAIL_TAKEN', 'An account with this email already exists');
    }

    const displayName = await this.generateUniqueDisplayName(name ?? normalizedEmail);
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.users.create(normalizedEmail, passwordHash, displayName);
    logger.info({ userId: user.id, email: user.email }, 'User registered');
    return user;
  }

  async login({ email, password }: LoginInput) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.users.findByEmail(normalizedEmail);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    return user;
  }

  async updateDisplayName(userId: string, name: string) {
    const displayName = await this.generateUniqueDisplayName(name, userId);
    const updated = await this.users.updateDisplayName(userId, displayName);
    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'USER_NOT_FOUND', 'User not found');
    }
    return updated;
  }

  private async generateUniqueDisplayName(raw: string, userIdToExclude?: string): Promise<string> {
    const baseCandidate = this.normalizeName(raw);
    let attempt = 0;

    while (attempt < 20) {
      const candidate = attempt === 0 ? baseCandidate : `${baseCandidate}-${this.generateSuffix(attempt)}`;
      const taken = await this.isDisplayNameTaken(candidate, userIdToExclude);
      if (!taken) {
        return candidate;
      }
      attempt += 1;
    }

    const fallback = `${DEFAULT_NAME_PREFIX}-${Date.now().toString(36)}`;
    return fallback;
  }

  private async isDisplayNameTaken(displayName: string, userIdToExclude?: string): Promise<boolean> {
    const taken = await this.users.isDisplayNameTaken(displayName);
    if (!taken || !userIdToExclude) {
      return taken;
    }

    const existingUser = await this.users.findById(userIdToExclude);
    if (existingUser && existingUser.displayName === displayName) {
      return false;
    }
    return taken;
  }

  private normalizeName(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) {
      return `${DEFAULT_NAME_PREFIX}-${this.generateSuffix(Date.now())}`;
    }
    const sanitized = trimmed.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
    if (!sanitized) {
      return `${DEFAULT_NAME_PREFIX}-${this.generateSuffix(Date.now())}`;
    }
    return sanitized.toLowerCase();
  }

  private generateSuffix(seed: number): string {
    return Math.abs(seed % 1_000_000)
      .toString(36)
      .padStart(4, '0');
  }
}


