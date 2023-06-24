import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app";
import { TAdminUser, TUser } from "../../types/users";
import HashPassword from "../../utils/HashPassword";
import { getEndpoint, handleSigninAdminUser, handleSigninUser, handleSignupUser } from "../../utils/tests";

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

    getOneRes = await request(app())
      .get(getEndpoint(`/users/${id}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(getOneRes.body.data.one_time_password).toBeNull();
    expect(getOneRes.body.data.email_is_verified).toBe(true);
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
    await handleSigninUser(
      400,

      {
        ...user,
        not_allowed: "not_allowed",
      }
    );

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

  test("Have signout flow completed without errors", async () => {
    const { headers } = await request(app()).get(getEndpoint("/auth/signout")).expect(200);

    // Assert the 'Set-Cookie' header to ensure the token cookie is cleared
    const cookieHeader = headers["set-cookie"];
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader[0]).toContain("token=;"); // Check if token cookie is empty
  });

  test("Have signup flow completed without errors", async () => {
    const { adminToken } = await handleSigninAdminUser();

    const userId = "1";
    const user = {
      first_name: "first_name",
      last_name: "last_name",
      middle_name: "middle_name",
      phone: "1234567891",
      email: "signup-email@gmail.com",
      login_passcode: "654321",
    };

    await handleSigninUser(400, {
      phone: user.phone,
      login_passcode: user.login_passcode,
    });

    await request(app())
      .post(getEndpoint("/auth/signup"))
      .send({
        ...user,
        not_allowed: "not_allowed",
      })
      .expect(400);

    await request(app()).post(getEndpoint("/auth/signup")).send(user).expect(201);

    const { token } = await handleSigninUser(200, {
      phone: user.phone,
      login_passcode: user.login_passcode,
    });
    await request(app())
      .get(getEndpoint(`/users/${userId}`))
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    const {
      body: {
        data: { phone, email },
      },
    } = await request(app())
      .get(getEndpoint(`/users/${userId}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(phone).toEqual(user.phone);
    expect(email).toEqual(user.email);
  });

  // Admin user
  test("Have admin SIGNUP/SIGNIN flow completed without errors", async () => {
    const user = {
      phone: "1234567891",
      login_passcode: "654321",
    };

    await request(app()).post(getEndpoint("/auth/signin/admin")).send(user).expect(400);

    const {
      body: { data: adminUser },
    } = await request(app()).post(getEndpoint("/auth/signup/admin")).send(user).expect(201); // TODO: Remove signup admin from the API (As it is not part of the documentation)
    expect(adminUser.is_admin_user).toBe(true);

    const {
      body: { token },
    } = await request(app()).post(getEndpoint("/auth/signin/admin")).send(user).expect(200);

    const decodedUser = jwt.verify(token, process.env.JWT_PRIVATE_SECRET_KEY) as unknown as TAdminUser;

    expect(decodedUser.is_admin_user).toBe(adminUser.is_admin_user);
    expect(decodedUser.phone).toBe(adminUser.phone);
    expect(decodedUser.login_passcode).toBe(adminUser.login_passcode);
  });
});
