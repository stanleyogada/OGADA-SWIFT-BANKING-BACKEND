/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TYPE ACCOUNT_TYPE AS ENUM ('CASHBACK', 'OWEALTH');

    CREATE TABLE IF NOT EXISTS other_accounts (
      id SERIAL PRIMARY KEY,

      type ACCOUNT_TYPE NOT NULL,
      balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,

      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE other_accounts;
    DROP TYPE ACCOUNT_TYPE;
  `);
}
