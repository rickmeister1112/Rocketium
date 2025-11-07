import { Document, Model } from 'mongoose';
import type { DesignElement } from '../types/design';
export interface DesignDocument extends Document {
    name: string;
    width: number;
    height: number;
    elements: DesignElement[];
    thumbnailUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Design: Model<DesignDocument>;
//# sourceMappingURL=Design.d.ts.map