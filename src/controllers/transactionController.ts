import Joi from "joi";
import { TRequestUser } from "../types/api";
import handleInputValidate from "../utils/handleInputValidate";
import handleTryCatch from "../utils/handleTryCatch";
import pool from "../utils/pool";
import { EAccountType } from "../types/accounts";
import { AccountRepo } from "../repos/AccountRepo";
import TransactionRepo from "../repos/TransactionRepo";
import { TTransaction, TTransactionBank, TTransactionInHouse } from "../types/transactions";
import UserRepo from "../repos/UserRepo";
import { NextFunction, Response } from "express";
import APIError from "../utils/APIError";

let createTransactionInHousePayload: Omit<TTransaction & TTransactionInHouse, "id" | "transaction_id" | "created_at">;

export const getTransactionsInHouse = handleTryCatch(async (req: TRequestUser, res: Response) => {
  const { user } = req;

  const transactions = await TransactionRepo.findManyTransactionsInHouseBy({
    account_number: user.phone,
  });

  res.status(200).json({
    status: "success",
    data: transactions,
    count: transactions.length,
  });
});

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

    const senderAccount = await UserRepo.findAllAccountsByUserId(user.id).then((accounts) =>
      accounts.find((account) => account.type === reqBody.sender_account_type)
    );

    createTransactionInHousePayload = {
      transaction_number: TransactionRepo.generateTransactionNumber(),
      is_deposit: false,
      is_success: true,
      type: reqBody.sender_account_type,
      amount: reqBody.amount,
      charge: 0,
      account_id: senderAccount.account_id,
      remark: reqBody.remark,
      receiver_account_number: reqBody.receiver_account_number,
      sender_account_number: reqBody.sender_account_number,
    };

    await AccountRepo.sendMoneyInHouse({
      sender_account_number: reqBody.sender_account_number,
      receiver_account_number: reqBody.receiver_account_number,
      amount: reqBody.amount,
      sender_account_type: reqBody.sender_account_type,
      receiver_account_type: EAccountType.NORMAL,
    });

    await TransactionRepo.createTransactionInHouse(createTransactionInHousePayload);

    res.status(200).json({
      status: "success",
      message: "Send money successfully!",
    });
  },
  async (err: Error) => {
    const isDBError = err.stack.includes("pg");
    if (!isDBError) {
      return;
    }

    await pool.query("ROLLBACK TRANSACTION;");

    createTransactionInHousePayload.is_success = false;
    await TransactionRepo.createTransactionInHouse(createTransactionInHousePayload);
  }
);

export const getTransactionsBank = handleTryCatch(async (req: TRequestUser, res: Response) => {
  const { user } = req;

  const transactions = await TransactionRepo.findManyTransactionsBankBy({
    account_number: user.phone,
  });

  res.status(200).json({
    status: "success",
    data: transactions,
    count: transactions.length,
  });
});

