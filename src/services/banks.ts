import axios from "axios";

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

export { handleFetchAllBanks, handleBankAccountVerification };
