import { z } from 'zod';

import {
  DESIGN_ELEMENT_TYPES,
  FONT_WEIGHTS,
  IMAGE_FIT_MODES,
  SHAPE_TYPES,
  TEXT_ALIGNMENTS,
} from '../types/enums';

const baseElementSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(DESIGN_ELEMENT_TYPES),
  zIndex: z.number().int(),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  opacity: z.number().min(0).max(1).default(1),
});

const textElementSchema = baseElementSchema.extend({
  type: z.literal('text'),
  text: z.string().min(1),
  fontFamily: z.string().min(1),
  fontSize: z.number().positive(),
  fontWeight: z.enum(FONT_WEIGHTS),
  fill: z.string().min(1),
  textAlign: z.enum(TEXT_ALIGNMENTS),
});

const imageElementSchema = baseElementSchema.extend({
  type: z.literal('image'),
  url: z
    .string()
    .min(1)
    .refine(
      (value) => value.startsWith('data:') || /^[a-z]+:\/\//i.test(value),
      { message: 'Image URL must be a data URI or an absolute URL' },
    ),
  fit: z.enum(IMAGE_FIT_MODES),
});

const shapeElementSchema = baseElementSchema.extend({
  type: z.literal('shape'),
  shapeType: z.enum(SHAPE_TYPES),
  fill: z.string().min(1),
  stroke: z.string().min(1),
  strokeWidth: z.number().min(0),
  cornerRadius: z.number().min(0).optional(),
});

export const designElementSchema = z.discriminatedUnion('type', [
  textElementSchema,
  imageElementSchema,
  shapeElementSchema,
]);

export const designCreateSchema = z.object({
  name: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  elements: z.array(designElementSchema).default([]),
  thumbnailUrl: z.string().url().optional(),
  ownerId: z.string().min(1).optional(),
  ownerName: z.string().min(1).optional(),
});

export const designUpdateSchema = designCreateSchema.partial().extend({
  name: z.string().min(1).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  elements: z.array(designElementSchema).optional(),
  ownerId: z.string().min(1).optional(),
  ownerName: z.string().min(1).optional(),
});

export const commentCreateSchema = z.object({
  authorName: z.string().min(1),
  authorId: z.string().optional(),
  message: z.string().min(1),
  mentions: z.array(z.string()).default([]),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const commentUpdateSchema = z.object({
  message: z.string().min(1),
  mentions: z.array(z.string()).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const designAccessRespondSchema = z.object({
  action: z.enum(['approve', 'deny']),
});

export type DesignCreateInput = z.infer<typeof designCreateSchema>;
export type DesignUpdateInput = z.infer<typeof designUpdateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;

