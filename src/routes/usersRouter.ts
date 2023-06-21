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

router.get("/", getAllUsers);
router.get("/:id", getOneUser);

router.patch("/update-login-passcode", handleProtectedRoute, updateLoginPasscode);
router.patch("/:id", updateOneUser);

router.delete("/:id", deleteOneUser);

export default router;
