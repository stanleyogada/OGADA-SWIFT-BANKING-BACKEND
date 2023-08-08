/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

      transaction_number VARCHAR(50) NOT NULL UNIQUE,
      is_deposit BOOLEAN NOT NULL,
      is_success BOOLEAN NOT NULL,
      type ACCOUNT_TYPE NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      charge DECIMAL(15, 2),

      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE transactions;
  `);
}
