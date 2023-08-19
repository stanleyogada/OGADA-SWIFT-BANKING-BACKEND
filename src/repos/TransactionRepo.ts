import { REPO_RESOURCES } from "../constants";
import { EAccountType } from "../types/accounts";
import {
  ETransactionType,
  TTransaction,
  TTransactionAll,
  TTransactionBank,
  TTransactionInHouse,
  TTransactionMobile,
  TTransactionReward,
  TTransactionTransactionBank,
  TTransactionTransactionInHouse,
  TTransactionTransactionMobile,
  TTransactionTransactionReward,
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

const transactionMobileRepo = new Repo<TTransactionMobile>(REPO_RESOURCES.transactionsMobile, [
  "id",
  "operator",
  "phone_number",
  "is_airtime",
  "transaction_id",
]);

const transactionRewardRepo = new Repo<TTransactionReward>(REPO_RESOURCES.transactionsReward, [
  "id",
  "receiver_account_number",
  "note",
  "transaction_id",
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

  static async createTransactionMobile(
    payload: Omit<
      TTransactionTransactionMobile &
        TTransactionTransactionReward & {
          sender_account_number: string;
        },
      "transaction_id" | "transaction_number" | "created_at"
    >
  ) {
    const mobile = await transactionRepo.createOne({
      transaction_number: TransactionRepo.generateTransactionNumber(),
      is_deposit: payload.is_deposit,
      is_success: payload.is_success,
      type: payload.type,
      amount: payload.amount,
      charge: payload.charge,
      account_id: payload.account_id,
    });

    await transactionMobileRepo.createOne({
      operator: payload.operator,
      phone_number: payload.phone_number,
      is_airtime: payload.is_airtime,
      transaction_id: mobile.id,
    });

    const reward = await transactionRepo.createOne({
      transaction_number: TransactionRepo.generateTransactionNumber(),
      is_deposit: payload.is_deposit,
      is_success: payload.is_success,
      type: EAccountType.CASHBACK,
      amount: payload.amount,
      charge: payload.charge,
      account_id: payload.account_id,
    });

    await transactionRewardRepo.createOne({
      receiver_account_number: payload.sender_account_number,
      note: payload.note,
      transaction_id: reward.id,
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
        recipient,

        CASE
          WHEN sender_account_number = $1 THEN false
          ELSE true
        END AS is_deposit
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
        is_deposit
      FROM ${REPO_RESOURCES.transactionsTransactionsBanks}
      WHERE
        sender_account_number = $1;
    `,
      [payload.account_number]
    );

    return rows as TTransactionTransactionBank[];
  }

  static async findManyTransactionsMobileBy(payload: { account_number: string }) {
    const { rows } = await pool.query(
      `
      ${TransactionRepo.handleSelectTransaction()}

        transactions_mobile_id,
        operator,
        phone_number,
        is_airtime,
        is_deposit
      FROM ${REPO_RESOURCES.transactionsTransactionsMobile}
      WHERE
        sender_account_number = $1;
    `,
      [payload.account_number]
    );

    return rows as TTransactionTransactionMobile[];
  }

  static async findManyTransactionsRewardBy(payload: {
    transaction_id?: number;
    account_number?: string;
    account_type?: EAccountType;
  }) {
    const { rows } = await pool.query(
      `
      ${TransactionRepo.handleSelectTransaction()}

        transactions_rewards_id,
        receiver_account_number,
        note,
        is_deposit
      FROM ${REPO_RESOURCES.transactionsTransactionsReward}
      WHERE
      ${
        payload?.transaction_id
          ? `transaction_id = $1;`
          : `receiver_account_number = $1
        AND type = $2;`
      }
    `,
      payload?.transaction_id ? [`${payload.transaction_id}`] : [payload.account_number, payload.account_type]
    );

    return rows as TTransactionTransactionReward[];
  }

  static async findOneTransactionBy(payload: { resource: string; transaction_id: string }) {
    switch (payload.resource) {
      case REPO_RESOURCES.transactionsTransactionsReward:
        return (
          await TransactionRepo.findManyTransactionsRewardBy({
            transaction_id: Number(payload.transaction_id),
          })
        )[0] as TTransactionTransactionReward;
    }
  }

  static async findAllTransactionsForAUser(payload: {
    account_id: number;
    sender_account_number: string;
    receiver_account_number: string;
  }) {
    const {
      rows,
    }: {
      rows: TTransactionAll[];
    } = await pool.query(
      `
      SELECT 
        transaction_id,
        created_at,
        transaction_type,
        amount,
        is_success,
        account_id,
        sender_account_number,
        receiver_account_number,
        CASE
          WHEN sender_account_number = $2 THEN false
          ELSE true
        END AS is_deposit

      FROM
        ${REPO_RESOURCES.transactionsTransactionsAll}
      WHERE 
        account_id = $1
        OR receiver_account_number = $3
    `,
      [`${payload.account_id}`, payload.sender_account_number, payload.receiver_account_number]
    );

    return rows;
  }
}

export default TransactionRepo;
