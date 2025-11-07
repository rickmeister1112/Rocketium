import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { IDesignService } from '../services/DesignService';
import { asyncHandler } from '../utils/asyncHandler';
import {
  commentCreateSchema,
  commentUpdateSchema,
  designCreateSchema,
  designUpdateSchema,
} from '../validators/designValidators';

export class DesignController {
  constructor(private readonly service: IDesignService) {}

  readonly createDesign = asyncHandler(async (req: Request, res: Response) => {
    const payload = designCreateSchema.parse(req.body);
    const design = await this.service.createDesign(payload);
    res.status(StatusCodes.CREATED).json({
      code: 'DESIGN_CREATED',
      message: 'Design created successfully',
      data: design,
    });
  });

  readonly listDesigns = asyncHandler(async (req: Request, res: Response) => {
    const { search } = req.query as { search?: string };
    const designs = await this.service.listDesigns(search);
    res.status(StatusCodes.OK).json({
      code: 'DESIGNS_FETCHED',
      message: 'Design list fetched successfully',
      data: designs,
    });
  });

  readonly getDesign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const design = await this.service.getDesign(id);
    res.status(StatusCodes.OK).json({
      code: 'DESIGN_FETCHED',
      message: 'Design fetched successfully',
      data: design,
    });
  });

  readonly updateDesign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const payload = designUpdateSchema.parse(req.body);
    const design = await this.service.updateDesign(id, payload);
    res.status(StatusCodes.OK).json({
      code: 'DESIGN_UPDATED',
      message: 'Design updated successfully',
      data: design,
    });
  });

  readonly deleteDesign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.service.deleteDesign(id);
    res.status(StatusCodes.OK).json({
      code: 'DESIGN_DELETED',
      message: 'Design deleted successfully',
      data: result,
    });
  });

  readonly createComment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const payload = commentCreateSchema.parse(req.body);
    const comment = await this.service.addComment(id, payload);
    res.status(StatusCodes.CREATED).json({
      code: 'COMMENT_CREATED',
      message: 'Comment added successfully',
      data: comment,
    });
  });

  readonly listComments = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const comments = await this.service.listComments(id);
    res.status(StatusCodes.OK).json({
      code: 'COMMENTS_FETCHED',
      message: 'Comments fetched successfully',
      data: comments,
    });
  });

  readonly updateComment = asyncHandler(async (req: Request, res: Response) => {
    const { id, commentId } = req.params as { id: string; commentId: string };
    const payload = commentUpdateSchema.parse(req.body);
    const comment = await this.service.updateComment(id, commentId, payload);
    res.status(StatusCodes.OK).json({
      code: 'COMMENT_UPDATED',
      message: 'Comment updated successfully',
      data: comment,
    });
  });
}

