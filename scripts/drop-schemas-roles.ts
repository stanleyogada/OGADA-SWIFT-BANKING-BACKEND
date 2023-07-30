require("dotenv").config();

import { TConnectOpts } from "../src/types/db";
import getDBConnection from "../src/utils/getDBConnection";
import pool from "../src/utils/pool";
import { ROLE_NAME_PREFIX } from "../src/utils/TestContext";

const DEFAULT_USER_OPTS: TConnectOpts = getDBConnection();

(async () => {
  try {
    await pool.connect(DEFAULT_USER_OPTS);

    const { rows } = await pool.query(`
    SELECT nspname AS schema_name
    FROM pg_namespace
    WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';
  `);

    const schemas = rows.map((row) => row.schema_name).filter((schema) => schema.startsWith(ROLE_NAME_PREFIX));
    console.log("schemas before dropping", schemas);
    // 1. Drop all schemas
    await Promise.all(schemas.map((schema) => pool.query(`DROP SCHEMA ${schema} CASCADE;`)));

    const { rows: __roles } = await pool.query(`
    SELECT rolname AS role_name
    FROM pg_roles
    WHERE rolname NOT LIKE 'pg_%' AND rolname != 'information_schema';
  `);

    const roles = __roles.map((row) => row.role_name).filter((role) => role.startsWith(ROLE_NAME_PREFIX));
    console.log("roles before dropping", roles);
    // 2. Drop all roles
    await Promise.all(roles.map((role) => pool.query(`DROP ROLE ${role};`)));

    console.log("Dropped all schemas and roles");
  } catch (err) {
    console.error("Error dropping roles and schemas", err, "Error dropping roles ans schemas");
  }
})();
