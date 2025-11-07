"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDesignRepository = void 0;
const mongoose_1 = require("mongoose");
const Design_1 = require("../models/Design");
class MongoDesignRepository {
    async create(payload) {
        const design = await Design_1.Design.create(payload);
        return design;
    }
    async list(search) {
        const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
        return Design_1.Design.find(filter).sort({ updatedAt: -1 }).exec();
    }
    async findById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return null;
        }
        return Design_1.Design.findById(id).exec();
    }
    async update(id, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return null;
        }
        return Design_1.Design.findByIdAndUpdate(id, { $set: { ...payload, updatedAt: new Date() } }, { new: true, runValidators: false }).exec();
    }
    async exists(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return false;
        }
        const exists = await Design_1.Design.exists({ _id: new mongoose_1.Types.ObjectId(id) }).exec();
        return Boolean(exists);
    }
}
exports.MongoDesignRepository = MongoDesignRepository;
//# sourceMappingURL=DesignRepository.js.map