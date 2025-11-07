export type DesignElementType = 'text' | 'image' | 'shape';

export interface BaseElement {
  id: string;
  name: string;
  type: DesignElementType;
  zIndex: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
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
  imageUrl: string;
  opacity: number;
  fit: 'contain' | 'cover';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rect' | 'circle';
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius?: number;
}

export type DesignElement = TextElement | ImageElement | ShapeElement;

export interface DesignSnapshot {
  _id: string;
  name: string;
  width: number;
  height: number;
  elements: DesignElement[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  designId: string;
  authorId?: string;
  authorName: string;
  message: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
  x?: number;
  y?: number;
}

