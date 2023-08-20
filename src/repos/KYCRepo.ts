import { TKYC1, TKYC2, TKYC3 } from "../types/kyc";
import pool from "../utils/pool";

class KYC {
  static async createKYC1(payload: Omit<TKYC1, "id" | "createdAt">): Promise<TKYC1> {
    const { rows } = await pool.query(
      `
      INSERT INTO kyc1 
        (
          bvn,
          local_bank_account_number,
          local_bank_atm_card_last_six_digits,
          user_id
        )
      VALUES ($1, $2, $3, $4);
      RETURNING *
    `,
      [
        payload.bvn,
        payload.local_bank_account_number,
        payload.local_bank_atm_card_last_six_digits,
        `${payload.user_id}`,
      ]
    );

    return rows[0] as TKYC1;
  }

  static async createKYC2(payload: Omit<TKYC2, "id" | "createdAt">): Promise<TKYC2> {
    const { rows } = await pool.query(
      `
      INSERT INTO kyc2 
        (
          address,
          avatar_image,
          user_id
        )
      VALUES ($1, $2, $3);
      RETURNING *
    `,
      [payload.address, payload.avatar_image, `${payload.user_id}`]
    );

    return rows[0] as TKYC2;
  }

  static async createKYC3(payload: Omit<TKYC3, "id" | "createdAt">): Promise<TKYC3> {
    const { rows } = await pool.query(
      `
      INSERT INTO kyc3 
        (
          utility_bill_image,
          identity_card_image,
          user_id
        )
      VALUES ($1, $2, $3);
      RETURNING *
    `,
      [payload.utility_bill_image, payload.identity_card_image, `${payload.user_id}`]
    );

    return rows[0] as TKYC3;
  }
}

export default KYC;
