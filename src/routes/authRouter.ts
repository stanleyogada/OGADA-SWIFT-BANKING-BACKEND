import { Router } from "express";
import { signin, forgetLoginPasscode, resetLoginPasscode } from "../controllers/authController";

const router = Router();

router.post("/signin", signin);

router.post("/forgot-login-passcode", forgetLoginPasscode);
router.post("/reset-login-passcode", resetLoginPasscode);

export default router;
``;
