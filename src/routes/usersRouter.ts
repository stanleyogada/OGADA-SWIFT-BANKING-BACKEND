import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  getCurrentUser,
  updateOneUser,
  deleteOneUser,
  updateLoginPasscode,
} from "src/controllers/usersController";
import handleAuthGuardRoute from "src/middleware/handleAuthGuardRoute";
import handleAdminProtectRoute from "src/middleware/handleAdminProtectRoute";

const router = Router();

router.get("/me", handleAuthGuardRoute, getCurrentUser);

router.get("/", handleAuthGuardRoute, handleAdminProtectRoute, getAllUsers);
router.get("/:id", handleAuthGuardRoute, handleAdminProtectRoute, getOneUser);
router.delete("/:id", handleAuthGuardRoute, handleAdminProtectRoute, deleteOneUser);

router.patch("/", handleAuthGuardRoute, updateOneUser);
router.patch("/update-login-passcode", handleAuthGuardRoute, updateLoginPasscode);

export default router;
