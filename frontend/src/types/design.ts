export type ElementType = 'text' | 'image' | 'shape';

export interface BaseElement {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fill: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  fit: 'contain' | 'cover';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rect' | 'circle';
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export type DesignElement = TextElement | ImageElement | ShapeElement;

export interface DesignMeta {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnailUrl?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Design extends DesignMeta {
  elements: DesignElement[];
}

export interface Comment {
  id: string;
  designId: string;
  authorName: string;
  authorId?: string;
  message: string;
  mentions: string[];
  createdAt: string;
  x?: number;
  y?: number;
}

export interface PresenceUser {
  userId: string;
  name: string;
  color: string;
}

