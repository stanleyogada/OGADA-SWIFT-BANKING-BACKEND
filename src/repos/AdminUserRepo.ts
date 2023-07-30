import type { TAdminUser } from "src/types/users";
import Repo from "./Repo";
import { REPO_RESOURCES } from "src/constants";

const repo = new Repo<TAdminUser>(REPO_RESOURCES.adminUsers, [
  "id",
  "created_at",
  "updated_at",
  "is_admin_user",
  "phone",
  { env: ["test"], value: "login_passcode" },
]);

class AdminUserRepo {
  static async findOneBy(payload?: Partial<TAdminUser>, returnCols?: Repo<TAdminUser>["cols"]) {
    const rows = await repo.findManyBy(payload, returnCols);
    return rows[0];
  }

  static async createOne(payload: Pick<TAdminUser, "login_passcode" | "phone">, returnCols?: Repo<TAdminUser>["cols"]) {
    const row = await repo.createOne(payload, returnCols);

    return row;
  }
}

export default AdminUserRepo;
