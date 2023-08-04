import { ACCOUNT_DEFAULT_BALANCE, REPO_RESOURCES } from "../constants";
import Repo from "./Repo";

import { EAccountType, type TAccount } from "../types/accounts";

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
