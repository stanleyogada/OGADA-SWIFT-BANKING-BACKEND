import request from "supertest";

import { getEndpoint, handleSigninUser, handleSignupUser } from "../../utils/tests";
import app from "../../app";

test("Have POST /transactions/in-house/send-money", async () => {
  const users = [
    {
      id: 1,
    },
    {
      id: 2,
    },
  ];

  for (const _user of users) {
    const user = await handleSignupUser(201, _user.id);
    const { token: userToken } = await handleSigninUser(200, {
      phone: user.phone,
      login_passcode: user.plain_login_passcode,
    });
    const {
      body: { data: userAccounts },
    } = await request(app())
      .get(getEndpoint(`/users/me/accounts`))
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(userAccounts.length).toBe(2);
  }
});
