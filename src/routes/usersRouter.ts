import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  getCurrentUser,
  updateOneUser,
  deleteOneUser,
  updateLoginPasscode,
} from "../controllers/usersController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";
import handleAdminProtectRoute from "../middleware/handleAdminProtectRoute";

const router = Router();

router.get("/me", handleAuthGuardRoute, getCurrentUser);

router.get("/", handleAuthGuardRoute, handleAdminProtectRoute, getAllUsers);
router.get("/:id", handleAuthGuardRoute, getOneUser);

router.patch("/", handleAuthGuardRoute, updateOneUser);
router.patch("/update-login-passcode", handleAuthGuardRoute, updateLoginPasscode);

router.delete("/:id", handleAuthGuardRoute, deleteOneUser);

export default router;
