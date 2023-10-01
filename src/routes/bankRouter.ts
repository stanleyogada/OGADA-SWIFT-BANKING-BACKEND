import { Router } from "express";
import { getAllBanks, getVerifyBankAccount } from "../controllers/banksController";

const router = Router();

router.get("/", getAllBanks);

router.get("/verify", getVerifyBankAccount);

export default router;
