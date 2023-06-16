import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import {
  getAllUsers,
  getOneUser,
  createOneUser,
  updateOneUser,
  deleteOneUser,
  updateLoginPasscode,
} from "../controllers/usersController";
import handleTryCatch from "../utils/handleTryCatch";
import APIError from "../utils/APIError";

const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const verifyJwt = promisify(jwt.verify);

const handleProtectedRoute = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = await verifyJwt(token, process.env.JWT_PRIVATE_SECRET_KEY);

  if (decoded) {
    // @ts-ignore
    req.user = decoded;
    return next();
  }

  return next(new APIError("You are not authorized to access this route!", 401));
});

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getOneUser);
router.post("/", createOneUser);
router.patch("/update-login-passcode", handleProtectedRoute, updateLoginPasscode);
router.patch("/:id", updateOneUser);
router.delete("/:id", deleteOneUser);

export default router;
