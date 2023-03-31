import type { TUser } from "../types/users";
import handlePatchSetQuery from "../utils/handlePatchSetQuery";
import pool from "../utils/pool";

const handleSelectLoginPasscode = () => {
  if (process.env.NODE_ENV === "test") {
    return ", login_passcode";
  }

  return "";
};

class UserRepo {
  static async find() {
    const { rows } = await pool.query(`
      SELECT 
        id,
        created_at,
        updated_at,
        first_name,
        last_name,
        middle_name,
        nickname,
        email
        ${handleSelectLoginPasscode()}
      FROM users;
    `);

    return rows;
  }

  static async findOneById(id: string) {
    const { rows } = await pool.query(
      `
      SELECT id,
        created_at,
        updated_at,
        first_name,
        last_name,
        middle_name,
        nickname,
        email
        ${handleSelectLoginPasscode()}
      FROM users
      WHERE users.id = $1;
    `,
      [id]
    );

    return rows[0];
  }

  static async createOne(payload: TUser) {
    const { rows } = await pool.query(
      `
      INSERT INTO users (
        first_name,
        last_name,
        middle_name,
        nickname,
        phone,
        email,
        login_passcode
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id,
        created_at,
        updated_at,
        first_name,
        last_name,
        middle_name,
        nickname,
        email
        ${handleSelectLoginPasscode()};
    `,
      [
        payload.first_name,
        payload.last_name,
        payload.middle_name,
        payload.nickname,
        payload.phone,
        payload.email,
        payload.login_passcode,
      ]
    );

    return rows[0];
  }

  static async updateOneById(id: string, payload: Partial<Pick<TUser, "nickname" | "email">>) {
    const { q, queryDeps } = handlePatchSetQuery(id, payload, ["email", "nickname"]);

    const { rows } = await pool.query(
      `
      UPDATE users
      SET ${q}
      WHERE users.id = $1
      RETURNING id,
        created_at,
        updated_at,
        first_name,
        last_name,
        middle_name,
        nickname,
        email
        ${handleSelectLoginPasscode()};
    `,
      queryDeps
    );

    return rows[0];
  }

  static async deleteOneById(id: string) {
    const { rows } = await pool.query(
      `
      DELETE FROM users
      WHERE users.id = $1
      RETURNING id,
        created_at,
        updated_at,
        first_name,
        last_name,
        middle_name,
        nickname,
        email
        ${handleSelectLoginPasscode()};
    `,
      [id]
    );

    return rows[0];
  }

  static async count() {
    const { rows } = await pool.query(`SELECT COUNT(*) FROM users;`);

    return +rows[0].count;
  }
}

export default UserRepo;
