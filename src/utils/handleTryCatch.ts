import type { NextFunction, Request, Response } from "express";

const handleTryCatch =
  (
    cb: (req?: Request, res?: Response, next?: NextFunction) => Promise<unknown>,
    onError?: (err?: unknown) => Promise<void>
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      console.error(err);

      if (onError) {
        return onError(err).then(() => next(err));
      }

      next(err);
    }
  };

export default handleTryCatch;
