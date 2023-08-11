import { Router } from "express";

import {
  getTransactionsBank,
  getTransactionsInHouse,
  sendMoneyBank,
  sendMoneyInHouse,
} from "../controllers/transactionController";
import handleAuthGuardRoute from "../middleware/handleAuthGuardRoute";
import { TRANSACTIONS_ROUTES } from "../constants/routes";
import APIError from "../utils/APIError";
import HashPassword from "../utils/HashPassword";

const router = Router();

// router.get("/", (req, res) => {});
// router.get("/:id", (req, res) => {});
// router.get("/reward", (req, res) => {});
// router.get("/mobile", (req, res) => {});

const handleValidateTransferPin = async (req, res, next) => {
  const { user } = req;
  const { transfer_pin } = req.body;

  const isTransferPinValid = await HashPassword.handleCheck(transfer_pin, user.transfer_pin);

  if (!isTransferPinValid) {
    return next(new APIError("Transfer pin is not correct", 400));
  }

  delete req.body.transfer_pin;

  next();
};

router.get(TRANSACTIONS_ROUTES.banks, handleAuthGuardRoute, getTransactionsBank);
router.post(TRANSACTIONS_ROUTES.banksSendMoney, handleAuthGuardRoute, handleValidateTransferPin, sendMoneyBank);

router.get(TRANSACTIONS_ROUTES.inHouses, handleAuthGuardRoute, getTransactionsInHouse);
router.post(TRANSACTIONS_ROUTES.inHousesSendMoney, handleAuthGuardRoute, handleValidateTransferPin, sendMoneyInHouse);

export default router;
