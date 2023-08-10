/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE VIEW "transactions_transactions_in_house" AS 
      SELECT DISTINCT
        transactions.id AS "transaction_id", 
        transactions.created_at,
        transactions.transaction_number,
        transactions.is_success,
        transactions.type,
        transactions.amount,
        transactions.charge,
        transactions.account_id,
      
        transactions_in_house.id AS "transactions_in_house_id",
        transactions_in_house.remark,
        transactions_in_house.receiver_account_number,
        transactions_in_house.sender_account_number,
    
        users_accounts.full_name AS "recipient"
      FROM "transactions"
      INNER JOIN "transactions_in_house" ON transactions_in_house.transaction_id = transactions.id
      INNER JOIN "users_accounts" ON users_accounts.account_number = transactions_in_house.receiver_account_number
      ORDER BY "created_at" DESC;

      CREATE VIEW "transactions_transactions_banks" AS
        SELECT DISTINCT
          transactions.id AS "transaction_id", 
          transactions.created_at,
          transactions.transaction_number,
          transactions.is_success,
          transactions.type,
          transactions.amount,
          transactions.charge,
          transactions.account_id,

          transactions_banks.id AS "transactions_banks_id",
          transactions_banks.session_id,
          transactions_banks.remark,
          transactions_banks.bank_name,
          transactions_banks.bank_account_full_name,
          transactions_banks.bank_account_number,

          users_accounts.full_name AS "sender_account_full_name",
          users_accounts.account_number AS "sender_account_number"
        FROM "transactions"
        INNER JOIN "transactions_banks" ON transactions_banks.transaction_id = transactions.id
        INNER JOIN "users_accounts" ON users_accounts.account_id = transactions.account_id
        ORDER BY "created_at" DESC;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP VIEW "transactions_transactions_in_house";
    DROP VIEW "transactions_transactions_banks";
  `);
}
