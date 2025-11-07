import { z } from 'zod';

const baseElementSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['text', 'image', 'shape']),
  zIndex: z.number().int(),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
});

const textElementSchema = baseElementSchema.extend({
  type: z.literal('text'),
  text: z.string().min(1),
  fontFamily: z.string().min(1),
  fontSize: z.number().positive(),
  fontWeight: z.enum(['normal', 'bold']),
  fill: z.string().min(1),
  textAlign: z.enum(['left', 'center', 'right']),
});

const imageElementSchema = baseElementSchema.extend({
  type: z.literal('image'),
  imageUrl: z.string().url(),
  opacity: z.number().min(0).max(1),
  fit: z.enum(['contain', 'cover']),
});

const shapeElementSchema = baseElementSchema.extend({
  type: z.literal('shape'),
  shapeType: z.enum(['rect', 'circle']),
  fill: z.string().min(1),
  stroke: z.string().min(1),
  strokeWidth: z.number().min(0),
  radius: z.number().positive().optional(),
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
});

export const designUpdateSchema = designCreateSchema.partial().extend({
  name: z.string().min(1).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  elements: z.array(designElementSchema).optional(),
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

export type DesignCreateInput = z.infer<typeof designCreateSchema>;
export type DesignUpdateInput = z.infer<typeof designUpdateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;

