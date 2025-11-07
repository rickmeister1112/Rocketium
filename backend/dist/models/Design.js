"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Design = void 0;
const mongoose_1 = require("mongoose");
const DesignSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    elements: { type: mongoose_1.Schema.Types.Mixed, default: [] },
    thumbnailUrl: { type: String },
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