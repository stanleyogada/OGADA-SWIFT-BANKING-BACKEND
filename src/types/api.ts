import { Request } from "express";
import { TAdminUser, TUser } from "./users";

type TResource = "users" | "auth";
type TRequestUser = Request & { user: TUser & TAdminUser };

export { TResource, TRequestUser };
