import { REPO_RESOURCES } from "../constants";
import { TTransaction, TTransactionInHouse } from "../types/transactions";
import Repo from "./Repo";

const transactionRepo = new Repo<TTransaction>(REPO_RESOURCES.transactions, [
  "id",
  "created_at",
  "transaction_number",
  "is_deposit",
  "is_success",
  "type",
  "amount",
  "charge",
  "account_id",
]);

const transactionInHouseRepo = new Repo<TTransactionInHouse>(REPO_RESOURCES.transactionsInHouse, [
  "id",
  "remark",
  "receiver_account_number",
  "sender_account_number",
  "transaction_id",
]);

class TransactionRepo {
  static async createTransactionInHouse(payload: Omit<TTransaction & TTransactionInHouse, "id" | "created_at">) {
    const row = await transactionRepo.createOne({
      transaction_number: payload.transaction_number,
      is_deposit: payload.is_deposit,
      is_success: payload.is_success,
      type: payload.type,
      amount: payload.amount,
      charge: payload.charge,
      account_id: payload.account_id,
    });

    await transactionInHouseRepo.createOne({
      remark: payload.remark,
      receiver_account_number: payload.receiver_account_number,
      sender_account_number: payload.sender_account_number,
      transaction_id: row.id,
    });
  }
}

export default TransactionRepo;
