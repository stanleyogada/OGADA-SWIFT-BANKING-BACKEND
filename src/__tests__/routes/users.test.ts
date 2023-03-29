import request from "supertest";
import type { Response } from "supertest";

import app from "../../app";
import UserRepo from "../../repos/UserRepo";
import { TUser } from "../../types/users";

const getEndpoint = (params?: string) => {
  return `/api/v1/users${params ? "/" + params : ""}`;
};

const handleCreateOneUser = async (statusCode: number, n: number = 1): Promise<Response> => {
  const body = {
    first_name: "Test" + n,
    last_name: "Last" + n,
    phone: "123456789" + n,
    middle_name: "Hire",
    nickname: "Tire",
    email: `test${n}@gmail.com`,
    login_passcode: "123456",
  };

  return await request(app()).post(getEndpoint()).send(body).expect(statusCode);
};

describe("Users", () => {
  test("Have /Get one and all users working", async () => {
    await handleCreateOneUser(201);
    await handleCreateOneUser(201, 2);

    const { body: allBody } = await request(app()).get(getEndpoint()).expect(200);
    expect(allBody.count).toEqual(2);

    await request(app()).get(getEndpoint("1")).expect(200);
    const { body: oneBody } = await request(app()).get(getEndpoint("2")).expect(200);
    expect(oneBody.count).toBeUndefined();
    expect(oneBody.data.id).toEqual(2);

    await request(app()).get(getEndpoint("3")).expect(404);
  });

  test("Have /Create working", async () => {
    expect(await UserRepo.count()).toEqual(0);

    for (const i of [1, 2, 3]) {
      await handleCreateOneUser(201, i);
    }
    expect(await UserRepo.count()).toEqual(3);

    await handleCreateOneUser(500, 3);
    expect(await UserRepo.count()).toEqual(3);

    await handleCreateOneUser(201, 4);
    expect(await UserRepo.count()).toEqual(4);
  });

  test("Have /Update working", async () => {
    await handleCreateOneUser(201, 1);

    let res: { body: { data: TUser } } = await request(app()).get(getEndpoint("1")).expect(200);
    expect(res.body.data.nickname).toEqual("Tire");
    expect(res.body.data.email).toEqual("test1@gmail.com");

    await request(app())
      .patch(getEndpoint("1"))
      .send({
        nickname: "Test Nickname",
        email: "test2@gmail.com",
      })
      .expect(200);

    res = await request(app()).get(getEndpoint("1")).expect(200);
    expect(res.body.data.nickname).toEqual("Test Nickname");
    expect(res.body.data.email).toEqual("test2@gmail.com");

    expect(res.body.data.nickname).not.toEqual("Tire");
    expect(res.body.data.email).not.toEqual("test1@gmail.com");

    await request(app())
      .patch(getEndpoint("3"))
      .send({
        nickname: "Test Nickname",
      })
      .expect(404);
  });

  test("Have /Delete working", async () => {
    expect(await UserRepo.count()).toEqual(0);

    for (const i of [1, 2, 3]) {
      await handleCreateOneUser(201, i);
    }
    expect(await UserRepo.count()).toEqual(3);

    await request(app()).delete(getEndpoint("4")).expect(404);
    expect(await UserRepo.count()).toEqual(3);

    for (const i of [1, 2, 3]) {
      await request(app())
        .delete(getEndpoint(`${i}`))
        .expect(204);
    }
    expect(await UserRepo.count()).toEqual(0);

    await request(app()).delete(getEndpoint("1")).expect(404);
  });
});
