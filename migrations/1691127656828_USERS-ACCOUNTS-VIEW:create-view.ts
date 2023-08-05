/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE VIEW "users_accounts" AS
    SELECT 
      users.created_at,
		  users.id AS "user_id", 
      users.email, 
      users.phone AS "account_number",

      accounts.id AS "account_id",
      accounts.balance,
      accounts.type
    FROM
      "users"
    LEFT JOIN 
      "accounts" ON accounts.user_id = users.id
    ORDER BY user_id ASC, created_at DESC, type ASC;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP VIEW "users_accounts";
  `);
}
