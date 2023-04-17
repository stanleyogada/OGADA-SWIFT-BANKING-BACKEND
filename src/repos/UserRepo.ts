import type { TUser } from "../types/users";
import Repo from "./Repo";

const repo = new Repo<TUser>("users", [
  "id",
  "created_at",
  "updated_at",
  "first_name",
  "last_name",
  "middle_name",
  "nickname",
  "email",
  "phone",
  { env: ["test"], value: "one_time_password" },
  { env: ["test"], value: "login_passcode" },
]);
class UserRepo {
  static async find(payload?: Partial<TUser>) {
    const rows = await repo.findMany(payload);
    return rows;
  }

  static async findOne(payload?: Partial<TUser>) {
    const rows = await repo.findMany(payload);
    return rows[0];
  }

  static async createOne(payload: TUser) {
    const row = await repo.createOne(payload);

    return row;
  }

  static async findOneByAndUpdate(
    findByPayload: Partial<TUser>,
    updatePayload: Partial<Pick<TUser, "nickname" | "email" | "one_time_password" | "login_passcode">>
  ) {
    const rows = await repo.findManyByAndUpdate(findByPayload, updatePayload);
    return rows[0];
  }

  static async deleteOneById(payload: Partial<TUser>) {
    const rows = await repo.deleteManyBy(payload);
    return rows[0];
  }

  static async count() {
    return await repo.count();
  }
}

export default UserRepo;
