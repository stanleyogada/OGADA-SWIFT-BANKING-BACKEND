import { Router } from "express";
import {
  signin,
  signout,
  signup,
  signupAdmin,
  signinAdmin,
  forgetLoginPasscode,
  resetLoginPasscode,
  sendEmailVerification,
  confirmEmailVerification,
} from "src/controllers/authController";

const router = Router();

router.post("/signup/admin", signupAdmin); // TODO: Remove signup admin from the API (As it is not part of the documentation)
router.post("/signin/admin", signinAdmin);

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signout", signout);

router.post("/send-email-verification", sendEmailVerification);
router.post("/confirm-email-verification/:otp", confirmEmailVerification);

router.post("/forgot-login-passcode", forgetLoginPasscode);
router.post("/reset-login-passcode", resetLoginPasscode);

export default router;
