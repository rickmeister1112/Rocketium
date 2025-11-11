import type { DesignElementType, FontWeight, ImageFitMode, ShapeType, TextAlignment } from './enums';
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
export type CollaboratorStatus = 'pending' | 'approved' | 'denied';
export interface DesignCollaborator {
    userId: string;
    userName?: string;
    status: CollaboratorStatus;
    requestedAt: string;
    respondedAt?: string;
}
export interface DesignSnapshot {
    _id: string;
    name: string;
    width: number;
    height: number;
    ownerId?: string;
    ownerName?: string;
    elements: DesignElement[];
    thumbnailUrl?: string;
    collaborators: DesignCollaborator[];
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
//# sourceMappingURL=design.d.ts.map