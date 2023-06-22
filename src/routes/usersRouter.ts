import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  updateOneUser,
  deleteOneUser,
  updateLoginPasscode,
} from "../controllers/usersController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";

const router = Router();

router.get("/", handleAuthGuardRoute, getAllUsers);
router.get("/:id", handleAuthGuardRoute, getOneUser);

router.patch("/", handleAuthGuardRoute, updateOneUser);
router.patch("/update-login-passcode", handleAuthGuardRoute, updateLoginPasscode);

router.delete("/:id", handleAuthGuardRoute, deleteOneUser);

export default router;
