import { NextFunction, Router } from "express";
import {
  getAllUsers,
  getOneUser,
  getCurrentUser,
  updateOneUser,
  deleteOneUser,
  updateLoginPasscode,
} from "../controllers/usersController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";
import { TRequestUser } from "../types/api";
import APIError from "../utils/APIError";

const router = Router();

const handleProtectRoute = (req: TRequestUser, _, next: NextFunction) => {
  if (!req.user.is_admin_user) {
    return next(new APIError("You do not have permission to perform this action!", 403));
  }

  next();
};

router.get("/me", handleAuthGuardRoute, getCurrentUser);

router.get("/", handleAuthGuardRoute, handleProtectRoute, getAllUsers);
router.get("/:id", handleAuthGuardRoute, getOneUser);

router.patch("/", handleAuthGuardRoute, updateOneUser);
router.patch("/update-login-passcode", handleAuthGuardRoute, updateLoginPasscode);

router.delete("/:id", handleAuthGuardRoute, deleteOneUser);

export default router;
