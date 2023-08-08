import Joi from "joi";
import { TRequestUser } from "../types/api";
import handleInputValidate from "../utils/handleInputValidate";
import handleTryCatch from "../utils/handleTryCatch";
import pool from "../utils/pool";
import { EAccountType } from "../types/accounts";
import { AccountRepo } from "../repos/AccountRepo";
import TransactionRepo from "../repos/TransactionRepo";

export const sendMoneyInHouse = handleTryCatch(
  async (req: TRequestUser, res) => {
    const { user } = req;
    const reqBody = Object.assign(req.body, {
      sender_account_number: user.phone,
    }) || {
      sender_account_number: user.phone,
    };

    handleInputValidate(
      {
        ...reqBody,
        sender_account_type: reqBody.sender_account_type?.toUpperCase(),
      },
      {
        sender_account_number: Joi.string().min(10).max(10).required(),
        receiver_account_number: Joi.string().min(10).max(10).required(),
        amount: Joi.number().min(2).required(),
        remark: Joi.string().min(3).max(100),
        sender_account_type: Joi.string()
          .valid(
            EAccountType.NORMAL,
            EAccountType.CASHBACK
            // EAccountType.OWEALTH, // TODO: add when Owealth is implemented
          )
          .required(),
      }
    );

    await AccountRepo.sendMoneyInHouse({
      sender_account_number: reqBody.sender_account_number,
      receiver_account_number: reqBody.receiver_account_number,
      amount: reqBody.amount,
      sender_account_type: reqBody.sender_account_type,
      receiver_account_type: EAccountType.NORMAL,
    });

    res.status(200).json({
      status: "success",
      message: "Send money successfully!",
    });
  },
  async () => {
    console.log("ROLLBACK TRANSACTION");

    await pool.query("ROLLBACK TRANSACTION;");
  }
);

export const getTransactionsInHouse = handleTryCatch(async (req: TRequestUser, res) => {
  const { user } = req;

  const transactions = await TransactionRepo.findManyTransactionsInHouseBy({
    sender_account_number: user.phone,
  });

  res.status(200).json({
    status: "success",
    data: transactions,
    count: transactions.length,
  });
});
