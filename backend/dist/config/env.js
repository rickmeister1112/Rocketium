"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const rawClientUrls = process.env.CLIENT_URLS ?? process.env.CLIENT_URL ?? 'http://localhost:5173';
const clientUrls = rawClientUrls
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '4000', 10),
    mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/rocketium',
    clientUrls,
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
};
//# sourceMappingURL=env.js.map