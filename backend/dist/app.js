"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
app.disable('x-powered-by');
app.set('etag', false);
app.use((0, helmet_1.default)());
app.use((0, pino_http_1.default)({
    logger: logger_1.logger,
    customSuccessMessage: () => 'request completed',
    customErrorMessage: (_req, _res, error) => `request errored: ${error.message}`,
}));
app.use((0, compression_1.default)());
if (env_1.env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
}
const allowedOrigins = env_1.env.clientUrls;
const localhostPattern = /^http:\/\/localhost:\d+$/;
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin) || localhostPattern.test(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((_req, res, next) => {
    res.set({
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
        Expires: '0',
    });
    next();
});
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
app.use('/api', routes_1.default);
app.use(notFound_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map