/* eslint-disable camelcase */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TYPE KYC_TYPE AS ENUM ('BASIC', 'PRO', 'VIP');
  

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

      first_name VARCHAR(30) NOT NULL,
      last_name VARCHAR(30) NOT NULL,
      middle_name VARCHAR(30),
      nickname VARCHAR(30),
      phone VARCHAR(10) NOT NULL UNIQUE,
      email VARCHAR(50) NOT NULL UNIQUE,
      login_passcode VARCHAR(100) NOT NULL,
      transfer_pin VARCHAR(100) NOT NULL,
      kyc KYC_TYPE,
      email_is_verified BOOLEAN DEFAULT FALSE,
      one_time_password VARCHAR(20) UNIQUE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE users;
    
    DROP TYPE KYC_TYPE;
  `);
}
