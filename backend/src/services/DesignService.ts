import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../utils/ApiError';
import { extractMentions } from '../utils/mentions';
import type { ICommentRepository } from '../repositories/CommentRepository';
import type { IDesignRepository } from '../repositories/DesignRepository';
import type {
  CommentCreateInput,
  CommentUpdateInput,
  DesignCreateInput,
  DesignUpdateInput,
} from '../validators/designValidators';
import type { IDesignEventPublisher } from '../realtime/DesignEventPublisher';

export interface IDesignService {
  createDesign(payload: DesignCreateInput): Promise<unknown>;
  listDesigns(search?: string): Promise<unknown[]>;
  getDesign(id: string): Promise<unknown>;
  updateDesign(id: string, payload: DesignUpdateInput): Promise<unknown>;
  deleteDesign(id: string): Promise<{ id: string }>;
  addComment(designId: string, payload: CommentCreateInput): Promise<unknown>;
  listComments(designId: string): Promise<unknown[]>;
  updateComment(designId: string, commentId: string, payload: CommentUpdateInput): Promise<unknown>;
}

export class DesignService implements IDesignService {
  constructor(
    private readonly designs: IDesignRepository,
    private readonly comments: ICommentRepository,
    private readonly publisher: IDesignEventPublisher,
  ) {}

  async createDesign(payload: DesignCreateInput): Promise<unknown> {
    const design = await this.designs.create(payload);
    return design.toJSON();
  }

  async listDesigns(search?: string): Promise<unknown[]> {
    const designs = await this.designs.list(search);
    return designs.map((design) => design.toJSON());
  }

  async getDesign(id: string): Promise<unknown> {
    const design = await this.designs.findById(id);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    return design.toJSON();
  }

  async updateDesign(id: string, payload: DesignUpdateInput): Promise<unknown> {
    const design = await this.designs.update(id, payload);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    const json = design.toJSON();
    this.publisher.notifyDesignUpdated(design);
    return json;
  }

  async deleteDesign(id: string): Promise<{ id: string }> {
    const design = await this.designs.delete(id);
    if (!design) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }

    await this.comments.deleteByDesign(id);
    this.publisher.notifyDesignDeleted(id);

    return { id: design.id.toString() };
  }

  async addComment(designId: string, payload: CommentCreateInput): Promise<unknown> {
    const designExists = await this.designs.exists(designId);
    if (!designExists) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }

    const mentions = payload.mentions?.length ? payload.mentions : extractMentions(payload.message);
    const comment = await this.comments.create(designId, { ...payload, mentions });
    this.publisher.notifyCommentCreated(comment);
    return comment.toJSON();
  }

  async listComments(designId: string): Promise<unknown[]> {
    const designExists = await this.designs.exists(designId);
    if (!designExists) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }
    const comments = await this.comments.listByDesign(designId);
    return comments.map((comment) => comment.toJSON());
  }

  async updateComment(designId: string, commentId: string, payload: CommentUpdateInput): Promise<unknown> {
    const designExists = await this.designs.exists(designId);
    if (!designExists) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
    }

    const mentions = payload.mentions?.length ? payload.mentions : extractMentions(payload.message);
    const comment = await this.comments.update(designId, commentId, { ...payload, mentions });

    if (!comment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'COMMENT_NOT_FOUND', 'Comment not found');
    }

    this.publisher.notifyCommentUpdated(comment);
    return comment.toJSON();
  }
}

