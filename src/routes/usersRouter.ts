import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  getCurrentUser,
  updateOneUser,
  deleteOneUser,
  updateLoginPasscode,
  getAllAccounts,
  getOneUserByPhone,
} from "../controllers/usersController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";
import handleAdminProtectRoute from "../middleware/handleAdminProtectRoute";
import { DEFAULT_USER_SIGNIN_CREDENTIALS } from "../constants";

const router = Router();

router.get("/me", handleAuthGuardRoute, getCurrentUser);
router.get("/me/accounts", handleAuthGuardRoute, getAllAccounts);

router.get("/by-phone/:phone", getOneUserByPhone);

router.get(
  "/default-user-login",
  (req, _, next) => {
    req.params = {
      id: `${DEFAULT_USER_SIGNIN_CREDENTIALS.id}`,
      show: "1",
    };

    next();
  },
  getOneUser
);

router.get("/", handleAuthGuardRoute, handleAdminProtectRoute, getAllUsers);
router.get("/:id", handleAuthGuardRoute, handleAdminProtectRoute, getOneUser);
router.delete("/:id", handleAuthGuardRoute, handleAdminProtectRoute, deleteOneUser);

router.patch("/", handleAuthGuardRoute, updateOneUser);
router.patch("/update-login-passcode", handleAuthGuardRoute, updateLoginPasscode);

export default router;
