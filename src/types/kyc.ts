type TKYC1 = {
  id: number;
  created_at: Date;
  bvn: string;
  local_bank_account_number: string;
  local_bank_atm_card_last_six_digits: string;
  user_id: number;
};

type TKYC2 = {
  id: number;
  created_at: Date;
  address: string;
  avatar_image: string;
  user_id: number;
};

type TKYC3 = {
  id: number;
  created_at: Date;
  utility_bill_image: string;
  identity_card_image: string;
  user_id: number;
};

export type { TKYC1, TKYC2, TKYC3 };
