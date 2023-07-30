/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      account_number VARCHAR(10) NOT NULL UNIQUE,
      transfer_pin VARCHAR(4) NOT NULL,

      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE IF EXISTS accounts;
  `);
}
