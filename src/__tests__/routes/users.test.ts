import request from "supertest";
import app from "../../app";
import UserRepo from "../../repos/UserRepo";

describe("Users", () => {
  it("creation should be working", async () => {
    const startCount = await UserRepo.count();
    const phone = `${Math.random()}`.slice(2, 12);

    await request(app())
      .post("/api/v1/users")
      .send({
        first_name: "Test 2",
        last_name: "Last 2",
        phone,
        middle_name: "Hire",
        nickname: "Tire",
        email: `${phone}@gmail.com`,
        login_passcode: "123456",
      })
      .expect(201);

    const finishCount = await UserRepo.count();
    expect(finishCount - startCount).toEqual(1);
  });
});
