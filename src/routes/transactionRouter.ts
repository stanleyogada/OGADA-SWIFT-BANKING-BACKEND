import { Router } from "express";

import {
  getTransactionsBank,
  getTransactionsInHouse,
  getTransactionsMobile,
  getTransactionsReward,
  sendMoneyBank,
  sendMoneyInHouse,
  sendMoneyMobile,
} from "../controllers/transactionController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";
import handleValidateTransferPin from "../middleware/handleValidateTransferPin";
import { TRANSACTIONS_ROUTES } from "../constants/routes";

const router = Router();

router.get(TRANSACTIONS_ROUTES.banks, handleAuthGuardRoute, getTransactionsBank);
router.post(TRANSACTIONS_ROUTES.banksSendMoney, handleAuthGuardRoute, handleValidateTransferPin, sendMoneyBank);

router.get(TRANSACTIONS_ROUTES.inHouses, handleAuthGuardRoute, getTransactionsInHouse);
router.post(TRANSACTIONS_ROUTES.inHousesSendMoney, handleAuthGuardRoute, handleValidateTransferPin, sendMoneyInHouse);

router.get(TRANSACTIONS_ROUTES.mobiles, handleAuthGuardRoute, getTransactionsMobile);
router.post(TRANSACTIONS_ROUTES.mobilesSendMoney, handleAuthGuardRoute, handleValidateTransferPin, sendMoneyMobile);

router.get(`${TRANSACTIONS_ROUTES.rewards}/:accountType`, handleAuthGuardRoute, getTransactionsReward);

export default router;
