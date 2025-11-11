import { Session, type SessionDocument } from '../models/Session';

const MAX_ACTIVE_SESSIONS = 5;

export class SessionRepository {
  async create(userId: string, sessionId: string): Promise<SessionDocument> {
    return Session.create({ userId, sessionId });
  }

  async countByUser(userId: string): Promise<number> {
    return Session.countDocuments({ userId }).exec();
  }

  async findOldestByUser(userId: string): Promise<SessionDocument | null> {
    return Session.findOne({ userId }).sort({ createdAt: 1 }).exec();
  }

  async deleteById(sessionId: string): Promise<void> {
    await Session.deleteOne({ sessionId }).exec();
  }

  async deleteMany(predicate: Record<string, unknown>): Promise<void> {
    await Session.deleteMany(predicate).exec();
  }

  async findBySessionId(sessionId: string): Promise<SessionDocument | null> {
    return Session.findOne({ sessionId }).exec();
  }

  async touch(sessionId: string): Promise<void> {
    await Session.updateOne(
      { sessionId },
      { $set: { lastUsedAt: new Date() } },
    ).exec();
  }

  async ensureCapacity(userId: string): Promise<void> {
    const count = await this.countByUser(userId);
    if (count < MAX_ACTIVE_SESSIONS) {
      return;
    }
    const toRemove = count - MAX_ACTIVE_SESSIONS + 1;
    for (let i = 0; i < toRemove; i += 1) {
      const oldest = await this.findOldestByUser(userId);
      if (!oldest) {
        return;
      }
      await this.deleteById(oldest.sessionId);
    }
  }
}


