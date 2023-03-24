import app from "./app";
import pool from "./utils/pool";

const PORT = process.env.NODE_ENV || 8080;

(async () => {
  try {
    await pool.connect({
      database: "opay-demo",
      host: "localhost",
      user: "stanleyogada",
      port: 5432,
    });

    console.log("Connected to the DB successfully!");
    app().listen(PORT, () => console.log("Server running @ port " + PORT));
  } catch (err) {
    console.error(err.message, "An error occurred connecting to the DB!");
  }
})();
