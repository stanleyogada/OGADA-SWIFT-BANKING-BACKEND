import { REPO_RESOURCES } from "../constants";
import Repo from "./Repo";

import type { TUser, TUserAccount } from "../types/users";

const repo = new Repo<TUser>(REPO_RESOURCES.users, [
  "id",
  "created_at",
  "updated_at",
  "first_name",
  "last_name",
  "middle_name",
  "nickname",
  "email",
  "email_is_verified",
  "phone",
  { env: ["test"], value: "one_time_password" },
  { env: ["test"], value: "login_passcode" },
  { env: ["test"], value: "transfer_pin" },
]);

const userAccountRepo = new Repo<TUserAccount>(REPO_RESOURCES.usersAccounts, [
  "user_id",
  "email",
  "account_number",
  "account_id",
  "balance",
  "type",
]);

class UserRepo {
  static async findManyBy(payload?: Partial<TUser>) {
    const rows = await repo.findManyBy(payload);
    return rows;
  }

  static async findOneBy(payload?: Partial<TUser>, returnCols?: Repo<TUser>["cols"]) {
    const rows = await repo.findManyBy(payload, returnCols);
    return rows[0];
  }

  static async createOne(payload: TUser, returnCols?: Repo<TUser>["cols"]) {
    const row = await repo.createOne(payload, returnCols);
    return row;
  }

  static async findOneByAndUpdate(
    findByPayload: Partial<TUser>,
    updatePayload: Partial<
      Pick<TUser, "nickname" | "email" | "email_is_verified" | "one_time_password" | "login_passcode">
    >,
    returnCols?: Repo<TUser>["cols"]
  ) {
    const rows = await repo.findManyByAndUpdate(findByPayload, updatePayload, returnCols);
    return rows[0];
  }

  static async deleteOneById(id: string, returnCols?: Repo<TUser>["cols"]) {
    const payload: Partial<TUser> = { id: +id };

    const rows = await repo.deleteManyBy(payload, returnCols);
    return rows[0];
  }

  static async count() {
    return await repo.count();
  }

  static async findAllAccountsByUserId(user_id: number) {
    const rows = await userAccountRepo.findManyBy({ user_id });
    return rows;
  }
}

export default UserRepo;
