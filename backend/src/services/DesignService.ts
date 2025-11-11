import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../utils/ApiError';
import { extractMentions } from '../utils/mentions';
import type { ICommentRepository } from '../repositories/CommentRepository';
import type { IDesignRepository } from '../repositories/DesignRepository';
import type { DesignDocument, CollaboratorSubdocument } from '../models/Design';
import type { DesignCollaborator } from '../types/design';
import type {
  CommentCreateInput,
  CommentUpdateInput,
  DesignCreateInput,
  DesignUpdateInput,
} from '../validators/designValidators';
import type { IDesignEventPublisher } from '../realtime/DesignEventPublisher';
import type { RequestUser } from '../types/user';
import { LEGACY_OWNER_ID } from '../config/constants';

export interface IDesignService {
  createDesign(payload: DesignCreateInput, owner: RequestUser): Promise<unknown>;
  listDesigns(requester: RequestUser, search?: string): Promise<unknown[]>;
  getDesign(id: string, requester: RequestUser): Promise<unknown>;
  updateDesign(id: string, payload: DesignUpdateInput, requester?: RequestUser): Promise<unknown>;
  deleteDesign(id: string, requester: RequestUser): Promise<{ id: string }>;
  addComment(designId: string, payload: CommentCreateInput, requester: RequestUser): Promise<unknown>;
  listComments(designId: string, requester: RequestUser): Promise<unknown[]>;
  updateComment(
    designId: string,
    commentId: string,
    payload: CommentUpdateInput,
    requester: RequestUser,
  ): Promise<unknown>;
  requestAccess(designId: string, requester: RequestUser): Promise<{ status: string }>;
  respondToAccessRequest(
    designId: string,
    userId: string,
    action: 'approve' | 'deny',
    requester: RequestUser,
  ): Promise<unknown>;
}

export class DesignService implements IDesignService {
  constructor(
    private readonly designs: IDesignRepository,
    private readonly comments: ICommentRepository,
    private readonly publisher: IDesignEventPublisher,
  ) {}

  async createDesign(payload: DesignCreateInput, owner: RequestUser): Promise<unknown> {
    const design = await this.designs.create({
      ...payload,
      ownerId: owner.id,
      ownerName: owner.name,
    });
    return this.toDesignResponse(design, owner);
  }

  async listDesigns(requester: RequestUser, search?: string): Promise<unknown[]> {
    const designs = await this.designs.list(search);
    return designs.map((design) => this.toDesignSummary(design, requester));
  }

  async getDesign(id: string, requester: RequestUser): Promise<unknown> {
    const design = await this.designs.findById(id);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    if (!this.canViewDesign(design, requester)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot access this design');
    }
    return this.toDesignResponse(design, requester);
  }

  async updateDesign(
    id: string,
    payload: DesignUpdateInput,
    requester?: RequestUser,
  ): Promise<unknown> {
    const design = await this.designs.findById(id);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    let mutableDesign = design;
    if (requester) {
      mutableDesign = await this.claimLegacyOwnership(design, requester);
    }
    if (requester && !this.isOwner(mutableDesign, requester)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot modify this design');
    }

    const nextPayload = { ...payload };
    if (nextPayload.ownerId && nextPayload.ownerId !== mutableDesign.ownerId) {
      nextPayload.ownerId = mutableDesign.ownerId;
    }
    if (
      requester?.name &&
      !nextPayload.ownerName &&
      mutableDesign.ownerId === requester.id
    ) {
      nextPayload.ownerName = requester.name;
    }

    const updated = await this.designs.update(id, nextPayload);
    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    this.publisher.notifyDesignUpdated(updated);
    const actor: RequestUser = requester ?? { id: updated.ownerId ?? '' };
    return this.toDesignResponse(updated, actor);
  }

  async deleteDesign(id: string, requester: RequestUser): Promise<{ id: string }> {
    const design = await this.designs.findById(id);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    const mutableDesign = await this.claimLegacyOwnership(design, requester);
    if (!this.isOwner(mutableDesign, requester)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot delete this design');
    }

    const deleted = await this.designs.delete(id);
    if (!deleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }

    await this.comments.deleteByDesign(id);
    this.publisher.notifyDesignDeleted(id);

    return { id: deleted.id.toString() };
  }

