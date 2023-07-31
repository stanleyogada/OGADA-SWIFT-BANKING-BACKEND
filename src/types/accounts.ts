enum EOtherAccountType {
  CASHBACK = "CASHBACK",
  OWEALTH = "OWEALTH",
}

type TAccount = {
  id: number;
  balance: number;
  account_number: string;
  transfer_pin: string;
  user_id: number;
};

type TOtherAccount = {
  id: number;
  type: EOtherAccountType;
  balance: number;
  account_id: number;
};

export type { TAccount, TOtherAccount, EOtherAccountType };
