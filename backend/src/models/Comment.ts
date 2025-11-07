import { Document, Model, Schema, Types, model } from 'mongoose';

export interface CommentDocument extends Document {
  designId: Types.ObjectId;
  authorId?: string;
  authorName: string;
  message: string;
  mentions: string[];
  x?: number;
  y?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<CommentDocument>({
  designId: { type: Schema.Types.ObjectId, ref: 'Design', required: true },
  authorId: { type: String },
  authorName: { type: String, required: true },
  message: { type: String, required: true },
  mentions: { type: [String], default: [] },
  x: { type: Number },
  y: { type: Number },
}, {
  timestamps: true,
});

CommentSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    if (ret.designId instanceof Types.ObjectId) {
      ret.designId = ret.designId.toString();
    }
    delete ret._id;
    if (ret.__v !== undefined) {
      delete ret.__v;
    }
    return ret;
  },
});

export const Comment: Model<CommentDocument> = model('Comment', CommentSchema);

