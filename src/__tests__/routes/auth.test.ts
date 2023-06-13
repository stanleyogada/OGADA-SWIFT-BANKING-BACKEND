import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app";
import { TUser } from "../../types/users";
import HashPassword from "../../utils/HashPassword";
import { getEndpoint, handleCreateOneUser } from "../../utils/tests";
import { ROUTE_PREFIX } from "../../constants";

describe("Auth", () => {
  const handleExpectPasscodeHashing = async (loginPasscode: string, hashedLoginPasscode: string) => {
    expect(hashedLoginPasscode).not.toBeUndefined();
    expect(hashedLoginPasscode).not.toBe(loginPasscode);
    expect(await HashPassword.handleCheck(loginPasscode, hashedLoginPasscode)).toBe(true);
  };

  test("Hashing `login_passcode` should be working as expected!", async () => {
    const id = 1;
    const login_passcode = "123456";
    await handleCreateOneUser(201, id, { login_passcode });

    const { body } = await request(app()).get(getEndpoint(`${id}`));
    await handleExpectPasscodeHashing(login_passcode, body.data.login_passcode);
  });

  test("Have forget/reset `login_passcode` flow completed without errors", async () => {
    const id = 1;
    const oldLoginPasscode = "123456";
    const newLoginPasscode = "654321";
    const payload: Partial<TUser> = {
      email: "test@gmail.com",
      phone: "1234567890",
      login_passcode: oldLoginPasscode,
    };

    await handleCreateOneUser(201, id, payload);

    let getOneRes = await request(app()).get(getEndpoint(`${id}`));
    expect(getOneRes.body.data.one_time_password).toBeNull();

    await handleExpectPasscodeHashing(oldLoginPasscode, getOneRes.body.data.login_passcode);

    const { body } = await request(app())
      .post(ROUTE_PREFIX + "auth/forgot-login-passcode")
      .send(
        (() => {
          const p = { ...payload };
          delete p.login_passcode;
          return p;
        })()
      )
      .expect(200);
    getOneRes = await request(app()).get(getEndpoint(`${id}`));
    expect(getOneRes.body.data.one_time_password).toBe(body.data);

    await request(app())
      .post(ROUTE_PREFIX + "auth/forgot-login-passcode")
      .send({ email: "test2@gmail.com", phone: "1234567891" })
      .expect(404);
    await request(app())
      .post(ROUTE_PREFIX + "auth/forgot-login-passcode")
      .send({ email: payload.email, phone: "1234562342" })
      .expect(404);

    await request(app())
      .post(ROUTE_PREFIX + "auth/reset-login-passcode")
      .send({
        new_login_passcode: newLoginPasscode,
        one_time_password: body.data,
      })
      .expect(200);

    getOneRes = await request(app()).get(getEndpoint(`${id}`));
    expect(getOneRes.body.data.one_time_password).toBeNull();
    await handleExpectPasscodeHashing(newLoginPasscode, getOneRes.body.data.login_passcode);
  });

  test("Have login flow completed without errors", async () => {
    const userNameSuffix = 100;
    const user = {
      phone: "1234567891",
      login_passcode: "654321",
    };

    await handleCreateOneUser(201, userNameSuffix, user);

    await request(app())
      .post(ROUTE_PREFIX + "auth/signin")
      .send({ phone: "9012343203", login_passcode: user.login_passcode })
      .expect(401);

    await request(app())
      .post(ROUTE_PREFIX + "auth/signin")
      .send({ phone: user.phone, login_passcode: "123456" })
      .expect(401);

    const {
      headers,
      body: { token },
    } = await request(app())
      .post(ROUTE_PREFIX + "auth/signin")
      .send(user)
      .expect(200);

    // Assert that the token is valid
    const decodedUser: TUser & { exp: number; iat: number } = jwt.verify(token, process.env.JWT_PRIVATE_SECRET_KEY);
    expect(token).toBeTruthy();
    expect(decodedUser.first_name.includes(`${userNameSuffix}`)).toEqual(true);
    expect(decodedUser.last_name.includes(`${userNameSuffix}`)).toEqual(true);
    expect(decodedUser.email.includes(`${userNameSuffix}`)).toEqual(true);

    // Assert that the cookie is set
    const cookie = headers["set-cookie"]?.[0];
    expect(headers["set-cookie"]).toBeDefined();
    expect(cookie).toMatch(/token=.+/);

    // Assert that the cookie expires in 10 minutes
    const cookieExpiresIn = new Date(cookie?.split(";")[1].split("=")[1]);
    expect(cookieExpiresIn.getTime() - new Date().getTime()).toBeLessThanOrEqual(10 * 60 * 1000);

    // Assert that the jwt token expires in 10 minutes
    expect(decodedUser.exp - decodedUser.iat).toBe(10 * 60);
  });
});
