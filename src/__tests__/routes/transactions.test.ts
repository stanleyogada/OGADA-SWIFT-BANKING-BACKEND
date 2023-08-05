import request from "supertest";

import app from "../../app";
import { getEndpoint, handleSigninUser, handleSignupUser } from "../../utils/tests";
import { ACCOUNT_DEFAULT_BALANCE } from "../../constants";
import { EAccountType } from "../../types/accounts";

const handleAssertSendMoney = async (
  senderUser,
  receiverUser,
  opts: {
    type: EAccountType;
    amount: number;
  }
) => {
  // const handleFindAccount = (user) => {
  //   return user.accounts.find((account) => account.type === opts.type);
  // };

  // const senderAccount = handleFindAccount(senderUser);
  // const receiverAccount = handleFindAccount(receiverUser);

  await request(app())
    .post(getEndpoint(`/transactions/in-house/send-money`))
    .set("Authorization", `Bearer ${senderUser.token}`)
    .send({
      type: senderUser.accounts[0].type,
      receiver_account_number: receiverUser.accounts[0].account_number,
      amount: opts.amount,
      remark: "Happy birthday!",
    })
    .expect(200);
  senderUser.accounts.find((account) => account.type === opts.type).currentBalance -= opts.amount;
  receiverUser.accounts.find((account) => account.type === opts.type).currentBalance += opts.amount;

  for (const user of [senderUser, receiverUser]) {
    const {
      body: {
        data: [normalAccount],
      },
    } = await request(app())
      .get(getEndpoint(`/users/me/accounts`))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    if (user.id === senderUser.id) {
      expect(normalAccount.balance).toBe(senderUser.accounts[0].currentBalance.toFixed(2));
    }
    if (user.id === receiverUser.id) {
      expect(normalAccount.balance).toBe(receiverUser.accounts[0].currentBalance.toFixed(2));
    }
  }
};

test("Have POST /transactions/in-house/send-money", async () => {
  const users = [
    {
      id: 1,
      token: "",
      accounts: [],
    },
    {
      id: 2,
      token: "",
      accounts: [],
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

    users[users.indexOf(_user)].token = userToken;
    users[users.indexOf(_user)].accounts = userAccounts.map((account) => ({
      ...account,
      currentBalance: +ACCOUNT_DEFAULT_BALANCE[account.type],
    }));
  }

  const [userOne, userTwo] = users;

  await handleAssertSendMoney(userOne, userTwo, {
    amount: 100,
    type: EAccountType.NORMAL,
  });

  await handleAssertSendMoney(userTwo, userOne, {
    amount: 50,
    type: EAccountType.NORMAL,
  });
});