  async addComment(designId: string, payload: CommentCreateInput, requester: RequestUser): Promise<unknown> {
    const design = await this.designs.findById(designId);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    if (!this.canCollaborate(design, requester)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot comment on this design');
    }

    const authorName =
      (payload.authorName ?? requester.name ?? '').trim() || requester.name || 'Anonymous';

    const normalizedPayload: CommentCreateInput = {
      ...payload,
      authorId: requester.id,
      authorName,
    };

    const mentions = normalizedPayload.mentions?.length
      ? normalizedPayload.mentions
      : extractMentions(normalizedPayload.message);

    const comment = await this.comments.create(designId, { ...normalizedPayload, mentions });
    this.publisher.notifyCommentCreated(comment);
    return comment.toJSON();
  }

  async listComments(designId: string, requester: RequestUser): Promise<unknown[]> {
    const design = await this.designs.findById(designId);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    if (!this.canViewDesign(design, requester)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot access these comments');
    }
    const comments = await this.comments.listByDesign(designId);
    return comments.map((comment) => comment.toJSON());
  }

  async updateComment(
    designId: string,
    commentId: string,
    payload: CommentUpdateInput,
    requester: RequestUser,
  ): Promise<unknown> {
    const design = await this.designs.findById(designId);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    if (!this.canCollaborate(design, requester)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot modify this comment');
    }

    const mentions = payload.mentions?.length ? payload.mentions : extractMentions(payload.message);
    const comment = await this.comments.update(designId, commentId, { ...payload, mentions });

    if (!comment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'COMMENT_NOT_FOUND', 'Comment not found');
    }

