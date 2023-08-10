import { Router } from "express";

import { getTransactionsInHouse, sendMoneyInHouse } from "../controllers/transactionController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";
import { TRANSACTIONS_ROUTES } from "../constants/routes";

const router = Router();

// router.get("/", (req, res) => {});
// router.get("/:id", (req, res) => {});
// router.get("/reward", (req, res) => {});
// router.get("/mobile", (req, res) => {});

router.get(TRANSACTIONS_ROUTES.banks, (req, res) => {
  res.status(200).json({
    status: "success",
    data: [],
    count: 0,
  });
});

router.get(TRANSACTIONS_ROUTES.inHouses, handleAuthGuardRoute, getTransactionsInHouse);
router.post(TRANSACTIONS_ROUTES.inHousesSendMoney, handleAuthGuardRoute, sendMoneyInHouse);

export default router;
