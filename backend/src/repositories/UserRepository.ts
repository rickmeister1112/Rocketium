import { User, type UserDocument } from '../models/User';

export interface IUserRepository {
  create(email: string, passwordHash: string, displayName: string): Promise<UserDocument>;
  findByEmail(email: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  isDisplayNameTaken(displayName: string): Promise<boolean>;
  updateDisplayName(id: string, displayName: string): Promise<UserDocument | null>;
}

export class MongoUserRepository implements IUserRepository {
  async create(email: string, passwordHash: string, displayName: string): Promise<UserDocument> {
    const user = await User.create({ email, passwordHash, displayName });
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id).exec();
  }

  async isDisplayNameTaken(displayName: string): Promise<boolean> {
    const count = await User.countDocuments({ displayName }).exec();
    return count > 0;
  }

  async updateDisplayName(id: string, displayName: string): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(
      id,
      { displayName },
      { new: true },
    ).exec();
  }
}


