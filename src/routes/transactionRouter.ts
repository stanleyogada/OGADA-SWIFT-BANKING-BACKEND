import { Router } from "express";

import {
  getTransactionsBank,
  getTransactionsInHouse,
  sendMoneyBank,
  sendMoneyInHouse,
} from "../controllers/transactionController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";
import { TRANSACTIONS_ROUTES } from "../constants/routes";

const router = Router();

// router.get("/", (req, res) => {});
// router.get("/:id", (req, res) => {});
// router.get("/reward", (req, res) => {});
// router.get("/mobile", (req, res) => {});

router.get(TRANSACTIONS_ROUTES.banks, handleAuthGuardRoute, getTransactionsBank);
router.post(TRANSACTIONS_ROUTES.banksSendMoney, handleAuthGuardRoute, sendMoneyBank);

router.get(TRANSACTIONS_ROUTES.inHouses, handleAuthGuardRoute, getTransactionsInHouse);
router.post(TRANSACTIONS_ROUTES.inHousesSendMoney, handleAuthGuardRoute, sendMoneyInHouse);

export default router;
