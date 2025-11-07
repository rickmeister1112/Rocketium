import { Document, Model, Types } from 'mongoose';
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
export declare const Comment: Model<CommentDocument>;
//# sourceMappingURL=Comment.d.ts.map