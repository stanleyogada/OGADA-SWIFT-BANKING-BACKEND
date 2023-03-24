import pg from "pg";
import type { Pool as PGPool, QueryResult } from "pg";
import { TConnectOpts } from "../types/db";

interface IPool {
  getPool: () => PGPool;
  connect: (opts: TConnectOpts) => Promise<QueryResult<unknown>>;
  disconnect: () => Promise<void>;
  query: (sql: string, deps?: string[]) => Promise<unknown>;
}

class Pool implements IPool {
  private _pool: PGPool = null;

  getPool() {
    return this._pool;
  }

  async connect(opts: TConnectOpts) {
    this._pool = new pg.Pool(opts);
    return await this._pool.query("SELECT 1 + 1");
  }

  async disconnect() {
    return await this._pool.end();
  }

  async query(sql: string, deps?: string[]) {
    return await this._pool.query(sql, deps);
  }
}

export default new Pool();
