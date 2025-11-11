import { Document, Model, Schema, model } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.set('toJSON', {
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

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ displayName: 1 }, { unique: true });

export const User: Model<UserDocument> = model<UserDocument>('User', UserSchema);


