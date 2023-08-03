import { TConnectOpts } from "../types/db";
import { ROLE_NAME_PREFIX } from "./TestContext";
import getDBConnection from "./getDBConnection";
import pool from "./pool";

const handleDropSchemaRoles = async (isTest: boolean = true) => {
  const userOpts: TConnectOpts = getDBConnection(isTest);
  await pool.connect(userOpts);

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
};

export default handleDropSchemaRoles;
