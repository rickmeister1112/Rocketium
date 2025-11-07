"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignController = void 0;
const http_status_codes_1 = require("http-status-codes");
const asyncHandler_1 = require("../utils/asyncHandler");
const designValidators_1 = require("../validators/designValidators");
class DesignController {
    constructor(service) {
        this.service = service;
        this.createDesign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const payload = designValidators_1.designCreateSchema.parse(req.body);
            const design = await this.service.createDesign(payload);
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                code: 'DESIGN_CREATED',
                message: 'Design created successfully',
                data: design,
            });
        });
        this.listDesigns = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { search } = req.query;
            const designs = await this.service.listDesigns(search);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'DESIGNS_FETCHED',
                message: 'Design list fetched successfully',
                data: designs,
            });
        });
        this.getDesign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const design = await this.service.getDesign(id);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'DESIGN_FETCHED',
                message: 'Design fetched successfully',
                data: design,
            });
        });
        this.updateDesign = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const payload = designValidators_1.designUpdateSchema.parse(req.body);
            const design = await this.service.updateDesign(id, payload);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'DESIGN_UPDATED',
                message: 'Design updated successfully',
                data: design,
            });
        });
        this.createComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const payload = designValidators_1.commentCreateSchema.parse(req.body);
            const comment = await this.service.addComment(id, payload);
            res.status(http_status_codes_1.StatusCodes.CREATED).json({
                code: 'COMMENT_CREATED',
                message: 'Comment added successfully',
                data: comment,
            });
        });
        this.listComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const comments = await this.service.listComments(id);
            res.status(http_status_codes_1.StatusCodes.OK).json({
                code: 'COMMENTS_FETCHED',
                message: 'Comments fetched successfully',
                data: comments,
            });
        });
        this.updateComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id, commentId } = req.params;
            const payload = designValidators_1.commentUpdateSchema.parse(req.body);
            const comment = await this.service.updateComment(id, commentId, payload);
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