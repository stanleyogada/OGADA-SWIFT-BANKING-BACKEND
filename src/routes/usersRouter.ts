import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  getCurrentUser,
  updateOneUser,
  deleteOneUser,
  updateLoginPasscode,
  getAllAccounts,
} from "../controllers/usersController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";
import handleAdminProtectRoute from "../middleware/handleAdminProtectRoute";

const router = Router();

router.get("/me", handleAuthGuardRoute, getCurrentUser);
router.get("/me/accounts", handleAuthGuardRoute, getAllAccounts);

router.get("/", handleAuthGuardRoute, handleAdminProtectRoute, getAllUsers);
router.get("/:id", handleAuthGuardRoute, handleAdminProtectRoute, getOneUser);
router.delete("/:id", handleAuthGuardRoute, handleAdminProtectRoute, deleteOneUser);

router.patch("/", handleAuthGuardRoute, updateOneUser);
router.patch("/update-login-passcode", handleAuthGuardRoute, updateLoginPasscode);

export default router;
