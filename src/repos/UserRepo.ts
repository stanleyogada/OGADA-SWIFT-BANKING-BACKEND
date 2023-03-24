import pool from "../utils/pool";

type TUser = {
  id: number;
  created_at: Date;
  updated_at: Date;
  first_name: string;
  last_name: string;
  middle_name?: string;
  nickname?: string;
  phone: string;
  email: string;
  email_is_verified?: boolean;
  login_passcode: string;
};

class UserRepo {
  static async find() {
    const { rows } = await pool.query(`
      SELECT *
      FROM users;
    `);

    return rows;
  }

  static async findOneById(id: string) {
    const { rows } = await pool.query(
      `
      SELECT *
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
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
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

  static async updateOneById(
    id: string,
    payload: Partial<Pick<TUser, "nickname" | "email">>
  ) {
    const payloadCols = ["email", "nickname"];

    const handleSet = () => {
      return payloadCols
        .map((col, i) => {
          if (!payload[col]) return "";

          const isLastCol = i + 1 === payloadCols.length;
          let q = `${col} = ${`$${i + 1}`}`;

          if (col === "email") {
            q += `, email_is_verified = false`;
          }

          q += `${!isLastCol ? ", " : ""}`;
          // q += `, `;
          return q;
        })
        .join("");
    };

    const getQueryDeps = () => {
      return [...payloadCols.map((col) => payload[col]), +id];
    };

    console.log(
      `
      UPDATE users
      SET ${handleSet()}
      WHERE users.id = $${payloadCols.length + 1}
      RETURNING *;
    `,
      getQueryDeps()
    );

    const { rows } = await pool.query(
      `
      UPDATE users
      SET ${handleSet()}
      WHERE users.id = $${payloadCols.length + 1}
      RETURNING *;
    `,
      getQueryDeps()
    );

    return rows[0];
  }

  static async deleteOneById(id: string) {
    const { rows } = await pool.query(
      `
      DELETE FROM users
      WHERE users.id = $1
      RETURNING *;
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
