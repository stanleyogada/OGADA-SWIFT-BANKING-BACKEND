import { EAccountType } from "../types/accounts";

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
  usersAccounts: "users_accounts",
  transactions: "transactions",
  transactionsBanks: "transactions_banks",
  transactionsInHouse: "transactions_in_house",
  transactionsReward: "transactions_rewards",
  transactionsMobile: "transactions_mobile",
  transactionsTransactionsInHouse: "transactions_transactions_in_house",
  transactionsTransactionsBanks: "transactions_transactions_banks",
  transactionsTransactionsReward: "transactions_transactions_rewards",
  transactionsTransactionsMobile: "transactions_transactions_mobile",
  transactionsTransactionsAll: "transactions_all",
};

const ACCOUNT_DEFAULT_BALANCE = {
  [EAccountType.NORMAL]: "500.00",
  [EAccountType.CASHBACK]: "900.00",
};

const CASHBACK_MOBILE_REWARD_PERCENTAGE = 50;

const SEND_MONEY_MAGIC_FAIL_AMOUNT = 55.5;

//
//

export {
  ROUTE_PREFIX,
  INPUT_SCHEMA_EMAIL_ALLOW_TLDS,
  ADMIN_USER_SIGNIN_CREDENTIALS,
  REPO_RESOURCES,
  ACCOUNT_DEFAULT_BALANCE,
  CASHBACK_MOBILE_REWARD_PERCENTAGE,
  SEND_MONEY_MAGIC_FAIL_AMOUNT,
};
