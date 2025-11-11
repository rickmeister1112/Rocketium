import { Document, Model } from 'mongoose';
import type { DesignElement, CollaboratorStatus } from '../types/design';
export interface CollaboratorSubdocument {
    userId: string;
    userName?: string;
    status: CollaboratorStatus;
    requestedAt: Date;
    respondedAt?: Date;
}
export interface DesignDocument extends Document {
    name: string;
    width: number;
    height: number;
    ownerId?: string;
    ownerName?: string;
    elements: DesignElement[];
    thumbnailUrl?: string;
    collaborators: CollaboratorSubdocument[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Design: Model<DesignDocument>;
//# sourceMappingURL=Design.d.ts.map