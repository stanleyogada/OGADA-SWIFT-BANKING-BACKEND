import request from "supertest";

import app from "../../app";
import UserRepo from "../../repos/UserRepo";
import { TUser } from "../../types/users";
import { getEndpoint, handleSignupUser } from "../../utils/tests";
import HashPassword from "../../utils/HashPassword";

describe("Users", () => {
  test("Have /Get one and all users working", async () => {
    await handleSignupUser(201);
    await handleSignupUser(201, 2);
    const { body: allBody } = await request(app()).get(getEndpoint("/users")).expect(200);
    expect(allBody.count).toEqual(2);
    await request(app()).get(getEndpoint("/users", "/1")).expect(200);
    const { body: oneBody } = await request(app()).get(getEndpoint("/users", "/2")).expect(200);
    expect(oneBody.count).toBeUndefined();
    expect(oneBody.data.id).toEqual(2);
    await request(app()).get(getEndpoint("/users", "/3")).expect(404);
  });

  test("Have /Create working", async () => {
    expect(await UserRepo.count()).toEqual(0);
    for (const i of [1, 2, 3]) {
      await handleSignupUser(201, i);
    }
    expect(await UserRepo.count()).toEqual(3);
    await handleSignupUser(500, 3);
    expect(await UserRepo.count()).toEqual(3);
    await handleSignupUser(201, 4);
    expect(await UserRepo.count()).toEqual(4);
  });

  test("Have /Update working", async () => {
    await handleSignupUser(201, 1);
    let res: { body: { data: TUser } } = await request(app()).get(getEndpoint("/users", "/1")).expect(200);
    expect(res.body.data.nickname).toBeNull();
    expect(res.body.data.email).toEqual("test1@gmail.com");
    await request(app())
      .patch(getEndpoint("/users", "/1"))
      .send({
        nickname: "Test Nickname",
        email: "test2@gmail.com",
      })
      .expect(200);
    res = await request(app()).get(getEndpoint("/users", "/1")).expect(200);
    expect(res.body.data.nickname).toEqual("Test Nickname");
    expect(res.body.data.email).toEqual("test2@gmail.com");
    expect(res.body.data.nickname).not.toBeNull();
    expect(res.body.data.email).not.toEqual("test1@gmail.com");
    await request(app())
      .patch(getEndpoint("/users", "/3"))
      .send({
        nickname: "Test Nickname",
      })
      .expect(404);
  });

  test("Have /Delete working", async () => {
    expect(await UserRepo.count()).toEqual(0);
    for (const i of [1, 2, 3]) {
      await handleSignupUser(201, i);
    }
    expect(await UserRepo.count()).toEqual(3);
    await request(app()).delete(getEndpoint("/users", "/4")).expect(404);
    expect(await UserRepo.count()).toEqual(3);
    for (const i of [1, 2, 3]) {
      await request(app())
        .delete(getEndpoint("/users", `/${i}`))
        .expect(204);
    }
    expect(await UserRepo.count()).toEqual(0);
    await request(app()).delete(getEndpoint("/users", "/1")).expect(404);
  });

  test("Have update login passcode flow completed without errors", async () => {
    const original_old_login_passcode = "123456";
    const incorrect_old_login_passcode = "982353";
    const new_login_passcode = "654321";
    const user_phone = "1234567890";

    await handleSignupUser(201, 1, {
      login_passcode: original_old_login_passcode,
      phone: user_phone,
    });

    await request(app())
      .patch(getEndpoint("/users/update-login-passcode"))
      .send({
        old_login_passcode: original_old_login_passcode,
        new_login_passcode,
      })
      .expect(401);

    const {
      body: { token },
    } = await request(app())
      .post(getEndpoint("/auth/signin"))
      .send({
        phone: user_phone,
        login_passcode: original_old_login_passcode,
      })
      .expect(200);

    await request(app())
      .patch(getEndpoint("/users/update-login-passcode"))
      .set("Authorization", `Bearer ${token}`)
      .send({
        old_login_passcode: incorrect_old_login_passcode,
        new_login_passcode,
      })
      .expect(400);

    const {
      body: { data: user },
    } = await request(app()).get(getEndpoint("/users", "/1")).expect(200);

    expect(await handleComparePassword(new_login_passcode)).toBe(false);

    await request(app())
      .patch(getEndpoint("/users/update-login-passcode"))
      .set("Authorization", `Bearer ${token}`)
      .send({
        old_login_passcode: original_old_login_passcode,
        new_login_passcode,
      })
      .expect(200);

    expect(await handleComparePassword(new_login_passcode)).toBe(true);
  });
});

const handleComparePassword = async (new_login_passcode) => {
  const {
    body: { data: user },
  } = await request(app()).get(getEndpoint("/users", "/1")).expect(200);

  const isMatch = await HashPassword.handleCheck(new_login_passcode, user.login_passcode);
  return isMatch;
};
