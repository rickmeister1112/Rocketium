"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentUpdateSchema = exports.commentCreateSchema = exports.designUpdateSchema = exports.designCreateSchema = exports.designElementSchema = void 0;
const zod_1 = require("zod");
const baseElementSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(['text', 'image', 'shape']),
    zIndex: zod_1.z.number().int(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    rotation: zod_1.z.number(),
    width: zod_1.z.number().nonnegative(),
    height: zod_1.z.number().nonnegative(),
});
const textElementSchema = baseElementSchema.extend({
    type: zod_1.z.literal('text'),
    text: zod_1.z.string().min(1),
    fontFamily: zod_1.z.string().min(1),
    fontSize: zod_1.z.number().positive(),
    fontWeight: zod_1.z.enum(['normal', 'bold']),
    fill: zod_1.z.string().min(1),
    textAlign: zod_1.z.enum(['left', 'center', 'right']),
});
const imageElementSchema = baseElementSchema.extend({
    type: zod_1.z.literal('image'),
    imageUrl: zod_1.z.string().url(),
    opacity: zod_1.z.number().min(0).max(1),
    fit: zod_1.z.enum(['contain', 'cover']),
});
const shapeElementSchema = baseElementSchema.extend({
    type: zod_1.z.literal('shape'),
    shapeType: zod_1.z.enum(['rect', 'circle']),
    fill: zod_1.z.string().min(1),
    stroke: zod_1.z.string().min(1),
    strokeWidth: zod_1.z.number().min(0),
    radius: zod_1.z.number().positive().optional(),
});
exports.designElementSchema = zod_1.z.discriminatedUnion('type', [
    textElementSchema,
    imageElementSchema,
    shapeElementSchema,
]);
exports.designCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    width: zod_1.z.number().positive(),
    height: zod_1.z.number().positive(),
    elements: zod_1.z.array(exports.designElementSchema).default([]),
    thumbnailUrl: zod_1.z.string().url().optional(),
});
exports.designUpdateSchema = exports.designCreateSchema.partial().extend({
    name: zod_1.z.string().min(1).optional(),
    width: zod_1.z.number().positive().optional(),
    height: zod_1.z.number().positive().optional(),
    elements: zod_1.z.array(exports.designElementSchema).optional(),
});
exports.commentCreateSchema = zod_1.z.object({
    authorName: zod_1.z.string().min(1),
    authorId: zod_1.z.string().optional(),
    message: zod_1.z.string().min(1),
    mentions: zod_1.z.array(zod_1.z.string()).default([]),
    x: zod_1.z.number().optional(),
    y: zod_1.z.number().optional(),
});
exports.commentUpdateSchema = zod_1.z.object({
    message: zod_1.z.string().min(1),
    mentions: zod_1.z.array(zod_1.z.string()).optional(),
    x: zod_1.z.number().optional(),
    y: zod_1.z.number().optional(),
});
//# sourceMappingURL=designValidators.js.map