"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError_1.ApiError) {
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
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json(body);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map