import e, { NextFunction } from "express";
import APIError from "../utils/APIError";
import { TRequestUser } from "../types/api";

const handleAdminProtectRoute = (req: TRequestUser, _, next: NextFunction) => {
  if (!req.user.is_admin_user) {
    return next(new APIError("You do not have permission to perform this action!", 403));
  }

  next();
};

export default handleAdminProtectRoute;
