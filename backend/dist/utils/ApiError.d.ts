export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(statusCode: number, code: string, message: string, details?: unknown);
}
//# sourceMappingURL=ApiError.d.ts.map