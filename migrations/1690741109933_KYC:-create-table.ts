/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS kyc_1 (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

      bvn VARCHAR(10) NOT NULL UNIQUE,
      local_bank_account_number VARCHAR(10) NOT NULL,
      local_bank_atm_card_last_six_digits VARCHAR(6) NOT NULL,

      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS kyc_2 (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

      address VARCHAR(200) NOT NULL,
      avatar_image VARCHAR(200) NOT NULL,

      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS kyc_3 (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

      utility_bill_image VARCHAR(200) NOT NULL,
      identity_card_image VARCHAR(200) NOT NULL,

      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE kyc_1;
    DROP TABLE kyc_3;
    DROP TABLE kyc_2;
  `);
}
