"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Design = void 0;
const mongoose_1 = require("mongoose");
const CollaboratorSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    userName: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending', required: true },
    requestedAt: { type: Date, default: () => new Date(), required: true },
    respondedAt: { type: Date },
}, { _id: false });
const DesignSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    ownerId: { type: String, required: false },
    ownerName: { type: String, required: false },
    elements: { type: mongoose_1.Schema.Types.Mixed, default: [] },
    thumbnailUrl: { type: String },
    collaborators: { type: [CollaboratorSchema], default: [] },
}, {
    timestamps: true,
});
DesignSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (_doc, ret) => {
        if (ret._id) {
            ret.id = ret._id.toString();
        }
        delete ret._id;
        if (ret.__v !== undefined) {
            delete ret.__v;
        }
        return ret;
    },
});
exports.Design = (0, mongoose_1.model)('Design', DesignSchema);
//# sourceMappingURL=Design.js.map