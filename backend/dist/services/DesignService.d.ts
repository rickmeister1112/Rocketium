import type { ICommentRepository } from '../repositories/CommentRepository';
import type { IDesignRepository } from '../repositories/DesignRepository';
import type { CommentCreateInput, CommentUpdateInput, DesignCreateInput, DesignUpdateInput } from '../validators/designValidators';
import type { IDesignEventPublisher } from '../realtime/DesignEventPublisher';
export interface IDesignService {
    createDesign(payload: DesignCreateInput): Promise<unknown>;
    listDesigns(search?: string): Promise<unknown[]>;
    getDesign(id: string): Promise<unknown>;
    updateDesign(id: string, payload: DesignUpdateInput): Promise<unknown>;
    addComment(designId: string, payload: CommentCreateInput): Promise<unknown>;
    listComments(designId: string): Promise<unknown[]>;
    updateComment(designId: string, commentId: string, payload: CommentUpdateInput): Promise<unknown>;
}
export declare class DesignService implements IDesignService {
    private readonly designs;
    private readonly comments;
    private readonly publisher;
    constructor(designs: IDesignRepository, comments: ICommentRepository, publisher: IDesignEventPublisher);
    createDesign(payload: DesignCreateInput): Promise<unknown>;
    listDesigns(search?: string): Promise<unknown[]>;
    getDesign(id: string): Promise<unknown>;
    updateDesign(id: string, payload: DesignUpdateInput): Promise<unknown>;
    addComment(designId: string, payload: CommentCreateInput): Promise<unknown>;
    listComments(designId: string): Promise<unknown[]>;
    updateComment(designId: string, commentId: string, payload: CommentUpdateInput): Promise<unknown>;
}
//# sourceMappingURL=DesignService.d.ts.map