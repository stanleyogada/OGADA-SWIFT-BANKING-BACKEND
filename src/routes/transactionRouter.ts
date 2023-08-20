import { Router } from "express";

import {
  getAllTransactions,
  getOneTransaction,
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
import handleTryCatch from "../utils/handleTryCatch";
import handleAddTransactionToRequest from "../middleware/handleAddTransactionToRequest";
import { REPO_RESOURCES } from "../constants";

const router = Router();

router.get(TRANSACTIONS_ROUTES.all, handleAuthGuardRoute, getAllTransactions);

router.get(TRANSACTIONS_ROUTES.banks, handleAuthGuardRoute, getTransactionsBank);
router.post(TRANSACTIONS_ROUTES.banksSendMoney, handleAuthGuardRoute, handleValidateTransferPin, sendMoneyBank);

router.get(TRANSACTIONS_ROUTES.inHouses, handleAuthGuardRoute, getTransactionsInHouse);
router.post(TRANSACTIONS_ROUTES.inHousesSendMoney, handleAuthGuardRoute, handleValidateTransferPin, sendMoneyInHouse);

router.get(TRANSACTIONS_ROUTES.mobiles, handleAuthGuardRoute, getTransactionsMobile);
router.post(TRANSACTIONS_ROUTES.mobilesSendMoney, handleAuthGuardRoute, handleValidateTransferPin, sendMoneyMobile);
router.get(
  `${TRANSACTIONS_ROUTES.mobiles}/:transactionId`,
  handleAuthGuardRoute,
  handleAddTransactionToRequest(REPO_RESOURCES.transactionsTransactionsMobile),
  getOneTransaction
);

router.get(`${TRANSACTIONS_ROUTES.rewards}`, handleAuthGuardRoute, getTransactionsReward);
router.get(
  `${TRANSACTIONS_ROUTES.rewards}/:transactionId`,
  handleAuthGuardRoute,
  handleAddTransactionToRequest(REPO_RESOURCES.transactionsTransactionsReward),
  getOneTransaction
);

export default router;
