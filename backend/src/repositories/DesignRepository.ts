import { Types } from 'mongoose';

import type { DesignDocument } from '../models/Design';
import { Design } from '../models/Design';
import type { DesignCreateInput, DesignUpdateInput } from '../validators/designValidators';

export interface IDesignRepository {
  create(payload: DesignCreateInput): Promise<DesignDocument>;
  list(search?: string): Promise<DesignDocument[]>;
  findById(id: string): Promise<DesignDocument | null>;
  update(id: string, payload: DesignUpdateInput): Promise<DesignDocument | null>;
  exists(id: string): Promise<boolean>;
  delete(id: string): Promise<DesignDocument | null>;
}

export class MongoDesignRepository implements IDesignRepository {
  async create(payload: DesignCreateInput): Promise<DesignDocument> {
    const design = await Design.create(payload);
    return design;
  }

  async list(search?: string): Promise<DesignDocument[]> {
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    return Design.find(filter).sort({ updatedAt: -1 }).exec();
  }

  async findById(id: string): Promise<DesignDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return Design.findById(id).exec();
  }

  async update(id: string, payload: DesignUpdateInput): Promise<DesignDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return Design.findByIdAndUpdate(
      id,
      { $set: { ...payload, updatedAt: new Date() } },
      { new: true, runValidators: false },
    ).exec();
  }

  async exists(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const exists = await Design.exists({ _id: new Types.ObjectId(id) }).exec();
    return Boolean(exists);
  }

  async delete(id: string): Promise<DesignDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return Design.findByIdAndDelete(id).exec();
  }
}

