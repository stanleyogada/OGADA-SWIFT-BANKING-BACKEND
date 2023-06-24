require("dotenv").config();

import migrate from "node-pg-migrate";
import { TConnectOpts } from "../src/types/db";
import getDBConnection from "../src/utils/getDBConnection";

const DEFAULT_USER_OPTS: TConnectOpts = getDBConnection();

(async () => {
  try {
    const flags = process.argv.slice(2);

    const direction = (() => {
      if (flags.includes("up")) return "up";
      if (flags.includes("down")) return "down";

      throw new Error('Please specify "--up" or "--down"');
    })();

    const results = await migrate({
      dir: "migrations",
      direction,
      migrationsTable: "pgmigrations",
      log: (msg: string) => {
        console.log("Migration message", msg);
      },
      databaseUrl: DEFAULT_USER_OPTS,
    });

    console.log("Migration complete", results);
  } catch (err) {
    console.error("Error running migration", err, "Error running migration");
  }
})();
