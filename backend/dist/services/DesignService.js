"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = require("../utils/ApiError");
const mentions_1 = require("../utils/mentions");
class DesignService {
    constructor(designs, comments, publisher) {
        this.designs = designs;
        this.comments = comments;
        this.publisher = publisher;
    }
    async createDesign(payload) {
        const design = await this.designs.create(payload);
        return design.toJSON();
    }
    async listDesigns(search) {
        const designs = await this.designs.list(search);
        return designs.map((design) => design.toJSON());
    }
    async getDesign(id) {
        const design = await this.designs.findById(id);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        return design.toJSON();
    }
    async updateDesign(id, payload) {
        const design = await this.designs.update(id, payload);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        const json = design.toJSON();
        this.publisher.notifyDesignUpdated(design);
        return json;
    }
    async addComment(designId, payload) {
        const designExists = await this.designs.exists(designId);
        if (!designExists) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        const mentions = payload.mentions?.length ? payload.mentions : (0, mentions_1.extractMentions)(payload.message);
        const comment = await this.comments.create(designId, { ...payload, mentions });
        this.publisher.notifyCommentCreated(comment);
        return comment.toJSON();
    }
    async listComments(designId) {
        const designExists = await this.designs.exists(designId);
        if (!designExists) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        const comments = await this.comments.listByDesign(designId);
        return comments.map((comment) => comment.toJSON());
    }
    async updateComment(designId, commentId, payload) {
        const designExists = await this.designs.exists(designId);
        if (!designExists) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        const mentions = payload.mentions?.length ? payload.mentions : (0, mentions_1.extractMentions)(payload.message);
        const comment = await this.comments.update(designId, commentId, { ...payload, mentions });
        if (!comment) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'COMMENT_NOT_FOUND', 'Comment not found');
        }
        this.publisher.notifyCommentUpdated(comment);
        return comment.toJSON();
    }
}
exports.DesignService = DesignService;
//# sourceMappingURL=DesignService.js.map