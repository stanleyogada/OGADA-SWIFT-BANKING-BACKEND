import { ACCOUNT_DEFAULT_BALANCE, REPO_RESOURCES, SEND_MONEY_MAGIC_FAIL_AMOUNT } from "../constants";
import Repo from "./Repo";

import { EAccountType, type TAccount } from "../types/accounts";
import pool from "../utils/pool";

const repo = new Repo<TAccount>(REPO_RESOURCES.accounts, ["id", "balance", "type", "user_id"]);

class AccountRepo {
  static async createAccounts(userId: number) {
    // TODO: implement createMany inside Repo (insert multiple values at once)
    await repo.createOne({
      balance: +ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL],
      type: EAccountType.NORMAL,
      user_id: userId,
    });

    await repo.createOne({
      balance: +ACCOUNT_DEFAULT_BALANCE[EAccountType.CASHBACK],
      type: EAccountType.CASHBACK,
      user_id: userId,
    });
  }

  static async sendMoneyInHouse(payload: {
    sender_account_number: string;
    receiver_account_number: string;
    amount: number;
    sender_account_type: EAccountType;
    receiver_account_type: EAccountType;
  }) {
    const getShouldMakeADBMistake = () => {
      if (process.env.NODE_ENV !== "test") {
        return false;
      }
      if (payload.amount === SEND_MONEY_MAGIC_FAIL_AMOUNT) {
        return true;
      }

      return false;
    };

    const balanceLiteral = (() => {
      if (getShouldMakeADBMistake()) {
        return "mistake_balance";
      }
      return "balance";
    })();

    await pool.query("BEGIN TRANSACTION;");

    const senderAccount = await pool.query(
      `
      UPDATE "accounts"
      SET balance = balance - $1
      WHERE accounts.user_id = (
        SELECT 
          "user_id"
        FROM 
          "users_accounts"
        WHERE 
          "account_number" = $2
          AND "type" = $3
        
      ) AND accounts.type = $3
      
      RETURNING id, balance, type, user_id;
    `,
      [`${payload.amount}`, payload.sender_account_number, payload.sender_account_type]
    );

    const receiverAccount = await pool.query(
      `
      UPDATE "accounts"
      SET ${balanceLiteral} = balance + $1
      WHERE accounts.user_id = (
        SELECT 
          "user_id"
        FROM 
          "users_accounts"
        WHERE 
          "account_number" = $2
          AND "type" = $3
        
      ) AND accounts.type = $3
      RETURNING id, balance, type, user_id;
    `,
      [`${payload.amount}`, payload.receiver_account_number, payload.receiver_account_type]
    );

    await pool.query("COMMIT TRANSACTION;");

    return {
      senderAccount: senderAccount.rows[0] as TAccount,
      receiverAccount: receiverAccount.rows[0] as TAccount,
    };
  }

  static async sendMoneyBank(payload: {
    sender_account_number: string;
    amount: number;
    sender_account_type: EAccountType;
  }) {
    const senderAccount = await pool.query(
      `
      UPDATE "accounts"
      SET balance = balance - $1
      WHERE accounts.user_id = (
        SELECT 
          "user_id"
        FROM 
          "users_accounts"
        WHERE 
          "account_number" = $2
          AND "type" = $3
        
      ) AND accounts.type = $3
      
      RETURNING id, balance, type, user_id;
    `,
      [`${payload.amount}`, payload.sender_account_number, payload.sender_account_type]
    );

    return {
      senderAccount: senderAccount.rows[0] as TAccount,
    };
  }
}

export { AccountRepo };
