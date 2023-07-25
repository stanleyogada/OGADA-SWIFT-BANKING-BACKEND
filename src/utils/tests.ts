import request from "supertest";
import type { Response } from "supertest";

import app from "src/app";
import { TAdminUser, TUser } from "src/types/users";
import { ADMIN_USER_SIGNIN_CREDENTIALS, ROUTE_PREFIX } from "src/constants";

type TBody = Omit<Partial<TUser & TAdminUser & { not_allowed: string }>, "nickname" | "id">;

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

const handleSigninUser = async (statusCode: number, payload: TBody) => {
  const {
    headers,
    body: { token },
  } = await request(app()).post(getEndpoint("/auth/signin")).send(payload).expect(statusCode);

  return { token, headers };
};

const handleSigninAdminUser = async (statusCode: number = 200, payload: TBody = ADMIN_USER_SIGNIN_CREDENTIALS) => {
  const {
    headers,
    body: { token },
  } = await request(app()).post(getEndpoint("/auth/signin/admin")).send(payload).expect(statusCode);

  return {
    adminToken: token,
    adminHeaders: headers,
  };
};

export { getEndpoint, handleSignupUser, handleSigninUser, handleSigninAdminUser };
