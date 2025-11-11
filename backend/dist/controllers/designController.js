"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignController = void 0;
const http_status_codes_1 = require("http-status-codes");
const asyncHandler_1 = require("../utils/asyncHandler");
const designValidators_1 = require("../validators/designValidators");
const ApiError_1 = require("../utils/ApiError");
class DesignController {
    constructor(service) {
        this.service = service;
        this.createDesign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing design creator context');
            }
            const payload = designValidators_1.designCreateSchema.parse(req.body);
            const sanitized = {
                ...payload,
                ownerId: user.id,
                ownerName: payload.ownerName ?? user.name,
            };
            const design = await this.service.createDesign(sanitized, user);
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                code: 'DESIGN_CREATED',
                message: 'Design created successfully',
                data: design,
            });
        });
        this.listDesigns = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
            }
            const { search } = req.query;
            const designs = await this.service.listDesigns(user, search);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'DESIGNS_FETCHED',
                message: 'Design list fetched successfully',
                data: designs,
            });
        });
        this.getDesign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
            }
            const { id } = req.params;
            const design = await this.service.getDesign(id, user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'DESIGN_FETCHED',
                message: 'Design fetched successfully',
                data: design,
            });
        });
        this.updateDesign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const payload = designValidators_1.designUpdateSchema.parse(req.body);
            const user = req.user ?? undefined;
            const sanitized = { ...payload };
            if (sanitized.ownerId && sanitized.ownerId !== user?.id) {
                delete sanitized.ownerId;
            }
            const design = await this.service.updateDesign(id, sanitized, user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'DESIGN_UPDATED',
                message: 'Design updated successfully',
                data: design,
            });
        });
        this.deleteDesign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing design owner context');
            }
            const result = await this.service.deleteDesign(id, user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'DESIGN_DELETED',
                message: 'Design deleted successfully',
                data: result,
            });
        });
        this.requestAccess = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing requester context');
            }
            const result = await this.service.requestAccess(id, user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'ACCESS_REQUESTED',
                message: 'Access request submitted',
                data: result,
            });
        });
        this.respondToAccessRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id, userId } = req.params;
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing owner context');
            }
            const { action } = designValidators_1.designAccessRespondSchema.parse(req.body);
            const result = await this.service.respondToAccessRequest(id, userId, action, user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'ACCESS_REQUEST_UPDATED',
                message: `Access request ${action === 'approve' ? 'approved' : 'denied'}`,
                data: result,
            });
        });
        this.createComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing comment author context');
            }
            const { id } = req.params;
            const payload = designValidators_1.commentCreateSchema.parse(req.body);
            const fallbackName = (payload.authorName ?? user.name ?? '').trim() || user.name || 'Anonymous';
            const comment = await this.service.addComment(id, {
                ...payload,
                authorId: user.id,
                authorName: fallbackName,
            }, user);
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                code: 'COMMENT_CREATED',
                message: 'Comment added successfully',
                data: comment,
            });
        });
        this.listComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
            }
            const { id } = req.params;
            const comments = await this.service.listComments(id, user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'COMMENTS_FETCHED',
                message: 'Comments fetched successfully',
                data: comments,
            });
        });
        this.updateComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req.user;
            if (!user) {
                throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing user context');
            }
            const { id, commentId } = req.params;
            const payload = designValidators_1.commentUpdateSchema.parse(req.body);
            const comment = await this.service.updateComment(id, commentId, payload, user);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'COMMENT_UPDATED',
                message: 'Comment updated successfully',
                data: comment,
            });
        });
    }
}
exports.DesignController = DesignController;
//# sourceMappingURL=designController.js.map