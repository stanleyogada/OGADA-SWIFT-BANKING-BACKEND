require("dotenv").config();

import app from "./app";
import pool from "./utils/pool";
import throwErrorDBConnection from "./utils/getDBConnection";
import getDBConnection from "./utils/getDBConnection";
import { TConnectOpts } from "./types/db";

const PORT = process.env.NODE_ENV;
const DEFAULT_USER_ROLE_OPTS: TConnectOpts = getDBConnection();

throwErrorDBConnection();
(async () => {
  try {
    await pool.connect(DEFAULT_USER_ROLE_OPTS);

    console.log("Connected to the DB successfully!");
    app().listen(PORT, () => console.log("Server running @ port " + PORT));
  } catch (err) {
    console.error(err.message, "An error occurred connecting to the DB!");
  }
})();