export const sendMoneyBank = handleTryCatch(async (req: TRequestUser, res: Response) => {
  const { user } = req;
  const reqBody = (Object.assign(req.body, {
    sender_account_number: user.phone,
  }) || {
    sender_account_number: user.phone,
  }) as TTransaction &
    TTransactionBank & {
      sender_account_number: string;
      sender_account_type: EAccountType;
    };

  handleInputValidate(
    {
      ...reqBody,
      sender_account_type: reqBody.sender_account_type?.toUpperCase(),
    },
    {
      sender_account_number: Joi.string().min(10).max(10).required(),
      bank_name: Joi.string().min(3).max(100).required(),
      bank_account_full_name: Joi.string().min(3).max(100).required(),
      bank_account_number: Joi.string()
        .pattern(/^[0-9]+$/)
        .message("Bank account number must be a number")
        .min(10)
        .max(10)
        .required(),
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

  const senderAccount = await UserRepo.findAllAccountsByUserId(user.id).then((accounts) =>
    accounts.find((account) => account.type === reqBody.sender_account_type)
  );

  await AccountRepo.withdrawMoney({
    sender_account_number: reqBody.sender_account_number,
    amount: reqBody.amount,
    sender_account_type: reqBody.sender_account_type,
  });

  await TransactionRepo.createTransactionBank({
    transaction_number: TransactionRepo.generateTransactionNumber(),
    is_deposit: false,
    is_success: true,
    type: reqBody.sender_account_type,
    amount: reqBody.amount,
    charge: 0,
    account_id: senderAccount.account_id,
    remark: reqBody.remark,
    bank_name: reqBody.bank_name,
    bank_account_full_name: reqBody.bank_account_full_name,
    bank_account_number: reqBody.bank_account_number,
    session_id: TransactionRepo.generateTransactionNumber("SES"),
  });

  res.status(200).json({
    status: "success",
    message: "Send money successfully!",
  });
});

export const getTransactionsMobile = handleTryCatch(async (req: TRequestUser, res: Response) => {
  const { user } = req;

  const transactions = await TransactionRepo.findManyTransactionsMobileBy({
    account_number: user.phone,
  });

  res.status(200).json({
    status: "success",
    data: transactions,
    count: transactions.length,
  });
});

export const getTransactionsReward = handleTryCatch(async (req: TRequestUser, res: Response, next: NextFunction) => {
  const {
    user,
    params: { accountType },
  } = req;

  if (!accountType) {
    return next(new APIError("Account type is required", 400));
  }

  const transactions = await TransactionRepo.findManyTransactionsRewardBy({
    account_number: user.phone,
    account_type: accountType.toUpperCase() as EAccountType,
  });

  res.status(200).json({
    status: "success",
    data: transactions,
    count: transactions.length,
  });
});

export const sendMoneyMobile = handleTryCatch(async (req: TRequestUser, res: Response) => {
  const { user } = req;
  const senderAccountNumber = {
    sender_account_number: user.phone,
  };
  const reqBody = (Object.assign(req.body, senderAccountNumber) || senderAccountNumber) as {
    sender_account_number: string;
    sender_account_type: EAccountType;
    operator: string;
    phone_number: string;
    is_airtime: boolean;
    amount: number;
  };

  handleInputValidate(
    {
      ...reqBody,
      sender_account_type: reqBody.sender_account_type?.toUpperCase(),
    },
    {
      sender_account_number: Joi.string().min(10).max(10).required(),
      sender_account_type: Joi.string()
        .valid(
          EAccountType.NORMAL,
          EAccountType.CASHBACK
          // EAccountType.OWEALTH, // TODO: add when Owealth is implemented
        )
        .required(),
      operator: Joi.string().min(3).max(100).required(),
      phone_number: Joi.string()
        .pattern(/^\d+$/)
        .message("Bank account number must be a number")
        .min(10)
        .max(11)
        .required(),
      is_airtime: Joi.boolean().required(),
      amount: Joi.number().min(2).required(),
    }
  );

  const senderAccount = await UserRepo.findAllAccountsByUserId(user.id).then((accounts) =>
    accounts.find((account) => account.type === reqBody.sender_account_type)
  );

  await AccountRepo.withdrawMoney({
    sender_account_number: reqBody.sender_account_number,
    amount: reqBody.amount,
    sender_account_type: reqBody.sender_account_type,
  });

  await TransactionRepo.createTransactionMobile({
    is_deposit: false,
    is_success: true,
    type: reqBody.sender_account_type,
    amount: reqBody.amount,
    charge: 0,
    account_id: senderAccount.account_id,
    sender_account_number: reqBody.sender_account_number,
    is_airtime: reqBody.is_airtime,
    operator: reqBody.operator,
    phone_number: reqBody.phone_number,
    note: `Cashback for mobile ${reqBody.is_airtime ? "airtime" : "data"} recharge`,
    receiver_account_number: reqBody.phone_number,
  });

  res.status(200).json({
    status: "success",
    message: "Send money successfully!",
  });
});
