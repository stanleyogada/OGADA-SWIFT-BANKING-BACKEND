import { REPO_RESOURCES } from "../constants";
import Repo from "./Repo";

import type { TAccount, TOtherAccount } from "../types/accounts";
const account = new Repo<TAccount>(REPO_RESOURCES.accounts, [
  "id",
  "balance",
  "account_number",
  "transfer_pin",
  "user_id",
]);

const otherAccount = new Repo<TOtherAccount>(REPO_RESOURCES.otherAccounts, ["id", "type", "balance", "account_id"]);

const NEW_ACCOUNT_BALANCE = 100000.0;

class AccountRepo {
  static async create(payload: Omit<TAccount, "id" | "balance">): Promise<TAccount> {
    const row = await account.createOne({ ...payload, balance: NEW_ACCOUNT_BALANCE });
    return row;
  }

  static async findOneBy(payload?: Partial<TAccount>, returnCols?: Repo<TAccount>["cols"]) {
    const rows = await account.findManyBy(payload, returnCols);
    return rows[0];
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

class OtherAccountRepo {
  static async create(payload: Omit<TOtherAccount, "id" | "balance">): Promise<TOtherAccount> {
    const row = await otherAccount.createOne(payload);
    return row;
  }

  static async findOneBy(payload?: Partial<TAccount>, returnCols?: Repo<TAccount>["cols"]) {
    const rows = await otherAccount.findManyBy(payload, returnCols);
    return rows[0];
  }
}

export { AccountRepo, OtherAccountRepo };
