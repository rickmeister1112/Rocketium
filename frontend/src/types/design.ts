import type {
  ElementType,
  FontWeight,
  ImageFitMode,
  ShapeType,
  TextAlignment,
} from './enums';

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
  fontWeight: FontWeight;
  fill: string;
  textAlign: TextAlignment;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  fit: ImageFitMode;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export type DesignElement = TextElement | ImageElement | ShapeElement;

export type DesignAccessStatus = 'owner' | 'collaborator' | 'pending' | 'denied' | 'none';

export interface DesignCollaborator {
  userId: string;
  userName?: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  respondedAt?: string;
}

export interface DesignAccessRequest {
  userId: string;
  userName?: string;
  requestedAt: string;
  status?: 'pending';
}

export interface DesignMeta {
  id: string;
  name: string;
  width: number;
  height: number;
  ownerId?: string;
  ownerName?: string;
  thumbnailUrl?: string;
  updatedAt: string;
  createdAt: string;
  accessStatus: DesignAccessStatus;
  canDelete: boolean;
  pendingRequests?: DesignAccessRequest[];
}

export interface Design extends DesignMeta {
  elements: DesignElement[];
  collaborators?: DesignCollaborator[];
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

