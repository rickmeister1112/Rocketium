import { Document, Model, Schema, Types, model } from 'mongoose';

import type { DesignElement, DesignCollaborator, CollaboratorStatus } from '../types/design';

export interface CollaboratorSubdocument {
  userId: string;
  userName?: string;
  status: CollaboratorStatus;
  requestedAt: Date;
  respondedAt?: Date;
}

export interface DesignDocument extends Document {
  name: string;
  width: number;
  height: number;
  ownerId?: string;
  ownerName?: string;
  elements: DesignElement[];
  thumbnailUrl?: string;
  collaborators: CollaboratorSubdocument[];
  createdAt: Date;
  updatedAt: Date;
}

const CollaboratorSchema = new Schema<CollaboratorSubdocument>(
  {
    userId: { type: String, required: true },
    userName: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending', required: true },
    requestedAt: { type: Date, default: () => new Date(), required: true },
    respondedAt: { type: Date },
  },
  { _id: false },
);

const DesignSchema = new Schema<DesignDocument>({
  name: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  ownerId: { type: String, required: false },
  ownerName: { type: String, required: false },
  elements: { type: Schema.Types.Mixed, default: [] },
  thumbnailUrl: { type: String },
  collaborators: { type: [CollaboratorSchema], default: [] },
}, {
  timestamps: true,
});

DesignSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    if (ret.__v !== undefined) {
      delete ret.__v;
    }
    return ret;
  },
});

export const Design: Model<DesignDocument> = model('Design', DesignSchema);

