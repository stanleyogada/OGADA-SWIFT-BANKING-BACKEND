import request from "supertest";
import app from "../../app";
import UserRepo from "../../repos/UserRepo";

describe("Users", () => {
  test("Have /Create working", async () => {
    const getBody = (n: number = 1) => ({
      first_name: "Test" + n,
      last_name: "Last" + n,
      phone: "123456789" + n,
      middle_name: "Hire",
      nickname: "Tire",
      email: `test${n}@gmail.com`,
      login_passcode: "123456",
    });

    expect(await UserRepo.count()).toEqual(0);

    await request(app()).post("/api/v1/users").send(getBody()).expect(201);
    expect(await UserRepo.count()).toEqual(1);

    await request(app()).post("/api/v1/users").send(getBody()).expect(500);
    expect(await UserRepo.count()).toEqual(1);

    await request(app()).post("/api/v1/users").send(getBody(2)).expect(201);
    expect(await UserRepo.count()).toEqual(2);
  });
});
