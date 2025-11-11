import type { CommentDocument } from '../models/Comment';
import type { CommentCreateInput } from '../validators/designValidators';
export interface ICommentRepository {
    create(designId: string, payload: CommentCreateInput): Promise<CommentDocument>;
    listByDesign(designId: string): Promise<CommentDocument[]>;
    update(designId: string, commentId: string, payload: Partial<CommentCreateInput>): Promise<CommentDocument | null>;
    deleteByDesign(designId: string): Promise<number>;
}
export declare class MongoCommentRepository implements ICommentRepository {
    create(designId: string, payload: CommentCreateInput): Promise<CommentDocument>;
    listByDesign(designId: string): Promise<CommentDocument[]>;
    update(designId: string, commentId: string, payload: Partial<CommentCreateInput>): Promise<CommentDocument | null>;
    deleteByDesign(designId: string): Promise<number>;
}
//# sourceMappingURL=CommentRepository.d.ts.map