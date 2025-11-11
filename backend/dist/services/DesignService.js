"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = require("../utils/ApiError");
const mentions_1 = require("../utils/mentions");
const constants_1 = require("../config/constants");
class DesignService {
    constructor(designs, comments, publisher) {
        this.designs = designs;
        this.comments = comments;
        this.publisher = publisher;
    }
    async createDesign(payload, owner) {
        const design = await this.designs.create({
            ...payload,
            ownerId: owner.id,
            ownerName: owner.name,
        });
        return this.toDesignResponse(design, owner);
    }
    async listDesigns(requester, search) {
        const designs = await this.designs.list(search);
        return designs.map((design) => this.toDesignSummary(design, requester));
    }
    async getDesign(id, requester) {
        const design = await this.designs.findById(id);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        if (!this.canViewDesign(design, requester)) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot access this design');
        }
        return this.toDesignResponse(design, requester);
    }
    async updateDesign(id, payload, requester) {
        const design = await this.designs.findById(id);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        let mutableDesign = design;
        if (requester) {
            mutableDesign = await this.claimLegacyOwnership(design, requester);
        }
        if (requester && !this.isOwner(mutableDesign, requester)) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot modify this design');
        }
        const nextPayload = { ...payload };
        if (nextPayload.ownerId && nextPayload.ownerId !== mutableDesign.ownerId) {
            nextPayload.ownerId = mutableDesign.ownerId;
        }
        if (requester?.name &&
            !nextPayload.ownerName &&
            mutableDesign.ownerId === requester.id) {
            nextPayload.ownerName = requester.name;
        }
        const updated = await this.designs.update(id, nextPayload);
        if (!updated) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        this.publisher.notifyDesignUpdated(updated);
        const actor = requester ?? { id: updated.ownerId ?? '' };
        return this.toDesignResponse(updated, actor);
    }
    async deleteDesign(id, requester) {
        const design = await this.designs.findById(id);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        const mutableDesign = await this.claimLegacyOwnership(design, requester);
        if (!this.isOwner(mutableDesign, requester)) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot delete this design');
        }
        const deleted = await this.designs.delete(id);
        if (!deleted) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        await this.comments.deleteByDesign(id);
        this.publisher.notifyDesignDeleted(id);
        return { id: deleted.id.toString() };
    }
    async addComment(designId, payload, requester) {
        const design = await this.designs.findById(designId);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        if (!this.canCollaborate(design, requester)) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot comment on this design');
        }
        const authorName = (payload.authorName ?? requester.name ?? '').trim() || requester.name || 'Anonymous';
        const normalizedPayload = {
            ...payload,
            authorId: requester.id,
            authorName,
        };
        const mentions = normalizedPayload.mentions?.length
            ? normalizedPayload.mentions
            : (0, mentions_1.extractMentions)(normalizedPayload.message);
        const comment = await this.comments.create(designId, { ...normalizedPayload, mentions });
        this.publisher.notifyCommentCreated(comment);
        return comment.toJSON();
    }
    async listComments(designId, requester) {
        const design = await this.designs.findById(designId);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        if (!this.canViewDesign(design, requester)) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot access these comments');
        }
        const comments = await this.comments.listByDesign(designId);
        return comments.map((comment) => comment.toJSON());
    }
    async updateComment(designId, commentId, payload, requester) {
        const design = await this.designs.findById(designId);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        if (!this.canCollaborate(design, requester)) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, 'FORBIDDEN', 'You cannot modify this comment');
        }
        const mentions = payload.mentions?.length ? payload.mentions : (0, mentions_1.extractMentions)(payload.message);
        const comment = await this.comments.update(designId, commentId, { ...payload, mentions });
        if (!comment) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'COMMENT_NOT_FOUND', 'Comment not found');
        }
        this.publisher.notifyCommentUpdated(comment);
        return comment.toJSON();
    }
    async requestAccess(designId, requester) {
        const design = await this.designs.findById(designId);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        const mutableDesign = await this.claimLegacyOwnership(design, requester);
        if (this.isOwner(mutableDesign, requester)) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'ALREADY_OWNER', 'You already own this design');
        }
        if (!mutableDesign.ownerId || mutableDesign.ownerId === constants_1.LEGACY_OWNER_ID) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'SHARED_DESIGN', 'This design is already shared');
        }
        const existing = mutableDesign.collaborators.find((collaborator) => collaborator.userId === requester.id);
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
        }
        else {
            const collaborator = {
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
    async respondToAccessRequest(designId, userId, action, requester) {
        const design = await this.designs.findById(designId);
        if (!design) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'DESIGN_NOT_FOUND', 'Design not found');
        }
        const mutableDesign = await this.claimLegacyOwnership(design, requester);
        if (!this.isOwner(mutableDesign, requester)) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.FORBIDDEN, 'FORBIDDEN', 'Only the owner can respond to requests');
        }
        const collaborator = mutableDesign.collaborators.find((item) => item.userId === userId);
        if (!collaborator) {
            throw new ApiError_1.ApiError(http_status_codes_1.StatusCodes.NOT_FOUND, 'REQUEST_NOT_FOUND', 'Access request not found');
        }
        collaborator.status = action === 'approve' ? 'approved' : 'denied';
        collaborator.respondedAt = new Date();
        await this.designs.save(mutableDesign);
        return this.toDesignResponse(mutableDesign, requester);
    }
    isOwner(design, requester) {
        if (design.ownerId && design.ownerId !== constants_1.LEGACY_OWNER_ID) {
            return design.ownerId === requester.id;
        }
        if (!design.ownerName || !requester.name) {
            return false;
        }
        const normalize = (value) => value.trim().toLowerCase();
        return normalize(design.ownerName) === normalize(requester.name);
    }
    async claimLegacyOwnership(design, requester) {
        if (!requester.name) {
            return design;
        }
        if (design.ownerId && design.ownerId !== constants_1.LEGACY_OWNER_ID) {
            return design;
        }
        if (!design.ownerName) {
            return design;
        }
        const normalize = (value) => value.trim().toLowerCase();
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
    isSharedDesign(design) {
        return !design.ownerId || design.ownerId === constants_1.LEGACY_OWNER_ID;
    }
    hasApprovedAccess(design, requester) {
        return design.collaborators.some((collaborator) => collaborator.userId === requester.id && collaborator.status === 'approved');
    }
    hasPendingAccess(design, requester) {
        return design.collaborators.some((collaborator) => collaborator.userId === requester.id && collaborator.status === 'pending');
    }
    canViewDesign(design, requester) {
        return (this.isOwner(design, requester) ||
            this.isSharedDesign(design) ||
            this.hasApprovedAccess(design, requester));
    }
    canCollaborate(design, requester) {
        return this.canViewDesign(design, requester);
    }
    toDesignSummary(design, requester) {
        const json = design.toJSON();
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
    toDesignResponse(design, requester) {
        const json = design.toJSON();
        const accessStatus = this.computeAccessStatus(design, requester);
        const canDelete = this.isOwner(design, requester);
        const pendingRequests = this.isOwner(design, requester)
            ? design.collaborators
                .filter((collaborator) => collaborator.status === 'pending')
                .map((collaborator) => this.serializeCollaborator(collaborator))
            : undefined;
        if (!this.isOwner(design, requester)) {
            delete json.collaborators;
        }
        else {
            json.collaborators = design.collaborators.map((collaborator) => this.serializeCollaborator(collaborator));
        }
        return {
            ...json,
            accessStatus,
            canDelete,
            pendingRequests,
        };
    }
    computeAccessStatus(design, requester) {
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
    serializeCollaborator(collaborator) {
        return {
            userId: collaborator.userId,
            userName: collaborator.userName,
            status: collaborator.status,
            requestedAt: collaborator.requestedAt instanceof Date
                ? collaborator.requestedAt.toISOString()
                : collaborator.requestedAt,
            respondedAt: collaborator.respondedAt instanceof Date
                ? collaborator.respondedAt.toISOString()
                : collaborator.respondedAt,
        };
    }
}
exports.DesignService = DesignService;
//# sourceMappingURL=DesignService.js.map