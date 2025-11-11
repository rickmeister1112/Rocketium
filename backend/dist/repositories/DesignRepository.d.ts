import type { DesignDocument } from '../models/Design';
import type { DesignCreateInput, DesignUpdateInput } from '../validators/designValidators';
export interface IDesignRepository {
    create(payload: DesignCreateInput): Promise<DesignDocument>;
    list(search?: string): Promise<DesignDocument[]>;
    findById(id: string): Promise<DesignDocument | null>;
    update(id: string, payload: DesignUpdateInput): Promise<DesignDocument | null>;
    exists(id: string): Promise<boolean>;
    delete(id: string): Promise<DesignDocument | null>;
    save(design: DesignDocument): Promise<DesignDocument>;
}
export declare class MongoDesignRepository implements IDesignRepository {
    create(payload: DesignCreateInput): Promise<DesignDocument>;
    list(search?: string): Promise<DesignDocument[]>;
    findById(id: string): Promise<DesignDocument | null>;
    update(id: string, payload: DesignUpdateInput): Promise<DesignDocument | null>;
    exists(id: string): Promise<boolean>;
    delete(id: string): Promise<DesignDocument | null>;
    save(design: DesignDocument): Promise<DesignDocument>;
}
//# sourceMappingURL=DesignRepository.d.ts.map