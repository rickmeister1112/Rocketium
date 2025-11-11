import { nanoid } from 'nanoid';

import type { DesignElement, ImageElement, ShapeElement, TextElement } from '../types/design';

const mergeWithDefaults = <T extends DesignElement>(
  defaults: Omit<T, 'id'>,
  raw: T,
): T => ({
  ...defaults,
  ...raw,
  id: raw.id,
});

const TEXT_ELEMENT_DEFAULTS: Omit<TextElement, 'id'> = {
  type: 'text',
  name: 'Text',
  text: 'New text',
  fontFamily: 'Inter',
  fontSize: 48,
  fontWeight: 'normal',
  fill: '#111827',
  textAlign: 'left',
  x: 200,
  y: 200,
  width: 400,
  height: 80,
  rotation: 0,
  zIndex: 0,
  opacity: 1,
};

const BASE_SHAPE_DEFAULTS: Omit<ShapeElement, 'id'> = {
  type: 'shape',
  name: 'Shape',
  shapeType: 'rect',
  fill: '#3b82f6',
  stroke: '#1d4ed8',
  strokeWidth: 0,
  cornerRadius: 0,
  x: 250,
  y: 250,
  width: 300,
  height: 200,
  rotation: 0,
  zIndex: 0,
  opacity: 1,
};

const makeShapeDefaults = (overrides: Partial<Omit<ShapeElement, 'id'>>): Omit<ShapeElement, 'id'> => ({
  ...BASE_SHAPE_DEFAULTS,
  ...overrides,
  type: 'shape',
});

const RECT_ELEMENT_DEFAULTS = makeShapeDefaults({
  name: 'Rectangle',
  shapeType: 'rect',
});

const CIRCLE_ELEMENT_DEFAULTS = makeShapeDefaults({
  name: 'Circle',
  shapeType: 'circle',
  fill: '#10b981',
  stroke: '#047857',
  x: 300,
  y: 300,
  width: 200,
  height: 200,
});

const IMAGE_ELEMENT_DEFAULTS: Omit<ImageElement, 'id'> = {
  type: 'image',
  name: 'Image',
  url: 'data:,',
  fit: 'contain',
  x: 200,
  y: 200,
  width: 400,
  height: 300,
  rotation: 0,
  zIndex: 0,
  opacity: 1,
};

export const cloneElements = (elements: DesignElement[]): DesignElement[] =>
  elements.map((el) => ({ ...el }));

export const normalizeZIndices = (elements: DesignElement[]): DesignElement[] =>
  elements.map((element, index) => ({ ...element, zIndex: index }));

export const findElementIndex = (elements: DesignElement[], id: string): number =>
  elements.findIndex((element) => element.id === id);

export const withElementDefaults = (raw: DesignElement): DesignElement => {
  if (raw.type === 'text') {
    return mergeWithDefaults(TEXT_ELEMENT_DEFAULTS, raw);
  }

  if (raw.type === 'shape') {
    const defaults = raw.shapeType === 'circle' ? CIRCLE_ELEMENT_DEFAULTS : RECT_ELEMENT_DEFAULTS;
    return mergeWithDefaults(defaults, raw);
  }

  const imageElement = raw as ImageElement;
  return mergeWithDefaults(
    {
      ...IMAGE_ELEMENT_DEFAULTS,
      url:
        imageElement.url ??
        (imageElement as unknown as { imageUrl?: string }).imageUrl ??
        IMAGE_ELEMENT_DEFAULTS.url,
    },
    imageElement,
  );
};

export const createTextElement = (overrides: Partial<TextElement> = {}): TextElement => ({
  id: overrides.id ?? nanoid(),
  ...TEXT_ELEMENT_DEFAULTS,
  ...overrides,
  type: 'text',
});

export const createRectElement = (overrides: Partial<ShapeElement> = {}): ShapeElement => ({
  id: overrides.id ?? nanoid(),
  ...RECT_ELEMENT_DEFAULTS,
  ...overrides,
  type: 'shape',
  shapeType: 'rect',
});

export const createCircleElement = (overrides: Partial<ShapeElement> = {}): ShapeElement => ({
  id: overrides.id ?? nanoid(),
  ...CIRCLE_ELEMENT_DEFAULTS,
  ...overrides,
  type: 'shape',
  shapeType: 'circle',
});

