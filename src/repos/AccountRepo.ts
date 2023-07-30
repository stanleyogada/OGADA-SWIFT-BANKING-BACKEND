import { REPO_RESOURCES } from "../constants";
import Repo from "./Repo";

import type { TAccount, TOtherAccount } from "../types/accounts";

const account = new Repo<TAccount>(REPO_RESOURCES.accounts, [
  "id",
  "balance",
  "account_number",
  "transfer_pin",
  "user_id",
]);

const otherAccount = new Repo<TOtherAccount>(REPO_RESOURCES.otherAccounts, ["id", "type", "balance", "account_id"]);

class AccountRepo {}

class OtherAccountRepo {}

export { AccountRepo, OtherAccountRepo };
