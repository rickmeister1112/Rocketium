"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    designId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Design', required: true },
    authorId: { type: String },
    authorName: { type: String, required: true },
    message: { type: String, required: true },
    mentions: { type: [String], default: [] },
    x: { type: Number },
    y: { type: Number },
}, {
    timestamps: true,
});
CommentSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (_doc, ret) => {
        if (ret._id) {
            ret.id = ret._id.toString();
        }
        if (ret.designId instanceof mongoose_1.Types.ObjectId) {
            ret.designId = ret.designId.toString();
        }
        delete ret._id;
        if (ret.__v !== undefined) {
            delete ret.__v;
        }
        return ret;
    },
});
exports.Comment = (0, mongoose_1.model)('Comment', CommentSchema);
//# sourceMappingURL=Comment.js.map