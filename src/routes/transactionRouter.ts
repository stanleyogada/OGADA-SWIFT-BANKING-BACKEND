import { Router } from "express";

import { getTransactionsInHouse, sendMoneyInHouse } from "../controllers/transactionController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";

const router = Router();

// router.get("/", (req, res) => {});
// router.get("/:id", (req, res) => {});
// router.get("/reward", (req, res) => {});
// router.get("/mobile", (req, res) => {});

router.get("/banks", (req, res) => {
  res.status(200).json({
    status: "success",
    data: [],
    count: 0,
  });
});

// router.post("/send-money", (req, res) => { });
router.get("/in-houses", handleAuthGuardRoute, getTransactionsInHouse);
router.post("/in-houses/send-money", handleAuthGuardRoute, sendMoneyInHouse);

export default router;
