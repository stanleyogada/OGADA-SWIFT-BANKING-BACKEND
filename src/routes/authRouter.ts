import { Router } from "express";
import { signin, forgetLoginPasscode, resetLoginPasscode, signout } from "../controllers/authController";

const router = Router();

router.post("/signin", signin);
router.get("/signout", signout);

router.post("/forgot-login-passcode", forgetLoginPasscode);
router.post("/reset-login-passcode", resetLoginPasscode);

export default router;
``;
