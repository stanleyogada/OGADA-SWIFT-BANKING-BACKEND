import request from "supertest";

import app from "../../app";
import UserRepo from "../../repos/UserRepo";
import { TUser } from "../../types/users";
import { getEndpoint, handleSigninAdminUser, handleSigninUser, handleSignupUser } from "../../utils/tests";
import HashPassword from "../../utils/HashPassword";

describe("Users", () => {
  test("Have /Get one and all users working", async () => {
    const baseUserIdCount = 2;

    const { adminToken } = await handleSigninAdminUser();

    const user = {
      phone: "1234567890",
      login_passcode: "123456",
    };

    await handleSignupUser(201, baseUserIdCount, user);
    await handleSignupUser(201, baseUserIdCount + 1);

    const { token } = await handleSigninUser(200, user);
    await request(app()).get(getEndpoint("/users")).set("Authorization", `Bearer ${token}`).expect(403);

    await request(app()).get(getEndpoint("/users")).expect(401);
    const { body: allBody } = await request(app())
      .get(getEndpoint("/users"))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(allBody.count).toEqual(baseUserIdCount + 1);
    await request(app()).get(getEndpoint("/users/1")).set("Authorization", `Bearer ${adminToken}`).expect(200);
    const { body: oneBody } = await request(app())
      .get(getEndpoint(`/users/${baseUserIdCount}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(oneBody.count).toBeUndefined();
    expect(oneBody.data.id).toEqual(baseUserIdCount);
    await request(app())
      .get(getEndpoint(`/users/${baseUserIdCount + 1}`))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);
  });

  test("Have /Update working", async () => {
    const { adminToken } = await handleSigninAdminUser();

    const user = {
      login_passcode: "123456",
      phone: "1234567890",
    };

    await handleSignupUser(201, 1, user);

    let { token } = await handleSigninUser(200, user);
    await request(app()).get(getEndpoint("/users/1")).set("Authorization", `Bearer ${token}`).expect(403);

    let res: { body: { data: TUser } } = await request(app())
      .get(getEndpoint("/users/1"))
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data.nickname).toBeNull();
    expect(res.body.data.email).toEqual("test1@gmail.com");

    await request(app())
      .patch(getEndpoint("/users"))
      .send({
        nickname: "Test Nickname",
        email: "test2@gmail.com",
      })
      .expect(401);

    await request(app())
      .patch(getEndpoint("/users"))
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nickname: "Test Nickname",
        email: "test2@gmail.com",
      })
      .expect(200);

    res = await request(app()).get(getEndpoint("/users/1")).set("Authorization", `Bearer ${adminToken}`).expect(200);

    expect(res.body.data.nickname).toEqual("Test Nickname");
    expect(res.body.data.email).toEqual("test2@gmail.com");
    expect(res.body.data.nickname).not.toBeNull();
    expect(res.body.data.email).not.toEqual("test1@gmail.com");
  });

  test("Have /Delete working", async () => {
    const { adminToken } = await handleSigninAdminUser();

    expect(await UserRepo.count()).toEqual(1);

    for (const i of [1, 2, 3]) {
      await handleSignupUser(201, i);
    }

    const { token } = await handleSigninUser(200, {
      phone: "1234567892",
      login_passcode: "123456",
    });
    await request(app()).delete(getEndpoint("/users/4")).set("Authorization", `Bearer ${token}`).expect(403);

    expect(await UserRepo.count()).toEqual(4);
    await request(app()).delete(getEndpoint("/users/4")).set("Authorization", `Bearer ${adminToken}`).expect(404);
    expect(await UserRepo.count()).toEqual(4);

    for (const i of [1, 2, 3]) {
      await request(app())
        .delete(getEndpoint(`/users/${i}`))
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);
    }
    expect(await UserRepo.count()).toEqual(1);
    await request(app()).delete(getEndpoint("/users/2")).set("Authorization", `Bearer ${adminToken}`).expect(404);
  });

  test("Have update login passcode flow completed without errors", async () => {
    const { adminToken } = await handleSigninAdminUser();

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

    const { token } = await handleSigninUser(200, {
      phone: user_phone,
      login_passcode: original_old_login_passcode,
    });
    await request(app())
      .patch(getEndpoint("/users/update-login-passcode"))
      .set("Authorization", `Bearer ${token}`)
      .send({
        old_login_passcode: incorrect_old_login_passcode,
        new_login_passcode,
      })
      .expect(400);

    await request(app())
      .patch(getEndpoint("/users/update-login-passcode"))
      .set("Authorization", `Bearer ${token}`)
      .send({
        old_login_passcode: incorrect_old_login_passcode,
        new_login_passcode,
      })
      .expect(400);

    expect(await handleComparePassword(new_login_passcode, adminToken)).toBe(false);

    await request(app())
      .patch(getEndpoint("/users/update-login-passcode"))
      .set("Authorization", `Bearer ${token}`)
      .send({
        old_login_passcode: original_old_login_passcode,
        new_login_passcode,
      })
      .expect(200);

    expect(await handleComparePassword(new_login_passcode, adminToken)).toBe(true);
  });

  test("Have /me working", async () => {
    const user = {
      first_name: "Current Logged In User",
      email: "current@gmail.com",
      phone: "1234567890",
      login_passcode: "123456",
    };

    await handleSignupUser(201, 1, user);

    await request(app()).get(getEndpoint("/users/me")).expect(401);

    const { token } = await handleSigninUser(200, {
      phone: user.phone,
      login_passcode: user.login_passcode,
    });

    const { body } = await request(app())
      .get(getEndpoint("/users/me"))
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(body.data.first_name).toEqual(user.first_name);
    expect(body.data.email).toEqual(user.email);
    expect(body.data.phone).toEqual(user.phone);
    expect(body.data.nickname).toBeNull();

    await request(app())
      .patch(getEndpoint("/users"))
      .set("Authorization", `Bearer ${token}`)
      .send({
        nickname: "Nickname 1",
      })
      .expect(200);

    const { body: body2 } = await request(app())
      .get(getEndpoint("/users/me"))
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(body2.data.nickname).toEqual("Nickname 1");
  });
});

const handleComparePassword = async (new_login_passcode: string, token: string) => {
  const {
    body: { data: user },
  } = await request(app()).get(getEndpoint("/users/1")).set("Authorization", `Bearer ${token}`).expect(200);

  const isMatch = await HashPassword.handleCheck(new_login_passcode, user.login_passcode);
  return isMatch;
};
