import app from "../app";
import type { TUser } from "../types/users";
import { handlePatchSetQuery, handleWhereQuery } from "../utils/handleQueryFormat";
import pool from "../utils/pool";

const handleSelectTestEnv = () => {
  if (process.env.NODE_ENV === "test") {
    return ", login_passcode, one_time_password";
  }

  return "";
};

type TEnv = "test" | "development" | "production";
type TCol = string | { env: TEnv[]; value: string };
type TResource = "users" | "accounts"; // ...
interface IRepo<T> {
  find: (payload?: Partial<T>) => Promise<T[]>;
}

class Repo<T> implements IRepo<T> {
  private selectListQuery: string;
  private cols: TCol[];
  private resource: TResource;

  private setSelectListQuery = () => {
    const cols = [];
    for (let i = 0; i < this.cols.length; i++) {
      let col = this.cols[i];
      if (typeof col !== "string" && col.env.includes(app().get("env") as TEnv)) {
        col = col.value;
      }

      if (typeof col !== "string") continue;
      cols.push(col);
    }

    this.selectListQuery = cols.join(", ");
  };

  private handleWhereListQuery = (payload: Partial<T>) => {
    if (!payload) return;

    const cols = this.cols.reduce((acc, col) => [...acc, typeof col === "string" ? col : col.value], [] as string[]);
    const { q, queryDeps } = handleWhereQuery(payload, cols);

    return {
      query: q,
      queryDependencies: queryDeps,
    };
  };

  constructor(resource: TResource, cols: Repo<T>["cols"]) {
    this.selectListQuery = null;
    this.cols = cols;
    this.resource = resource;
  }

  async find(payload?: Partial<T>) {
    this.setSelectListQuery();
    const where = this.handleWhereListQuery(payload);

    const { rows } = await pool.query(
      `
      SELECT
      ${this.selectListQuery}
      FROM ${this.resource}
      ${payload ? `WHERE ${where?.query}` : ""}
      ;
    `,
      where?.queryDependencies
    );

    return rows as T[];
  }
}

const repo = new Repo<TUser>("users", [
  "id",
  "created_at",
  "updated_at",
  "first_name",
  "last_name",
  "middle_name",
  "nickname",
  "email",
  "phone",
  { env: ["test"], value: "one_time_password" },
  { env: ["test"], value: "login_passcode" },
]);
class UserRepo {
  static async find() {
    const rows = await repo.find();
    return rows;
  }

  static async findBy(payload: Partial<TUser>) {
    const rows = await repo.find(payload);
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
        ${handleSelectTestEnv()}
      FROM users
      WHERE users.id = $1;
    `,
      [id]
    );

    return rows[0];
  }

  static async findOneByEmailAndPhone({ email, phone }: Pick<TUser, "email" | "phone">) {
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
        ${handleSelectTestEnv()}
      FROM users
      WHERE email = $1 AND phone = $2;
    `,
      [email, phone]
    );

    return rows[0];
  }

  static async findOneByOTP(OTP: string) {
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
        ${handleSelectTestEnv()}
      FROM users
      WHERE one_time_password = $1;
    `,
      [OTP]
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
        ${handleSelectTestEnv()};
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
    payload: Partial<Pick<TUser, "nickname" | "email" | "one_time_password" | "login_passcode">>
  ) {
    const { q, queryDeps } = handlePatchSetQuery(id, payload, [
      "email",
      "nickname",
      "one_time_password",
      "login_passcode",
    ]);

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
        ${handleSelectTestEnv()};
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
        ${handleSelectTestEnv()};
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
