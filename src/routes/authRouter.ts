import { Router } from "express";
import {
  signin,
  signout,
  signup,
  forgetLoginPasscode,
  resetLoginPasscode,
  sendEmailVerification,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signout", signout);

router.post("/send-email-verification", sendEmailVerification);

router.post("/forgot-login-passcode", forgetLoginPasscode);
router.post("/reset-login-passcode", resetLoginPasscode);

export default router;
``;
