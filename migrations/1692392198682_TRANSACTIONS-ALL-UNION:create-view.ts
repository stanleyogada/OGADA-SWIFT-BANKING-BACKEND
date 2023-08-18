/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE VIEW "transactions_all" AS (
      SELECT
        "transaction_id", 
        created_at,
        'IN_HOUSE_TRANSFER' AS transaction_type,
        amount,
        is_success,
        account_id,
        sender_account_number,
        receiver_account_number,
        FALSE AS is_deposit
      FROM transactions_transactions_in_house
    ) UNION (
      SELECT
        "transaction_id", 
        created_at,
        'TRANSFER_TO_BANK' AS transaction_type,
        amount,
        is_success,
        account_id,
        sender_account_number,
        'n/a' AS receiver_account_number,
        FALSE AS is_deposit
      FROM transactions_transactions_banks
    ) UNION (
      SELECT
        "transaction_id", 
        created_at,
        'MOBILE' AS transaction_type,
        amount,
        is_success,
        account_id,
        sender_account_number,
        'n/a' AS receiver_account_number,
        FALSE AS is_deposit
      FROM transactions_transactions_mobile
    ) UNION (
      SELECT
        "transaction_id", 
        created_at,
        'REWARD' AS transaction_type,
        amount,
        is_success,
        account_id,
        'n/a' AS sender_account_number,
        'n/a' AS receiver_account_number,
        FALSE AS is_deposit
      FROM transactions_transactions_rewards
    ) ORDER BY created_at DESC;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP VIEW "transactions_all";
  `);
}
