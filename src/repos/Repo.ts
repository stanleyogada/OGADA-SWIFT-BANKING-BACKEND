import app from "../app";
import { handleWhereQuery, handlePatchSetQuery, handleInsertQuery } from "../utils/handleQueryFormat";
import pool from "../utils/pool";

type TEnv = "test" | "development" | "production";
type TCol = string | { env: TEnv[]; value: string };
type TResource = "users" | "accounts"; // TODO: add more as migration tables are added ...
interface IRepo<T> {
  findManyBy: (payload?: Partial<T>) => Promise<T[]>;
  findManyByAndUpdate: (findByPayload: Partial<T>, updatePayload: Partial<T>) => Promise<T[]>;
  count: () => Promise<number>;
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

  async findManyBy(payload?: Partial<T>) {
    this.setSelectListQuery();
    const where = this.handleWhereListQuery(payload);

    const { rows } = await pool.query(
      `
      SELECT ${this.selectListQuery}
      FROM ${this.resource}
      ${payload ? `WHERE ${where?.query}` : ""}
      ;
    `,
      where?.queryDependencies
    );

    return rows as T[];
  }

  async findManyByAndUpdate(findPayload: Partial<T>, updatePayload: Partial<T>) {
    this.setSelectListQuery();
    const { queryDependencies, whereQuery, setQuery } = handlePatchSetQuery(findPayload, updatePayload);

    const { rows } = await pool.query(
      `
        UPDATE users
        SET ${setQuery}
        WHERE ${whereQuery}
        RETURNING ${this.selectListQuery}
        ;
      `,
      queryDependencies
    );

    return rows as T[];
  }

  async deleteManyBy(payload: Partial<T>) {
    this.setSelectListQuery();
    const where = this.handleWhereListQuery(payload);

    const { rows } = await pool.query(
      `
      DELETE FROM ${this.resource}
      WHERE ${where.query}
      RETURNING ${this.selectListQuery}
      ;
    `,
      where.queryDependencies
    );

    return rows as T[];
  }

  async createOne(payload: Partial<T>) {
    this.setSelectListQuery();
    const insert = handleInsertQuery(payload);

    const { rows } = await pool.query(
      `
      INSERT INTO ${this.resource} 
      ${insert.query}
      RETURNING ${this.selectListQuery}
      ;
    `,
      insert.queryDependencies
    );

    return rows[0] as T;
  }

  async count() {
    const { rows } = await pool.query(`SELECT COUNT(*) FROM ${this.resource}`);
    return +rows[0].count;
  }
}

export default Repo;
