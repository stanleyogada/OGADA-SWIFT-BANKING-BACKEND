import request from "supertest";
import type { Response } from "supertest";

import app from "../app";
import { TUser } from "../types/users";
import { ROUTE_PREFIX } from "../constants";

type TBody = Omit<Partial<TUser>, "nickname" | "id">;

const getEndpoint = (endpoint: string, params?: string) => {
  return `${ROUTE_PREFIX}${endpoint}${params ? params : ""}`;
};

const handleSignupUser = async (statusCode: number, n: number = 1, payload: TBody = {}): Promise<Response> => {
  const body: TBody = {
    first_name: "Test" + n,
    last_name: "Last" + n,
    phone: "123456789" + n,
    middle_name: "Hire",
    email: `test${n}@gmail.com`,
    login_passcode: "123456",
    ...payload,
  };

  return await request(app()).post(getEndpoint("/auth/signup")).send(body).expect(statusCode);
};

export { getEndpoint, handleSignupUser };
