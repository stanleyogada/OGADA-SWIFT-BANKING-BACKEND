import request from "supertest";

import app from "../../app";
import { TUser } from "../../types/users";
import HashPassword from "../../utils/HashPassword";
import { getEndpoint, handleCreateOneUser } from "../../utils/tests";

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
      .post("/api/v1/auth/forgot-login-passcode")
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
      .post("/api/v1/auth/forgot-login-passcode")
      .send({ email: "test2@gmail.com", phone: "1234567891" })
      .expect(404);
    await request(app())
      .post("/api/v1/auth/forgot-login-passcode")
      .send({ email: payload.email, phone: "1234562342" })
      .expect(404);

    await request(app())
      .post("/api/v1/auth/reset-login-passcode")
      .send({
        new_login_passcode: newLoginPasscode,
        one_time_password: body.data,
      })
      .expect(200);

    getOneRes = await request(app()).get(getEndpoint(`${id}`));
    expect(getOneRes.body.data.one_time_password).toBeNull();
    await handleExpectPasscodeHashing(newLoginPasscode, getOneRes.body.data.login_passcode);
  });
});
