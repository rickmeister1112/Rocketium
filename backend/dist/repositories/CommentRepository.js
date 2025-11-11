"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoCommentRepository = void 0;
const mongoose_1 = require("mongoose");
const Comment_1 = require("../models/Comment");
class MongoCommentRepository {
    async create(designId, payload) {
        return Comment_1.Comment.create({
            designId: new mongoose_1.Types.ObjectId(designId),
            ...payload,
        });
    }
    async listByDesign(designId) {
        return Comment_1.Comment.find({ designId: new mongoose_1.Types.ObjectId(designId) }).sort({ createdAt: 1 }).exec();
    }
    async update(designId, commentId, payload) {
        return Comment_1.Comment.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(commentId), designId: new mongoose_1.Types.ObjectId(designId) }, { $set: { ...payload, updatedAt: new Date() } }, { new: true }).exec();
    }
    async deleteByDesign(designId) {
        if (!mongoose_1.Types.ObjectId.isValid(designId)) {
            return 0;
        }
        const result = await Comment_1.Comment.deleteMany({ designId: new mongoose_1.Types.ObjectId(designId) }).exec();
        return result?.deletedCount ?? 0;
    }
}
exports.MongoCommentRepository = MongoCommentRepository;
//# sourceMappingURL=CommentRepository.js.map