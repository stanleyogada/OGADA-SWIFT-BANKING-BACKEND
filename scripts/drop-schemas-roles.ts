require("dotenv").config();

import handleDropSchemaRoles from "../src/utils/handleDropSchemaRoles";

(async () => {
  try {
    const flags = process.argv.slice(2);

    const isTestEnv = (() => {
      if (flags.includes("test")) return true;
      if (flags.includes("prod-dev")) return false;

      throw new Error('Please specify "test" or "prod-dev"');
    })();

    await handleDropSchemaRoles(isTestEnv);
  } catch (err) {
    console.error("Error dropping roles and schemas", err, "Error dropping roles ans schemas");
  }
})();
