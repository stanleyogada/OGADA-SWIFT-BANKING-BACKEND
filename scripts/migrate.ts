require("dotenv").config();

import migrate from "node-pg-migrate";
import { TConnectOpts } from "../src/types/db";
import getDBConnection from "../src/utils/getDBConnection";
import pool from "../src/utils/pool";

const DEFAULT_USER_OPTS: TConnectOpts = getDBConnection();

(async () => {
  try {
    const flags = process.argv.slice(2);

    const direction = (() => {
      if (flags.includes("up")) return "up";
      if (flags.includes("down")) return "down";
      if (flags.includes("down-all")) return "down-all";

      throw new Error('Please specify "up" OR "down" OR "down-all"');
    })();

    const runMigration = async () => {
      const results = await migrate({
        dir: "migrations",
        direction: direction.replace("-all", "") as "up" | "down",
        migrationsTable: "pgmigrations",
        log: (msg: string) => {
          console.log("Migration message", msg);
        },
        databaseUrl: DEFAULT_USER_OPTS,
      });

      console.log("Migration complete", results);
    };

    if (direction === "down-all") {
      await pool.connect(DEFAULT_USER_OPTS);
      const { rows } = await pool.query("SELECT * FROM pgmigrations;");

      for (const _ of rows) {
        await runMigration();
      }

      return;
    }

    await runMigration();
  } catch (err) {
    console.error("Error running migration", err, "Error running migration");
  }
})();
