import { Router } from "express";

import { sendMoneyInHouse } from "../controllers/transactionController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";

const router = Router();

router.get("/", (req, res) => {});
router.get("/:id", (req, res) => {});
router.get("/bank", (req, res) => {});
router.get("/reward", (req, res) => {});
router.get("/mobile", (req, res) => {});

// router.post("/send-money", (req, res) => { });
router.get("/in-house", (req, res) => {});
router.post("/in-house/send-money", handleAuthGuardRoute, sendMoneyInHouse);

export default router;
