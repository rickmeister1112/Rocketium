import { nanoid } from 'nanoid';

import type { DesignElement, ShapeElement, TextElement } from '../types/design';

export const cloneElements = (elements: DesignElement[]): DesignElement[] =>
  elements.map((el) => ({ ...el }));

export const normalizeZIndices = (elements: DesignElement[]): DesignElement[] =>
  elements.map((element, index) => ({ ...element, zIndex: index }));

export const findElementIndex = (elements: DesignElement[], id: string): number =>
  elements.findIndex((element) => element.id === id);

export const createTextElement = (overrides: Partial<TextElement> = {}): TextElement => ({
  id: nanoid(),
  name: overrides.name ?? 'Text',
  type: 'text',
  text: overrides.text ?? 'New text',
  fontFamily: overrides.fontFamily ?? 'Inter',
  fontSize: overrides.fontSize ?? 48,
  fontWeight: overrides.fontWeight ?? 'normal',
  fill: overrides.fill ?? '#111827',
  textAlign: overrides.textAlign ?? 'left',
  x: overrides.x ?? 200,
  y: overrides.y ?? 200,
  width: overrides.width ?? 400,
  height: overrides.height ?? 80,
  rotation: overrides.rotation ?? 0,
  zIndex: overrides.zIndex ?? 0,
  opacity: overrides.opacity ?? 1,
});

export const createRectElement = (overrides: Partial<ShapeElement> = {}): ShapeElement => ({
  id: nanoid(),
  name: overrides.name ?? 'Rectangle',
  type: 'shape',
  shapeType: 'rect',
  fill: overrides.fill ?? '#3b82f6',
  stroke: overrides.stroke ?? '#1d4ed8',
  strokeWidth: overrides.strokeWidth ?? 0,
  cornerRadius: overrides.cornerRadius ?? 0,
  x: overrides.x ?? 250,
  y: overrides.y ?? 250,
  width: overrides.width ?? 300,
  height: overrides.height ?? 200,
  rotation: overrides.rotation ?? 0,
  zIndex: overrides.zIndex ?? 0,
  opacity: overrides.opacity ?? 1,
});

export const createCircleElement = (overrides: Partial<ShapeElement> = {}): ShapeElement => ({
  id: nanoid(),
  name: overrides.name ?? 'Circle',
  type: 'shape',
  shapeType: 'circle',
  fill: overrides.fill ?? '#10b981',
  stroke: overrides.stroke ?? '#047857',
  strokeWidth: overrides.strokeWidth ?? 0,
  x: overrides.x ?? 300,
  y: overrides.y ?? 300,
  width: overrides.width ?? 200,
  height: overrides.height ?? 200,
  rotation: overrides.rotation ?? 0,
  zIndex: overrides.zIndex ?? 0,
  opacity: overrides.opacity ?? 1,
});

