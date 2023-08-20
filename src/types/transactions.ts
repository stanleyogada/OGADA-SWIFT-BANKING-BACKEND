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

  receiver_account_number: string;
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
  "id"
>;

type TTransactionTransactionBank = Omit<
  TTransaction &
    TTransactionBank & {
      sender_account_full_name: string;
      sender_account_number: string;
    },
  "id"
>;

type TTransactionTransactionReward = Omit<TTransaction & TTransactionReward, "id">;

type TTransactionTransactionMobile = Omit<TTransaction & TTransactionMobile, "id">;

enum ETransactionType {
  REWARD = "rewards",
  TRANSFER_TO_BANK = "banks",
  IN_HOUSE_TRANSFER = "in-houses",
  MOBILE = "mobiles",
}

type TTransactionAll = {
  transaction_id: number;
  transaction_type: ETransactionType;
  created_at: Date;
  amount: number;
  is_success: boolean;
  is_deposit: boolean;
  receiver_account_number: string;
  sender_account_number: string;
};

//
//

export type {
  TTransaction,
  TTransactionBank,
  TTransactionInHouse,
  TTransactionReward,
  TTransactionMobile,
  TTransactionTransactionInHouse,
  TTransactionTransactionBank,
  TTransactionTransactionReward,
  TTransactionTransactionMobile,
  TTransactionAll,
};

export { ETransactionType };
