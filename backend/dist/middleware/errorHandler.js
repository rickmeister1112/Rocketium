"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../utils/logger");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError_1.ApiError) {
        if (err.statusCode >= 500) {
            logger_1.logger.error({ err, code: err.code }, 'API error');
        }
        else {
            logger_1.logger.warn({ err, code: err.code }, 'Client error');
        }
        const body = {
            code: err.code,
            message: err.message,
            details: err.details,
        };
        res.status(err.statusCode).json(body);
        return;
    }
    if (err instanceof zod_1.ZodError) {
        const body = {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: err.flatten(),
        };
        logger_1.logger.warn({ err: err.flatten() }, 'Validation failed');
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(body);
        return;
    }
    const body = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
    };
    if (process.env.NODE_ENV !== 'production') {
        body.details = {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
        };
    }
    logger_1.logger.error({ err }, 'Unhandled error');
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json(body);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map