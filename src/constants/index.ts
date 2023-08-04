const ROUTE_PREFIX = "/api/v1";

const INPUT_SCHEMA_EMAIL_ALLOW_TLDS = ["com", "net"];

const ADMIN_USER_SIGNIN_CREDENTIALS = {
  phone: "1234567890",
  login_passcode: "123456",
};

const REPO_RESOURCES = {
  users: "users",
  adminUsers: "admin_users",
  accounts: "accounts",
  otherAccounts: "other_accounts",
  usersAccounts: "users_accounts",
};

//
//

export { ROUTE_PREFIX, INPUT_SCHEMA_EMAIL_ALLOW_TLDS, ADMIN_USER_SIGNIN_CREDENTIALS, REPO_RESOURCES };
