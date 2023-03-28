import request from "supertest";
import type { Response } from "supertest";

import app from "../../app";
import UserRepo from "../../repos/UserRepo";

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

    await handleCreateOneUser(201);
    expect(await UserRepo.count()).toEqual(1);

    await handleCreateOneUser(500);
    expect(await UserRepo.count()).toEqual(1);

    await handleCreateOneUser(201, 2);
    expect(await UserRepo.count()).toEqual(2);
  });

  test("Have /Update working", async () => {
    await handleCreateOneUser(201);

    // const { body: allBody } = await request(app()).get(getEndpoint()).expect(200);

    const { body } = await request(app())
      .patch(getEndpoint("2"))
      .send({
        nickname: "Test Nickname",
      })
      .expect(404);
    // console.log(body);
  });
});
