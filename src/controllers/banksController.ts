import type { NextFunction, Request, Response } from "express";

import handleTryCatch from "../utils/handleTryCatch";
import APIError from "../utils/APIError";
import { handleBankAccountVerification, handleFetchAllBanks } from "../services/banks";

export const getAllBanks = handleTryCatch(async (_, res: Response) => {
  const banks = await handleFetchAllBanks();

  res.status(200).json({
    status: "success",
    data: banks,
    count: banks.length,
  });
});

export const getVerifyBankAccount = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { bank_account_number: bankAccountNumber, bank_code: bankCode } = req.query;

  if (!bankAccountNumber || !bankCode) {
    return next(new APIError("Please provide a bank account number and bank code!", 400));
  }

  const data = await handleBankAccountVerification(bankAccountNumber as string, bankCode as string);

  if (!data) {
    return next(new APIError("Invalid bank account number or bank code!", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      account_name: data.account_name,
    },
  });
});
