/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

/*
TABLE transactions {
  id SERIAL [PK]
  created_at TIMESTAMP [note: 'WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP']

  transactions_number VARCHAR(50) [NOT NULL, UNIQUE]
  is_deposit BOOLEAN
  is_owealth BOOLEAN
  is_success BOOLEAN
  amount DECIMAL(15, 2) [NOT NULL]
  charge DECIMAL(15, 2) [NOT NULL]

  account_id INTEGER [ref: > accounts.id, UNIQUE, note: 'ON DELETE CASCADE']
  other_account_id INTEGER [ref: > accounts.id, UNIQUE, note: 'ON DELETE CASCADE']

   note: '
-- either for accounts or other_accounts
    CHECK(
      COALESCE((account_id)::BOOLEAN::INTEGER, 0)
      +
      COALESCE((other_account_id)::BOOLEAN::INTEGER, 0)
      = 1
    )
  '
}
*/

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

      transactions_number VARCHAR(50) NOT NULL UNIQUE,
      is_deposit BOOLEAN NOT NULL,
      is_owealth BOOLEAN NOT NULL,
      is_success BOOLEAN NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      charge DECIMAL(15, 2) NOT NULL,

      account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
      other_account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,

      CHECK(
        COALESCE((account_id)::BOOLEAN::INTEGER, 0)
        +
        COALESCE((other_account_id)::BOOLEAN::INTEGER, 0)
        = 1
      )
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
