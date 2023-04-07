import type { TUser } from "../types/users";
import { handlePatchSetQuery } from "../utils/handleQueryFormat";
import pool from "../utils/pool";
import Repo from "./Repo";

const handleSelectTestEnv = () => {
  if (process.env.NODE_ENV === "test") {
    return ", login_passcode, one_time_password";
  }

  return "";
};

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
    const rows = await repo.find(payload);
    return rows;
  }

  static async findOne(payload?: Partial<TUser>) {
    const rows = await repo.find(payload);
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
    const rows = await repo.findByAndUpdate(findByPayload, updatePayload);
    return rows[0];
  }

  static async deleteOneById(payload: Partial<TUser>) {
    const rows = await repo.deleteBy(payload);
    return rows[0];
  }

  static async count() {
    const { rows } = await pool.query(`SELECT COUNT(*) FROM users;`);
    return +rows[0].count;
  }
}

export default UserRepo;
