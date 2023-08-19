import { Request } from "express";
import { TAdminUser, TUser } from "./users";

type TResource = "users" | "auth";
type TRequestUser = Request & { user: TUser & TAdminUser };
type TRequestTransaction = Request & {
  resource: string;
  transactionId: string;
};

export { TResource, TRequestUser, TRequestTransaction };
