import type { Request, Response } from 'express';
import type { IDesignService } from '../services/DesignService';
export declare class DesignController {
    private readonly service;
    constructor(service: IDesignService);
    readonly createDesign: (req: Request, res: Response, next: import("express").NextFunction) => void;
    readonly listDesigns: (req: Request, res: Response, next: import("express").NextFunction) => void;
    readonly getDesign: (req: Request, res: Response, next: import("express").NextFunction) => void;
    readonly updateDesign: (req: Request, res: Response, next: import("express").NextFunction) => void;
    readonly createComment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    readonly listComments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    readonly updateComment: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=designController.d.ts.map