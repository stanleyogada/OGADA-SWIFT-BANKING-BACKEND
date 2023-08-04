/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TYPE ACCOUNT_TYPE AS ENUM ('NORMAL', 'CASHBACK');


    CREATE TABLE accounts (
      id SERIAL PRIMARY KEY,

      balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      type ACCOUNT_TYPE NOT NULL,

      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE

      UNIQUE (type, user_id)
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE accounts;

    DROP TYPE ACCOUNT_TYPE;
  `);
}