    this.publisher.notifyCommentUpdated(comment);
    return comment.toJSON();
  }

  async requestAccess(designId: string, requester: RequestUser): Promise<{ status: string }> {
    const design = await this.designs.findById(designId);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    const mutableDesign = await this.claimLegacyOwnership(design, requester);
    if (this.isOwner(mutableDesign, requester)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ALREADY_OWNER', 'You already own this design');
    }
    if (!mutableDesign.ownerId || mutableDesign.ownerId === LEGACY_OWNER_ID) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'SHARED_DESIGN', 'This design is already shared');
    }

    const existing = mutableDesign.collaborators.find(
      (collaborator) => collaborator.userId === requester.id,
    );
    if (existing) {
      if (existing.status === 'approved') {
        return { status: 'approved' };
      }
      existing.status = 'pending';
      existing.requestedAt = new Date();
      if (requester.name) {
        existing.userName = requester.name;
      }
      delete existing.respondedAt;
    } else {
      const collaborator: CollaboratorSubdocument = {
        userId: requester.id,
        status: 'pending',
        requestedAt: new Date(),
      };
      if (requester.name) {
        collaborator.userName = requester.name;
      }
      mutableDesign.collaborators.push(collaborator);
    }

    await this.designs.save(mutableDesign);
    return { status: 'pending' };
  }

  async respondToAccessRequest(
    designId: string,
    userId: string,
    action: 'approve' | 'deny',
    requester: RequestUser,
  ): Promise<unknown> {
    const design = await this.designs.findById(designId);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    const mutableDesign = await this.claimLegacyOwnership(design, requester);
    if (!this.isOwner(mutableDesign, requester)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'Only the owner can respond to requests');
    }

    const collaborator = mutableDesign.collaborators.find((item) => item.userId === userId);
    if (!collaborator) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'REQUEST_NOT_FOUND', 'Access request not found');
    }

    collaborator.status = action === 'approve' ? 'approved' : 'denied';
    collaborator.respondedAt = new Date();

    await this.designs.save(mutableDesign);
    return this.toDesignResponse(mutableDesign, requester);
  }

  private isOwner(design: DesignDocument, requester: RequestUser): boolean {
    if (design.ownerId && design.ownerId !== LEGACY_OWNER_ID) {
      return design.ownerId === requester.id;
    }
    if (!design.ownerName || !requester.name) {
      return false;
    }
    const normalize = (value: string): string => value.trim().toLowerCase();
    return normalize(design.ownerName) === normalize(requester.name);
  }

  private async claimLegacyOwnership(
    design: DesignDocument,
    requester: RequestUser,
  ): Promise<DesignDocument> {
    if (!requester.name) {
      return design;
    }
    if (design.ownerId && design.ownerId !== LEGACY_OWNER_ID) {
      return design;
    }
    if (!design.ownerName) {
      return design;
    }
    const normalize = (value: string): string => value.trim().toLowerCase();
    if (normalize(design.ownerName) !== normalize(requester.name)) {
      return design;
    }
    if (design.ownerId === requester.id) {
      return design;
    }

    design.ownerId = requester.id;
    design.ownerName = requester.name;
    await this.designs.save(design);
    return design;
  }

  private isSharedDesign(design: DesignDocument): boolean {
    return !design.ownerId || design.ownerId === LEGACY_OWNER_ID;
  }

  private hasApprovedAccess(design: DesignDocument, requester: RequestUser): boolean {
    return design.collaborators.some(
      (collaborator) => collaborator.userId === requester.id && collaborator.status === 'approved',
    );
  }

  private hasPendingAccess(design: DesignDocument, requester: RequestUser): boolean {
    return design.collaborators.some(
      (collaborator) => collaborator.userId === requester.id && collaborator.status === 'pending',
    );
  }

  private canViewDesign(design: DesignDocument, requester: RequestUser): boolean {
    return (
      this.isOwner(design, requester) ||
      this.isSharedDesign(design) ||
      this.hasApprovedAccess(design, requester)
    );
  }

  private canCollaborate(design: DesignDocument, requester: RequestUser): boolean {
    return this.canViewDesign(design, requester);
  }

  private toDesignSummary(design: DesignDocument, requester: RequestUser): Record<string, unknown> {
    const json = design.toJSON() as Record<string, unknown>;
    const accessStatus = this.computeAccessStatus(design, requester);
    const canDelete = this.isOwner(design, requester);

    if (!this.isOwner(design, requester)) {
      delete json.collaborators;
    }

    const pendingRequests = this.isOwner(design, requester)
      ? design.collaborators
          .filter((collaborator) => collaborator.status === 'pending')
          .map((collaborator) => this.serializeCollaborator(collaborator))
      : undefined;

    return {
      ...json,
      accessStatus,
      canDelete,
      pendingRequests,
    };
  }

  private toDesignResponse(design: DesignDocument, requester: RequestUser): Record<string, unknown> {
    const json = design.toJSON() as Record<string, unknown>;
    const accessStatus = this.computeAccessStatus(design, requester);
    const canDelete = this.isOwner(design, requester);

    const pendingRequests = this.isOwner(design, requester)
      ? design.collaborators
          .filter((collaborator) => collaborator.status === 'pending')
          .map((collaborator) => this.serializeCollaborator(collaborator))
      : undefined;

    if (!this.isOwner(design, requester)) {
      delete json.collaborators;
    } else {
      json.collaborators = design.collaborators.map((collaborator) =>
        this.serializeCollaborator(collaborator),
      );
    }

    return {
      ...json,
      accessStatus,
      canDelete,
      pendingRequests,
    };
  }

  private computeAccessStatus(design: DesignDocument, requester: RequestUser): string {
    if (this.isOwner(design, requester)) {
      return 'owner';
    }
    if (this.isSharedDesign(design)) {
      return 'collaborator';
    }
    const collaborator = design.collaborators.find((item) => item.userId === requester.id);
    if (!collaborator) {
      return 'none';
    }
    if (collaborator.status === 'approved') {
      return 'collaborator';
    }
    if (collaborator.status === 'pending') {
      return 'pending';
    }
    return 'denied';
  }

  private serializeCollaborator(collaborator: CollaboratorSubdocument | DesignCollaborator): Record<string, unknown> {
    return {
      userId: collaborator.userId,
      userName: collaborator.userName,
      status: collaborator.status,
      requestedAt: collaborator.requestedAt instanceof Date
        ? collaborator.requestedAt.toISOString()
        : collaborator.requestedAt,
      respondedAt:
        collaborator.respondedAt instanceof Date
          ? collaborator.respondedAt.toISOString()
          : collaborator.respondedAt,
    };
  }
}

