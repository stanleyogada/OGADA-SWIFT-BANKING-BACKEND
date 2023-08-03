/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TYPE OTHER_ACCOUNT_TYPE AS ENUM ('CASHBACK', 'OWEALTH');


    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,

      balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      account_number VARCHAR(10) NOT NULL UNIQUE,
      transfer_pin VARCHAR(4) NOT NULL,

      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS other_accounts (
      id SERIAL PRIMARY KEY,

      type OTHER_ACCOUNT_TYPE NOT NULL,
      balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,

      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

      UNIQUE (type, account_id)
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE other_accounts;
    DROP TABLE accounts;

    DROP TYPE OTHER_ACCOUNT_TYPE;
  `);
}
