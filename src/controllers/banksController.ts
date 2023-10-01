import type { NextFunction, Request, Response } from "express";
import axios from "axios";

import UserRepo from "../repos/UserRepo";
import handleTryCatch from "../utils/handleTryCatch";
import APIError from "../utils/APIError";
import { TBank } from "../types/banks";

type TBankCode = string;
type TBankName = string;

const handleFetchAllBanks = async () => {
  const res = await Promise.all([
    axios({
      url: "https://nigerianbanks.xyz/",
    }),
    axios({
      url: "https://nubapi.com/banks",
    }),
  ]);

  const nigerianBanks = res[0].data as unknown as TBank[];
  const nubapiBank = res[1].data as unknown as Record<TBankCode, TBankName>;

  const nubapiBankBankCodes = Object.keys(nubapiBank);
  const nigerianBanksBankCodes = nigerianBanks.map((bank) => bank.code.toString());

  const allBankCodes = new Set([...nubapiBankBankCodes, ...nigerianBanksBankCodes]);

  const banks = [];

  allBankCodes.forEach((bankCode) => {
    const nigerianBank = nigerianBanks.find((bank) => bank.code.toString() === bankCode);

    if (nigerianBank) {
      return banks.push({
        name: nigerianBank.name,
        code: nigerianBank.code,
        logo: nigerianBank.logo,
      });
    }

    const bankName = nubapiBank[bankCode];

    return banks.push({
      name: bankName,
      code: bankCode,
      logo: null,
    });
  });

  return banks as TBank[];
};

const handleBankAccountVerification = async (bankAccountNumber: string, bankCode: string) => {
  const { data } = await axios({
    url: `https://nubapi.com/api/verify?account_number=${bankAccountNumber}&bank_code=${bankCode}`,
    headers: {
      Authorization: `Bearer ${process.env.NUB_API_KEY}`,
    },
  });

  return data;
};

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
