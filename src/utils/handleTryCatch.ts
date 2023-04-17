import type { NextFunction, Request, Response } from "express";

const handleTryCatch =
  (cb: (req?: Request, res?: Response, next?: NextFunction) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default handleTryCatch;
