import request from "supertest";
import type { Response } from "supertest";

import app from "../app";
import { TUser } from "../types/users";
import { ROUTE_PREFIX } from "../constants";

const getEndpoint = (params?: string) => {
  return `${ROUTE_PREFIX}users${params ? "/" + params : ""}`;
};

const handleCreateOneUser = async (statusCode: number, n: number = 1, payload?: Partial<TUser>): Promise<Response> => {
  const body = {
    first_name: "Test" + n,
    last_name: "Last" + n,
    phone: "123456789" + n,
    middle_name: "Hire",
    nickname: "Tire",
    email: `test${n}@gmail.com`,
    login_passcode: "123456",
    ...payload,
  };

  return await request(app()).post(getEndpoint()).send(body).expect(statusCode);
};

export { getEndpoint, handleCreateOneUser };
