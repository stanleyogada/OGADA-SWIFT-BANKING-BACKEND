import app from "src/app";
import { handleWhereQuery, handlePatchSetQuery, handleInsertQuery } from "src/utils/handleQueryFormat";
import pool from "src/utils/pool";

type TEnv = "test" | "development" | "production";
type TCol = string | { env: TEnv[]; value: string };
type TResource = "users" | "admin_users"; // TODO: add more as migration tables are added ...
interface IRepo<T> {
  findManyBy: (payload?: Partial<T>) => Promise<T[]>;
  findManyByAndUpdate: (findByPayload: Partial<T>, updatePayload: Partial<T>) => Promise<T[]>;
  deleteManyBy: (payload: Partial<T>) => Promise<T[]>;
  createOne: (Payload: Partial<T>) => Promise<T>;
  count: () => Promise<number>;
}

class Repo<T> implements IRepo<T> {
  private selectListQuery: string;
  private selectListQueryReturnColsQuery: string = "";
  private cols: TCol[];
  private resource: TResource;

  private setSelectListQuery = (returnCols?: Repo<T>["cols"]) => {
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

    if (returnCols) {
      this.selectListQueryReturnColsQuery = `, ${returnCols.join(", ")}`;
    }
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

  async findManyBy(payload?: Partial<T>, returnCols?: Repo<T>["cols"]) {
    this.setSelectListQuery(returnCols);
    const where = this.handleWhereListQuery(payload);

    const { rows } = await pool.query(
      `
      SELECT ${this.selectListQuery}${this.selectListQueryReturnColsQuery}
      FROM ${this.resource}
      ${payload ? `WHERE ${where?.query}` : ""}
      ;
    `,
      where?.queryDependencies
    );

    return rows as T[];
  }

  async findManyByAndUpdate(findPayload: Partial<T>, updatePayload: Partial<T>, returnCols?: Repo<T>["cols"]) {
    this.setSelectListQuery(returnCols);
    const { queryDependencies, whereQuery, setQuery } = handlePatchSetQuery(findPayload, updatePayload);

    const { rows } = await pool.query(
      `
        UPDATE users
        SET ${setQuery}
        WHERE ${whereQuery}
        RETURNING ${this.selectListQuery}${this.selectListQueryReturnColsQuery}
        ;
      `,
      queryDependencies
    );

    return rows as T[];
  }

  async deleteManyBy(payload: Partial<T>, returnCols?: Repo<T>["cols"]) {
    this.setSelectListQuery(returnCols);
    const where = this.handleWhereListQuery(payload);

    const { rows } = await pool.query(
      `
      DELETE FROM ${this.resource}
      WHERE ${where.query}
      RETURNING ${this.selectListQuery}${this.selectListQueryReturnColsQuery}
      ;
    `,
      where.queryDependencies
    );

    return rows as T[];
  }

  async createOne(payload: Partial<T>, returnCols?: Repo<T>["cols"]) {
    this.setSelectListQuery(returnCols);
    const insert = handleInsertQuery(payload);

    const { rows } = await pool.query(
      `
      INSERT INTO ${this.resource} 
      ${insert.query}
      RETURNING ${this.selectListQuery}${this.selectListQueryReturnColsQuery}
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
