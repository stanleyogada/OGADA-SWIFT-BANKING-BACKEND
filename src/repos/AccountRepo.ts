import { REPO_RESOURCES } from "../constants";
import Repo from "./Repo";

import { EAccountType, type TAccount } from "../types/accounts";

const repo = new Repo<TAccount>(REPO_RESOURCES.accounts, ["id", "balance", "type", "user_id"]);

const NEW_ACCOUNT_BALANCE = 0.0; // TODO: remove this: add as default value in db
const NEW_CASHBACK_ACCOUNT_BALANCE = 800.0; // TODO: remove this: add as default value in db

class AccountRepo {
  static async createAccounts(userId: number) {
    await repo.createOne({
      balance: NEW_ACCOUNT_BALANCE,
      type: EAccountType.NORMAL,
      user_id: userId,
    });

    await repo.createOne({
      balance: NEW_CASHBACK_ACCOUNT_BALANCE,
      type: EAccountType.CASHBACK,
      user_id: userId,
    });
  }

  // TODO: Implement this inside a transactions repo
  // static async sendMoney(payload: { senderAccountNumber: string; receiverAccountNumber: string; amount: number }) {
  //   await pool.query(
  //     `
  //     BEGIN;

  //     UPDATE ${REPO_RESOURCES.accounts}
  //     SET balance = balance + $1

  //     COMMIT;
  //     `,
  //     []
  //   )
  // }
}

export { AccountRepo };
