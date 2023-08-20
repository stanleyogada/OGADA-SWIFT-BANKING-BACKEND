enum EAccountType {
  NORMAL = "NORMAL",
  CASHBACK = "CASHBACK",
}

type TAccount = {
  id: number;
  type: EAccountType;
  balance: number;
  user_id: number;
};

export { EAccountType };

export type { TAccount };
