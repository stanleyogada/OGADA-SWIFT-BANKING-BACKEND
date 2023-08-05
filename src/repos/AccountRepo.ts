import { ACCOUNT_DEFAULT_BALANCE, REPO_RESOURCES } from "../constants";
import Repo from "./Repo";

import { EAccountType, type TAccount } from "../types/accounts";
import pool from "../utils/pool";

const repo = new Repo<TAccount>(REPO_RESOURCES.accounts, ["id", "balance", "type", "user_id"]);

class AccountRepo {
  static async createAccounts(userId: number) {
    // TODO: implement createMany inside Repo (insert multiple values at once)
    await repo.createOne({
      balance: +ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL], // TODO: remove this: add as default value in db
      type: EAccountType.NORMAL,
      user_id: userId,
    });

    await repo.createOne({
      balance: +ACCOUNT_DEFAULT_BALANCE[EAccountType.CASHBACK], // TODO: remove this: add as default value in db
      type: EAccountType.CASHBACK,
      user_id: userId,
    });
  }

  // TODO: Implement this inside a transactions repo
  static async sendMoneyInHouse(payload: {
    sender_account_number: string;
    receiver_account_number: string;
    amount: number;
    type: EAccountType;
    // remark?: string;
  }) {
    const getShouldMakeADBMistake = () => {
      if (process.env.NODE_ENV !== "test") {
        return false;
      }
      if (payload.amount === 55.5) {
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

    await pool.query(
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
        
      ) AND accounts.type = $3;
    `,
      [`${payload.amount}`, payload.sender_account_number, payload.type]
    );

    await pool.query(
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
        
      ) AND accounts.type = $3;
    `,
      [`${payload.amount}`, payload.receiver_account_number, payload.type]
    );

    await pool.query("COMMIT TRANSACTION;");
  }
}

export { AccountRepo };
