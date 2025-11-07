import type { Request, Response } from 'express';

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'The requested resource could not be found',
  });
};

