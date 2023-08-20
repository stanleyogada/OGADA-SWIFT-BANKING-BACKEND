/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE transactions_banks (
      id SERIAL PRIMARY KEY,

      session_id VARCHAR(100) NOT NULL UNIQUE,
      remark VARCHAR(50) NOT NULL,
      bank_name VARCHAR(50) NOT NULL,
      bank_account_full_name VARCHAR(100) NOT NULL,
      bank_account_number VARCHAR(10) NOT NULL,

      transaction_id INTEGER NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE
    );


    CREATE TABLE transactions_in_house (
      id SERIAL PRIMARY KEY,

      remark VARCHAR(50),
      receiver_account_number VARCHAR(10),
      sender_account_number VARCHAR(10),

      transaction_id INTEGER NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE
    );


    CREATE TABLE transactions_rewards (
      id SERIAL PRIMARY KEY,

      receiver_account_number VARCHAR(11) NOT NULL,
      note VARCHAR(50) NOT NULL,

      transaction_id INTEGER NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE
    );


    CREATE TABLE transactions_mobile (
      id SERIAL PRIMARY KEY,

      operator VARCHAR(50) NOT NULL,
      phone_number VARCHAR(11) NOT NULL,
      is_airtime BOOLEAN NOT NULL,

      transaction_id INTEGER NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE transactions_banks;
    DROP TABLE transactions_in_house;
    DROP TABLE transactions_rewards;
    DROP TABLE transactions_mobile;
  `);
}
