"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.designAccessRespondSchema = exports.commentUpdateSchema = exports.commentCreateSchema = exports.designUpdateSchema = exports.designCreateSchema = exports.designElementSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
const baseElementSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(enums_1.DESIGN_ELEMENT_TYPES),
    zIndex: zod_1.z.number().int(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    rotation: zod_1.z.number(),
    width: zod_1.z.number().nonnegative(),
    height: zod_1.z.number().nonnegative(),
    opacity: zod_1.z.number().min(0).max(1).default(1),
});
const textElementSchema = baseElementSchema.extend({
    type: zod_1.z.literal('text'),
    text: zod_1.z.string().min(1),
    fontFamily: zod_1.z.string().min(1),
    fontSize: zod_1.z.number().positive(),
    fontWeight: zod_1.z.enum(enums_1.FONT_WEIGHTS),
    fill: zod_1.z.string().min(1),
    textAlign: zod_1.z.enum(enums_1.TEXT_ALIGNMENTS),
});
const imageElementSchema = baseElementSchema.extend({
    type: zod_1.z.literal('image'),
    url: zod_1.z
        .string()
        .min(1)
        .refine((value) => value.startsWith('data:') || /^[a-z]+:\/\//i.test(value), { message: 'Image URL must be a data URI or an absolute URL' }),
    fit: zod_1.z.enum(enums_1.IMAGE_FIT_MODES),
});
const shapeElementSchema = baseElementSchema.extend({
    type: zod_1.z.literal('shape'),
    shapeType: zod_1.z.enum(enums_1.SHAPE_TYPES),
    fill: zod_1.z.string().min(1),
    stroke: zod_1.z.string().min(1),
    strokeWidth: zod_1.z.number().min(0),
    cornerRadius: zod_1.z.number().min(0).optional(),
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
    ownerId: zod_1.z.string().min(1).optional(),
    ownerName: zod_1.z.string().min(1).optional(),
});
exports.designUpdateSchema = exports.designCreateSchema.partial().extend({
    name: zod_1.z.string().min(1).optional(),
    width: zod_1.z.number().positive().optional(),
    height: zod_1.z.number().positive().optional(),
    elements: zod_1.z.array(exports.designElementSchema).optional(),
    ownerId: zod_1.z.string().min(1).optional(),
    ownerName: zod_1.z.string().min(1).optional(),
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
exports.designAccessRespondSchema = zod_1.z.object({
    action: zod_1.z.enum(['approve', 'deny']),
});
//# sourceMappingURL=designValidators.js.map