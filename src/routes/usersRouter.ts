import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  updateOneUser,
  deleteOneUser,
  updateLoginPasscode,
} from "../controllers/usersController";
import handleProtectedRoute from "../middleware/handleProtectedRoute";

const router = Router();

router.get("/", handleProtectedRoute, getAllUsers);
router.get("/:id", getOneUser);

router.patch("/", handleProtectedRoute, updateOneUser);
router.patch("/update-login-passcode", handleProtectedRoute, updateLoginPasscode);

router.delete("/:id", deleteOneUser);

export default router;
