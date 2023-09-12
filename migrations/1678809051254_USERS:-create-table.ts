/* eslint-disable camelcase */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";
import HashPassword from "../src/utils/HashPassword";
import { DEFAULT_USER_SIGNIN_CREDENTIALS } from "../src/constants";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const loginPassCodeHash = await HashPassword.handleHash(DEFAULT_USER_SIGNIN_CREDENTIALS.login_passcode);
  const transferPinHash = await HashPassword.handleHash(DEFAULT_USER_SIGNIN_CREDENTIALS.transfer_pin);

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
      one_time_password VARCHAR(20) UNIQUE,
      avatar VARCHAR(100)
    );

    
    INSERT INTO admin_users (
        first_name,
        last_name,
        middle_name,
        phone,
        email,
        email_is_verified,
        login_passcode,
        transfer_pin,
        avatar
    ) VALUES (
        '${DEFAULT_USER_SIGNIN_CREDENTIALS.first_name}', 
        '${DEFAULT_USER_SIGNIN_CREDENTIALS.last_name}', 
        '${DEFAULT_USER_SIGNIN_CREDENTIALS.middle_name}', 
        '${DEFAULT_USER_SIGNIN_CREDENTIALS.phone}', 
        '${DEFAULT_USER_SIGNIN_CREDENTIALS.email}', 
        '${DEFAULT_USER_SIGNIN_CREDENTIALS.email_is_verified}',
        '${loginPassCodeHash}', 
        '${transferPinHash}', 
        '${DEFAULT_USER_SIGNIN_CREDENTIALS.avatar}'
    ) RETURNING *;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE users;
    DROP TYPE IF EXISTS KYC_TYPE;
  `);
}
