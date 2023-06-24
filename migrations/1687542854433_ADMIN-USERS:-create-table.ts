/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";
import { ADMIN_USER_SIGNIN_CREDENTIALS } from "../src/constants";
import HashPassword from "../src/utils/HashPassword";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const hash = await HashPassword.handleHash(ADMIN_USER_SIGNIN_CREDENTIALS.login_passcode);

  pgm.sql(`
    CREATE TABLE admin_users (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      
      is_admin_user BOOLEAN DEFAULT TRUE,
      phone VARCHAR(10) NOT NULL UNIQUE,
      login_passcode VARCHAR(100) NOT NULL
    );

    
    INSERT INTO admin_users (phone, login_passcode)
    VALUES ('${ADMIN_USER_SIGNIN_CREDENTIALS.phone}', '${hash}')
    RETURNING *;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE IF EXISTS admin_users;
  `);
}
