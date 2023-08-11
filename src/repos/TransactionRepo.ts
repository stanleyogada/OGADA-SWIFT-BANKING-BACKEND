import { REPO_RESOURCES } from "../constants";
import {
  TTransaction,
  TTransactionBank,
  TTransactionInHouse,
  TTransactionTransactionInHouse,
} from "../types/transactions";
import pool from "../utils/pool";
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

const transactionBankRepo = new Repo<TTransactionBank>(REPO_RESOURCES.transactionsBanks, [
  "id",
  "bank_account_full_name",
  "bank_account_number",
  "bank_name",
  "session_id",
  "transaction_id",
  "remark",
]);

class TransactionRepo {
  static generateTransactionNumber(prefix: "TRX" | "SES" = "TRX") {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();

    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const random = Math.floor(Math.random() * 1000);
    const time = date.getTime();

    const transactionNumber = `${prefix}-${year}${month}${dayOfMonth}${hour}${minute}${second}-${random}-${time}`;

    return transactionNumber;
  }

  static async createTransactionInHouse(
    payload: Omit<TTransaction & TTransactionInHouse, "id" | "transaction_id" | "created_at">
  ) {
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
  static async createTransactionBank(
    payload: Omit<TTransaction & TTransactionBank, "id" | "transaction_id" | "created_at">
  ) {
    const row = await transactionRepo.createOne({
      transaction_number: payload.transaction_number,
      is_deposit: payload.is_deposit,
      is_success: payload.is_success,
      type: payload.type,
      amount: payload.amount,
      charge: payload.charge,
      account_id: payload.account_id,
    });

    await transactionBankRepo.createOne({
      bank_account_full_name: payload.bank_account_full_name,
      bank_account_number: payload.bank_account_number,
      bank_name: payload.bank_name,
      session_id: payload.session_id,
      transaction_id: row.id,
      remark: payload.remark,
    });
  }

  static handleSelectTransaction = () => {
    return `
      SELECT
        transaction_id,
        created_at,
        transaction_number,
        is_success,
        type,
        amount,
        charge,
        account_id,
        `;
  };

  static async findManyTransactionsInHouseBy(payload: { account_number: string }) {
    const { rows } = await pool.query(
      `
      ${TransactionRepo.handleSelectTransaction()}

        transactions_in_house_id,
        remark,
        receiver_account_number,
        sender_account_number,
        recipient
      FROM ${REPO_RESOURCES.transactionsTransactionsInHouse}
      WHERE
        sender_account_number = $1
        OR receiver_account_number = $1 
        AND is_success = TRUE;
    `,
      [payload.account_number]
    );

    return rows as TTransactionTransactionInHouse[];
  }

  static async findManyTransactionsBankBy(payload: { account_number: string }) {
    const { rows } = await pool.query(
      `
      ${TransactionRepo.handleSelectTransaction()}

        transactions_banks_id,
        bank_account_full_name,
        bank_account_number,
        bank_name,
        session_id,
        remark,
        sender_account_full_name,
        sender_account_number,

        false AS is_deposit
      FROM ${REPO_RESOURCES.transactionsTransactionsBanks}
      WHERE
        sender_account_number = $1;
    `,
      [payload.account_number]
    );

    return rows as TTransactionTransactionInHouse[];
  }
}

export default TransactionRepo;
