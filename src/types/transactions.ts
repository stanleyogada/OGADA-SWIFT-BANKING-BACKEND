import type { EAccountType } from "./accounts";

type TTransaction = {
  id: number;
  created_at: Date;

  transaction_number: string;
  is_deposit: boolean;
  is_success: boolean;
  type: EAccountType;
  amount: number;
  charge: number;

  account_id: number;
};

type TTransactionBank = {
  id: number;

  session_id: string;
  remark: string;
  bank_name: string;
  bank_account_full_name: string;
  bank_account_number: string;

  transaction_id: number;
};

type TTransactionInHouse = {
  id: number;

  remark?: string;
  receiver_account_number: string;
  sender_account_number: string;

  transaction_id: number;
};

type TTransactionReward = {
  id: number;

  type: EAccountType;
  note: string;

  transaction_id: number;
};

type TTransactionMobile = {
  id: number;

  operator: string;
  phone_number: string;
  is_airtime: boolean;

  transaction_id: number;
};

//
//

type TTransactionTransactionInHouse = Omit<
  TTransaction &
    TTransactionInHouse & {
      recipient: string;
      transactions_in_house_id: number;
    },
  "id" | "is_deposit"
>;

//
//

export type {
  TTransaction,
  TTransactionBank,
  TTransactionInHouse,
  TTransactionReward,
  TTransactionMobile,
  TTransactionTransactionInHouse,
};
