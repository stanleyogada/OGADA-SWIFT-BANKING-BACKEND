import type { NextFunction } from "express";

import handleTryCatch from "src/utils/handleTryCatch";
import APIError from "src/utils/APIError";
import { TRequestUser } from "src/types/api";
import handleDeleteReturnCols from "src/utils/handleDeleteReturnCols";

import jwt from "jsonwebtoken";
const { promisify } = require("util");

const verifyJwt = promisify(jwt.verify);

const handleAuthGuardRoute = handleTryCatch(async (req: TRequestUser, _, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = await verifyJwt(token, process.env.JWT_PRIVATE_SECRET_KEY);

  if (decoded) {
    req.user = handleDeleteReturnCols(decoded, ["exp", "iat"]) as TRequestUser["user"];
    return next();
  }

  return next(new APIError("You are not authorized to access this route!", 401));
});

export default handleAuthGuardRoute;
