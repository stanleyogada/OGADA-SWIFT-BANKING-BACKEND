import { Router } from "express";
import {
  signin,
  signout,
  signup,
  forgetLoginPasscode,
  resetLoginPasscode,
  sendEmailVerification,
  confirmEmailVerification,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signout", signout);

router.post("/send-email-verification", sendEmailVerification);
router.post("/confirm-email-verification/:otp", confirmEmailVerification);

router.post("/forgot-login-passcode", forgetLoginPasscode);
router.post("/reset-login-passcode", resetLoginPasscode);

export default router;
