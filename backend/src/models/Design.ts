import { Document, Model, Schema, Types, model } from 'mongoose';

import type { DesignElement } from '../types/design';

export interface DesignDocument extends Document {
  name: string;
  width: number;
  height: number;
  elements: DesignElement[];
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DesignSchema = new Schema<DesignDocument>({
  name: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  elements: { type: Schema.Types.Mixed, default: [] },
  thumbnailUrl: { type: String },
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

