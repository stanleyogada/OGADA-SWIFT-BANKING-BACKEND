import { Request } from "express";
import { TUser } from "./users";

type TResource = "users" | "auth";
type TRequestUser = Request & { user: TUser };

export { TResource, TRequestUser };
