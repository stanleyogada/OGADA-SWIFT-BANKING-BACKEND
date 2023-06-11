const getDBConnection = (isTestEnv?: boolean) => {
  const databaseName = isTestEnv ? process.env.DATABASE_NAME_TEST_ENV : process.env.DATABASE_NAME;

  const databaseConnectionList = [
    process.env.DATABASE_HOST,
    process.env.DATABASE_PORT,
    process.env.DATABASE_USER,
    databaseName,
  ];
  // Throw error if either env var is not set
  if (databaseConnectionList.every(Boolean) === false) {
    throw new Error("Database connection error! One or more env vars are not set!");
  }

  return {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT as unknown as number,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: databaseName,
  };
};

export default getDBConnection;
