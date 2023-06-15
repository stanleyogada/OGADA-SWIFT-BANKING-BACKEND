import request from "supertest";

import app from "../../app";
import UserRepo from "../../repos/UserRepo";
import { TUser } from "../../types/users";
import { getEndpoint, handleSignupUser } from "../../utils/tests";

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
});
