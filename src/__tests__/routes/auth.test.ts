import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app";
import HashPassword from "../../utils/HashPassword";
import { getEndpoint, handleSigninAdminUser, handleSigninUser, handleSignupUser } from "../../utils/tests";
import { ACCOUNT_DEFAULT_BALANCE, DEFAULT_USER_SIGNIN_CREDENTIALS } from "../../constants";

import type { TUser, TUserAccount } from "../../types/users";
import { EAccountType } from "../../types/accounts";

const handleSignOut = async () => {
  const { headers } = await request(app()).get(getEndpoint("/auth/signout")).expect(200);

  // Assert the 'Set-Cookie' header to ensure the token cookie is cleared
  const cookieHeader = headers["set-cookie"];
  expect(cookieHeader).toBeDefined();
  expect(cookieHeader[0]).toContain("token=;"); // Check if token cookie is empty
};

describe("Auth", () => {
  const handleExpectPasscodeHashing = async (loginPasscode: string, hashedLoginPasscode: string) => {
    expect(hashedLoginPasscode).not.toBeUndefined();
    expect(hashedLoginPasscode).not.toBe(loginPasscode);
    expect(await HashPassword.handleCheck(loginPasscode, hashedLoginPasscode)).toBe(true);
  };

  test("Hashing `login_passcode` should be working as expected!", async () => {
    const { adminToken } = await handleSigninAdminUser();

    const id = 1;

    const user = {
      phone: "1234567890",
      login_passcode: "123456",
    };

    await handleSignupUser(201, id, user);

    const { token } = await handleSigninUser(200, user);
    await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    const { body } = await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    await handleExpectPasscodeHashing(user.login_passcode, body.data.login_passcode);
  });

  test("Have forget/reset `login_passcode` flow completed without errors", async () => {
    const { adminToken } = await handleSigninAdminUser();

    const id = 1;
    const oldLoginPasscode = "123456";
    const newLoginPasscode = "654321";
    const incorrectOneTimePassword = "12345678901234567890";
    const payload: Partial<TUser> = {
      email: "test@gmail.com",
      phone: "1234567890",
      login_passcode: oldLoginPasscode,
    };

    await handleSignupUser(201, id, payload);

    const { token } = await handleSigninUser(200, {
      phone: payload.phone,
      login_passcode: payload.login_passcode,
    });
    await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    let getOneRes = await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(getOneRes.body.data.one_time_password).toBeNull();

    await handleExpectPasscodeHashing(oldLoginPasscode, getOneRes.body.data.login_passcode);

    await request(app())
      .post(getEndpoint("/auth/forgot-login-passcode"))
      .send({ email: "test2@gmail.com", phone: payload.phone })
      .expect(404);
    await request(app())
      .post(getEndpoint("/auth/forgot-login-passcode"))
      .send({ email: payload.email, phone: "1234562342" })
      .expect(404);

    const {
      body: { data: oneTimePassword },
    } = await request(app())
      .post(getEndpoint("/auth/forgot-login-passcode"))
      .send(
        (() => {
          const p = { ...payload };
          delete p.login_passcode;
          return p;
        })()
      )
      .expect(200);
    getOneRes = await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(getOneRes.body.data.one_time_password).toBe(oneTimePassword);

    await request(app())
      .post(getEndpoint("/auth/reset-login-passcode"))
      .send({
        new_login_passcode: newLoginPasscode,
        one_time_password: incorrectOneTimePassword,
      })
      .expect(400);

    await request(app())
      .post(getEndpoint("/auth/reset-login-passcode"))
      .send({
        new_login_passcode: newLoginPasscode,
        one_time_password: oneTimePassword,
      })
      .expect(200);

    getOneRes = await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(getOneRes.body.data.one_time_password).toBeNull();
    await handleExpectPasscodeHashing(newLoginPasscode, getOneRes.body.data.login_passcode);
  });

  test("Have email verification flow completed without errors", async () => {
    const { adminToken } = await handleSigninAdminUser();

    const id = 1;
    const oldLoginPasscode = "123456";
    const incorrectOneTimePassword = "12345678901234567890";
    const payload: Partial<TUser> = {
      email: "test@gmail.com",
      phone: "1234567890",
      login_passcode: oldLoginPasscode,
    };

    await handleSignupUser(201, id, payload);

    const { token } = await handleSigninUser(200, {
      phone: payload.phone,
      login_passcode: payload.login_passcode,
    });
    await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    let getOneRes = await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(getOneRes.body.data.email_is_verified).toBe(false);

    await request(app())
      .post(getEndpoint("/auth/send-email-verification"))
      .send({ email: "test2@gmail.com" })
      .expect(404);

    const {
      body: { data: oneTimePassword },
    } = await request(app())
      .post(getEndpoint("/auth/send-email-verification"))
      .send({ email: payload.email })
      .expect(200);

    getOneRes = await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(getOneRes.body.data.one_time_password).toBe(oneTimePassword);

    await request(app())
      .post(getEndpoint(`/auth/confirm-email-verification/${incorrectOneTimePassword}`))
      .expect(400);

    await request(app())
      .post(getEndpoint(`/auth/confirm-email-verification/${oneTimePassword}`))
      .expect(200);

    let {
      body: { data },
    } = await request(app()).get(getEndpoint("/users/me")).set("Authorization", `Bearer ${token}`).expect(200);

    expect(data.one_time_password).toBeNull();
    expect(data.email_is_verified).toBe(true);

    await request(app())
      .patch(getEndpoint("/users"))
      .set("Authorization", `Bearer ${token}`)
      .send({
        nickname: "Test Nickname",
        email: "test10@gmail.com",
      })
      .expect(200);

    let {
      body: { data: datax },
    } = await request(app()).get(getEndpoint("/users/me")).set("Authorization", `Bearer ${token}`).expect(200);

    expect(datax.nickname).toBe("Test Nickname");
    expect(datax.email).toBe("test10@gmail.com");
    expect(datax.email_is_verified).toBe(false);
  });

  test("Have signin flow completed without errors", async () => {
    const userNameSuffix = 100;
    const user = {
      phone: "1234567891",
      login_passcode: "654321",
    };

    await handleSignupUser(201, userNameSuffix, user);

    await handleSigninUser(400, { phone: "9012343203", login_passcode: user.login_passcode });
    await handleSigninUser(400, { phone: user.phone, login_passcode: "123456" });
    await handleSigninUser(400, { not_allowed: "not_allowed" });

    await handleSigninUser(200, {
      phone: DEFAULT_USER_SIGNIN_CREDENTIALS.phone,
      login_passcode: DEFAULT_USER_SIGNIN_CREDENTIALS.login_passcode,
    });
    await handleSignOut();
    const { token, headers } = await handleSigninUser(200, user);

    // Assert that the token is valid
    const decodedUser = jwt.verify(token, process.env.JWT_PRIVATE_SECRET_KEY) as unknown as TUser & {
      exp: number;
      iat: number;
    };
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

  test("Have signout flow completed without errors", handleSignOut);

  test("Have signup flow completed without errors", async () => {
    const userId = 1;
    const user = {
      first_name: "first_name",
      last_name: "last_name",
      middle_name: "middle_name",
      phone: "1234567891",
      email: "signup-email@gmail.com",
      login_passcode: "654321",
      transfer_pin: "1234",
    };

    await handleSigninUser(400, {
      phone: user.phone,
      login_passcode: user.login_passcode,
    });

    await handleSignupUser(400, userId, {
      ...user,
      not_allowed: "not_allowed",
    });
    await handleSignupUser(201, userId, user);
    await handleSignupUser(400, userId, user);
    await handleSignupUser(400, 100, {
      first_name: "random_user",
    });

    const { token } = await handleSigninUser(200, {
      phone: user.phone,
      login_passcode: user.login_passcode,
    });

    const {
      body: { data: meData },
    } = await request(app()).get(getEndpoint(`/users/me`)).set("Authorization", `Bearer ${token}`).expect(200);
    const {
      body: { data: allMyAccountsData },
    }: {
      body: { data: TUserAccount[] };
    } = await request(app()).get(getEndpoint(`/users/me/accounts`)).set("Authorization", `Bearer ${token}`).expect(200);

    expect(meData.phone).toEqual(user.phone);
    expect(meData.email).toEqual(user.email);
    await handleExpectPasscodeHashing(user.transfer_pin, meData.transfer_pin);

    expect(allMyAccountsData.length).toBe(2);
    expect(allMyAccountsData[0].user_id).toBe(userId);
    expect(allMyAccountsData[1].user_id).toBe(userId);
    expect(allMyAccountsData[0].type).toBe(EAccountType.NORMAL);
    expect(allMyAccountsData[1].type).toBe(EAccountType.CASHBACK);
    expect(allMyAccountsData[0].balance).toBe(ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL]);
    expect(allMyAccountsData[1].balance).toBe(ACCOUNT_DEFAULT_BALANCE[EAccountType.CASHBACK]);
  });
});
