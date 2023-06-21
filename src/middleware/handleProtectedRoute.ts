import type { NextFunction, Request, Response } from "express";

import handleTryCatch from "../utils/handleTryCatch";
import APIError from "../utils/APIError";
import { TRequestUser } from "../types/api";

const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const verifyJwt = promisify(jwt.verify);

const handleProtectedRoute = handleTryCatch(async (req: TRequestUser, _, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = await verifyJwt(token, process.env.JWT_PRIVATE_SECRET_KEY);

  if (decoded) {
    req.user = decoded;
    return next();
  }

  return next(new APIError("You are not authorized to access this route!", 401));
});

export default handleProtectedRoute;
