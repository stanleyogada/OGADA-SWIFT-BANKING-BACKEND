import request from "supertest";
import type { Response } from "supertest";

import app from "../../app";
import { TAdminUser, TUser } from "../../types/users";
import { ADMIN_USER_SIGNIN_CREDENTIALS, ROUTE_PREFIX } from "../../constants";

type TBody = Omit<Partial<TUser & TAdminUser & { not_allowed: string }>, "nickname" | "id">;
type TSigninPayload = Pick<TBody, "phone" | "login_passcode"> & { not_allowed?: string };

type TSignupReturnedTUser = TUser & {
  plain_login_passcode?: string;
  plain_transfer_pin?: string;
};

const getEndpoint = (endpoint: string, params?: string) => {
  return `${ROUTE_PREFIX}${endpoint}${params ? params : ""}`;
};

const handleSignupUser = async (statusCode: number, n: number = 1, payload: TBody = {}) => {
  const body: TBody = {
    first_name: "Test" + n,
    last_name: "Last" + n,
    phone: "123456789" + n,
    middle_name: "Hire",
    email: `test${n}@gmail.com`,
    login_passcode: "123456",
    transfer_pin: "4321",
    ...payload,
  };

  const {
    body: { data },
  } = await request(app()).post(getEndpoint("/auth/signup")).send(body).expect(statusCode);

  return {
    ...(data as TUser),
    plain_login_passcode: body.login_passcode,
    plain_transfer_pin: body.transfer_pin,
  } as TSignupReturnedTUser;
};

const handleSigninUser = async (statusCode: number, payload: TSigninPayload) => {
  const {
    headers,
    body: { token },
  } = await request(app()).post(getEndpoint("/auth/signin")).send(payload).expect(statusCode);

  return { token, headers } as {
    token: string;
    headers: Response["headers"];
  };
};

const handleSigninAdminUser = async (
  statusCode: number = 200,
  payload: TSigninPayload = ADMIN_USER_SIGNIN_CREDENTIALS
) => {
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
