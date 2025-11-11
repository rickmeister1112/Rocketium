import { Schema, model, type Document, type Model } from 'mongoose';

export interface SessionDocument extends Document {
  userId: string;
  sessionId: string;
  createdAt: Date;
  lastUsedAt: Date;
}

const SessionSchema = new Schema<SessionDocument>({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: () => new Date(), required: true },
  lastUsedAt: { type: Date, default: () => new Date(), required: true },
});

SessionSchema.index({ userId: 1, createdAt: 1 });

export const Session: Model<SessionDocument> = model<SessionDocument>('Session', SessionSchema);


