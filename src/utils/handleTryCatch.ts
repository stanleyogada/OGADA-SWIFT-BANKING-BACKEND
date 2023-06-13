import type { NextFunction, Request, Response } from "express";

const handleTryCatch =
  (cb: (req?: Request, res?: Response, next?: NextFunction) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      // console.error(err);

      next(err);
    }
  };

export default handleTryCatch;
