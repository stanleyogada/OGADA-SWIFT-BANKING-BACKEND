import { Router } from "express";
import { forgetLoginPasscode, resetLoginPasscode } from "../controllers/authController";

const router = Router();

router.post("/forgot-login-passcode", forgetLoginPasscode);
router.post("/reset-login-passcode", resetLoginPasscode);

export default router;
