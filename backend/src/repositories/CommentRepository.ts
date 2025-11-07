import { Types } from 'mongoose';

import type { CommentDocument } from '../models/Comment';
import { Comment } from '../models/Comment';
import type { CommentCreateInput } from '../validators/designValidators';

export interface ICommentRepository {
  create(designId: string, payload: CommentCreateInput): Promise<CommentDocument>;
  listByDesign(designId: string): Promise<CommentDocument[]>;
  update(designId: string, commentId: string, payload: Partial<CommentCreateInput>): Promise<CommentDocument | null>;
  deleteByDesign(designId: string): Promise<number>;
}

export class MongoCommentRepository implements ICommentRepository {
  async create(designId: string, payload: CommentCreateInput): Promise<CommentDocument> {
    return Comment.create({
      designId: new Types.ObjectId(designId),
      ...payload,
    });
  }

  async listByDesign(designId: string): Promise<CommentDocument[]> {
    return Comment.find({ designId: new Types.ObjectId(designId) }).sort({ createdAt: 1 }).exec();
  }

  async update(designId: string, commentId: string, payload: Partial<CommentCreateInput>): Promise<CommentDocument | null> {
    return Comment.findOneAndUpdate(
      { _id: new Types.ObjectId(commentId), designId: new Types.ObjectId(designId) },
      { $set: { ...payload, updatedAt: new Date() } },
      { new: true },
    ).exec();
  }

  async deleteByDesign(designId: string): Promise<number> {
    if (!Types.ObjectId.isValid(designId)) {
      return 0;
    }
    const result = await Comment.deleteMany({ designId: new Types.ObjectId(designId) }).exec();
    return result?.deletedCount ?? 0;
  }
}

