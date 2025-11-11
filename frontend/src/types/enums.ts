export const ELEMENT_TYPES = ['text', 'image', 'shape'] as const;
export type ElementType = (typeof ELEMENT_TYPES)[number];

export const FONT_WEIGHTS = ['normal', 'bold'] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

export const TEXT_ALIGNMENTS = ['left', 'center', 'right'] as const;
export type TextAlignment = (typeof TEXT_ALIGNMENTS)[number];

export const SHAPE_TYPES = ['rect', 'circle'] as const;
export type ShapeType = (typeof SHAPE_TYPES)[number];

export const IMAGE_FIT_MODES = ['contain', 'cover'] as const;
export type ImageFitMode = (typeof IMAGE_FIT_MODES)[number];

