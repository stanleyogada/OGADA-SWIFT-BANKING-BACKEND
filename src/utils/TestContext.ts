import migrate from "node-pg-migrate";
import format from "pg-format";
import { randomBytes } from "crypto";

import { TConnectOpts } from "src/types/db";
import pool from "./pool";
import getDBConnection from "./getDBConnection";

//

interface IContext {
  destroy: () => Promise<void>;
  reset: () => Promise<void>;
}

const DEFAULT_USER_ROLE_OPTS: TConnectOpts = getDBConnection(true);
const ROLE_NAME_PREFIX = "test9role";
class TestContext implements IContext {
  static async build() {
    try {
      const roleName: string = `${ROLE_NAME_PREFIX}${randomBytes(4).toString("hex")}`;
      // 1. Connect with default user-role && Create a new user-role && Create a new schema
      await pool.connect(DEFAULT_USER_ROLE_OPTS);
      await pool.query(format("CREATE ROLE %I WITH LOGIN PASSWORD %L", roleName, roleName));
      await pool.query(format("GRANT %I TO %I;", roleName, DEFAULT_USER_ROLE_OPTS.user));
      await pool.query(format("CREATE SCHEMA %I AUTHORIZATION %I", roleName, roleName));

      // 2. Disconnect the default user-role
      await pool.disconnect();

      // 3. Run migrations in the new schema && Connect as the new user-role
      const newUserRoleOpts = {
        ...DEFAULT_USER_ROLE_OPTS,
        user: roleName,
        password: roleName,
      };
      await migrate({
        schema: roleName,
        noLock: true,
        dir: "migrations",
        direction: "up",
        migrationsTable: "pgmigrations",
        log: () => {},
        databaseUrl: newUserRoleOpts,
      });
      await pool.connect(newUserRoleOpts);

      return new TestContext(roleName);
    } catch (err) {
      console.error(err, err.message);
    }
  }

  private roleName: string = null;
  constructor(roleName: string) {
    this.roleName = roleName;
  }

  async destroy() {
    try {
      // 1. Disconnect the new user-role && Connect with default user-role
      await pool.disconnect();
      await pool.connect(DEFAULT_USER_ROLE_OPTS);

      // 2. Delete the new user-role and schema
      await pool.query(format("DROP SCHEMA %I CASCADE", this.roleName));
      await pool.query(format("DROP OWNED BY %I CASCADE", this.roleName));
      await pool.query(format("DROP ROLE %I", this.roleName));

      // 3. Finally disconnect the default user
      await pool.disconnect();
    } catch (err) {
      console.error(err, err.message);
    }
  }

  async reset() {
    await pool.query(`
      DELETE FROM users;
      `);
  }
}

export default TestContext;
export { ROLE_NAME_PREFIX };
