import app from "../app";
import { handleWhereQuery, handlePatchSetQuery } from "../utils/handleQueryFormat";
import pool from "../utils/pool";

type TEnv = "test" | "development" | "production";
type TCol = string | { env: TEnv[]; value: string };
type TResource = "users" | "accounts"; // ...
interface IRepo<T> {
  find: (payload?: Partial<T>) => Promise<T[]>;
  findByAndUpdate: (findByPayload: Partial<T>, updatePayload: Partial<T>) => Promise<T[]>;
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

  private handleSetListQuery = (excludePayloadCols: Array<string>, payload: Partial<T>) => {
    if (!payload) return;

    const cols = this.cols.reduce((acc, col) => [...acc, typeof col === "string" ? col : col.value], [] as string[]);
    // const { q, queryDeps } = handlePatchSetQuery(excludePayloadCols, payload, cols);

    return {
      // query: q,
      // queryDependencies: queryDeps,
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
      SELECT ${this.selectListQuery}
      FROM ${this.resource}
      ${payload ? `WHERE ${where?.query}` : ""}
      ;
    `,
      where?.queryDependencies
    );

    return rows as T[];
  }

  async findByAndUpdate(findPayload: Partial<T>, updatePayload: Partial<T>) {
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
}

export default Repo;
