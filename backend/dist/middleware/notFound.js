"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const notFoundHandler = (_req, res) => {
    res.status(404).json({
        code: 'NOT_FOUND',
        message: 'The requested resource could not be found',
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFound.js.map