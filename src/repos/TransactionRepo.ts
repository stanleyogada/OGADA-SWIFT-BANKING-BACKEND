import { REPO_RESOURCES } from "../constants";
import { TTransaction, TTransactionInHouse, TTransactionTransactionInHouse } from "../types/transactions";
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
  static generateTransactionNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();

    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const random = Math.floor(Math.random() * 1000);
    const time = date.getTime();

    const transactionNumber = `TRX-${year}${month}${dayOfMonth}${hour}${minute}${second}-${random}-${time}`;

    return transactionNumber;
  }

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

  static async findManyTransactionsInHouseBy(payload: Partial<TTransactionTransactionInHouse>) {
    const repo = new Repo<TTransactionTransactionInHouse>(REPO_RESOURCES.transactionsTransactionsInHouse, [
      "transaction_id",
      "created_at",
      "transaction_number",
      "is_success",
      "type",
      "amount",
      "charge",
      "account_id",
      "transactions_in_house_id",
      "remark",
      "receiver_account_number",
      "sender_account_number",
      "recipient",
    ]);

    const rows = await repo.findManyBy(payload);
    return rows;
  }
}

export default TransactionRepo;
