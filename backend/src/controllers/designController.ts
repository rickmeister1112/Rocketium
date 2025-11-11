import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { IDesignService } from '../services/DesignService';
import { asyncHandler } from '../utils/asyncHandler';
import {
  commentCreateSchema,
  commentUpdateSchema,
  designCreateSchema,
  designUpdateSchema,
  designAccessRespondSchema,
} from '../validators/designValidators';
import { ApiError } from '../utils/ApiError';

export class DesignController {
  constructor(private readonly service: IDesignService) {}

  readonly createDesign = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing design creator context');
    }
    const payload = designCreateSchema.parse(req.body);
    const sanitized = {
      ...payload,
      ownerId: user.id,
      ownerName: payload.ownerName ?? user.name,
    };
    const design = await this.service.createDesign(sanitized, user);
    res.status(StatusCodes.CREATED).json({
      code: 'DESIGN_CREATED',
      message: 'Design created successfully',
      data: design,
    });
  });

  readonly listDesigns = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
    }
    const { search } = req.query as { search?: string };
    const designs = await this.service.listDesigns(user, search);
    res.status(StatusCodes.OK).json({
      code: 'DESIGNS_FETCHED',
      message: 'Design list fetched successfully',
      data: designs,
    });
  });

  readonly getDesign = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id } = req.params as { id: string };
    const design = await this.service.getDesign(id, user);
    res.status(StatusCodes.OK).json({
      code: 'DESIGN_FETCHED',
      message: 'Design fetched successfully',
      data: design,
    });
  });

  readonly updateDesign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const payload = designUpdateSchema.parse(req.body);
    const user = req.user ?? undefined;
    const sanitized = { ...payload };
    if (sanitized.ownerId && sanitized.ownerId !== user?.id) {
      delete sanitized.ownerId;
    }
    const design = await this.service.updateDesign(id, sanitized, user);
    res.status(StatusCodes.OK).json({
      code: 'DESIGN_UPDATED',
      message: 'Design updated successfully',
      data: design,
    });
  });

  readonly deleteDesign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing design owner context');
    }
    const result = await this.service.deleteDesign(id, user);
    res.status(StatusCodes.OK).json({
      code: 'DESIGN_DELETED',
      message: 'Design deleted successfully',
      data: result,
    });
  });

  readonly requestAccess = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing requester context');
    }
    const result = await this.service.requestAccess(id, user);
    res.status(StatusCodes.OK).json({
      code: 'ACCESS_REQUESTED',
      message: 'Access request submitted',
      data: result,
    });
  });

  readonly respondToAccessRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id, userId } = req.params as { id: string; userId: string };
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing owner context');
    }
    const { action } = designAccessRespondSchema.parse(req.body);
    const result = await this.service.respondToAccessRequest(id, userId, action, user);
    res.status(StatusCodes.OK).json({
      code: 'ACCESS_REQUEST_UPDATED',
      message: `Access request ${action === 'approve' ? 'approved' : 'denied'}`,
      data: result,
    });
  });

  readonly createComment = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing comment author context');
    }
    const { id } = req.params as { id: string };
    const payload = commentCreateSchema.parse(req.body);
    const fallbackName = (payload.authorName ?? user.name ?? '').trim() || user.name || 'Anonymous';
    const comment = await this.service.addComment(id, {
      ...payload,
      authorId: user.id,
      authorName: fallbackName,
    }, user);
    res.status(StatusCodes.CREATED).json({
      code: 'COMMENT_CREATED',
      message: 'Comment added successfully',
      data: comment,
    });
  });

  readonly listComments = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id } = req.params as { id: string };
    const comments = await this.service.listComments(id, user);
    res.status(StatusCodes.OK).json({
      code: 'COMMENTS_FETCHED',
      message: 'Comments fetched successfully',
      data: comments,
    });
  });

  readonly updateComment = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
    }
    const { id, commentId } = req.params as { id: string; commentId: string };
    const payload = commentUpdateSchema.parse(req.body);
    const comment = await this.service.updateComment(id, commentId, payload, user);
    res.status(StatusCodes.OK).json({
      code: 'COMMENT_UPDATED',
      message: 'Comment updated successfully',
      data: comment,
    });
  });
}

