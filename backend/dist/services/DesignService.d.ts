import type { ICommentRepository } from '../repositories/CommentRepository';
import type { IDesignRepository } from '../repositories/DesignRepository';
import type { CommentCreateInput, CommentUpdateInput, DesignCreateInput, DesignUpdateInput } from '../validators/designValidators';
import type { IDesignEventPublisher } from '../realtime/DesignEventPublisher';
import type { RequestUser } from '../types/user';
export interface IDesignService {
    createDesign(payload: DesignCreateInput, owner: RequestUser): Promise<unknown>;
    listDesigns(requester: RequestUser, search?: string): Promise<unknown[]>;
    getDesign(id: string, requester: RequestUser): Promise<unknown>;
    updateDesign(id: string, payload: DesignUpdateInput, requester?: RequestUser): Promise<unknown>;
    deleteDesign(id: string, requester: RequestUser): Promise<{
        id: string;
    }>;
    addComment(designId: string, payload: CommentCreateInput, requester: RequestUser): Promise<unknown>;
    listComments(designId: string, requester: RequestUser): Promise<unknown[]>;
    updateComment(designId: string, commentId: string, payload: CommentUpdateInput, requester: RequestUser): Promise<unknown>;
    requestAccess(designId: string, requester: RequestUser): Promise<{
        status: string;
    }>;
    respondToAccessRequest(designId: string, userId: string, action: 'approve' | 'deny', requester: RequestUser): Promise<unknown>;
}
export declare class DesignService implements IDesignService {
    private readonly designs;
    private readonly comments;
    private readonly publisher;
    constructor(designs: IDesignRepository, comments: ICommentRepository, publisher: IDesignEventPublisher);
    createDesign(payload: DesignCreateInput, owner: RequestUser): Promise<unknown>;
    listDesigns(requester: RequestUser, search?: string): Promise<unknown[]>;
    getDesign(id: string, requester: RequestUser): Promise<unknown>;
    updateDesign(id: string, payload: DesignUpdateInput, requester?: RequestUser): Promise<unknown>;
    deleteDesign(id: string, requester: RequestUser): Promise<{
        id: string;
    }>;
    addComment(designId: string, payload: CommentCreateInput, requester: RequestUser): Promise<unknown>;
    listComments(designId: string, requester: RequestUser): Promise<unknown[]>;
    updateComment(designId: string, commentId: string, payload: CommentUpdateInput, requester: RequestUser): Promise<unknown>;
    requestAccess(designId: string, requester: RequestUser): Promise<{
        status: string;
    }>;
    respondToAccessRequest(designId: string, userId: string, action: 'approve' | 'deny', requester: RequestUser): Promise<unknown>;
    private isOwner;
    private claimLegacyOwnership;
    private isSharedDesign;
    private hasApprovedAccess;
    private hasPendingAccess;
    private canViewDesign;
    private canCollaborate;
    private toDesignSummary;
    private toDesignResponse;
    private computeAccessStatus;
    private serializeCollaborator;
}
//# sourceMappingURL=DesignService.d.ts.map