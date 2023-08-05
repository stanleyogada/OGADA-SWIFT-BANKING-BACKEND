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
  const handleFindAccount = (user) => {
    return user.accounts.find((account) => account.type === opts.type);
  };

  const senderAccount = handleFindAccount(senderUser);
  const receiverAccount = handleFindAccount(receiverUser);

  // console.log("senderAccount", senderAccount);
  // console.log("receiverAccount", receiverAccount);

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

  // console.log("senderAccount", senderAccount, opts.amount);
  // console.log("receiverAccount", receiverAccount, opts.amount);

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

    // expect(userAccounts[0].balance).toBe(ACCOUNT_DEFAULT_BALANCE.NORMAL);
  }

  const [userOne, userTwo] = users;

  // const currentBalance = {
  //   userOne: +ACCOUNT_DEFAULT_BALANCE.NORMAL,
  //   userTwo: +ACCOUNT_DEFAULT_BALANCE.NORMAL,
  // };

  // await request(app())
  //   .post(getEndpoint(`/transactions/in-house/send-money`))
  //   .set("Authorization", `Bearer ${userOne.token}`)
  //   .send({
  //     type: userOne.accounts[0].type,
  //     receiver_account_number: userTwo.accounts[0].account_number,
  //     amount: 100,
  //     remark: "Happy birthday!",
  //   })
  //   .expect(200);
  // currentBalance.userOne -= 100;
  // currentBalance.userTwo += 100;

  // for (const user of users) {
  //   const {
  //     body: {
  //       data: [normalAccount],
  //     },
  //   } = await request(app())
  //     .get(getEndpoint(`/users/me/accounts`))
  //     .set("Authorization", `Bearer ${user.token}`)
  //     .expect(200);

  //   if (user.id === userOne.id) {
  //     expect(normalAccount.balance).toBe(currentBalance.userOne.toFixed(2));
  //   }
  //   if (user.id === userTwo.id) {
  //     expect(normalAccount.balance).toBe(currentBalance.userTwo.toFixed(2));
  //   }
  // }

  await handleAssertSendMoney(userOne, userTwo, {
    // currentBalance: {
    //   senderUser: currentBalance.userOne,
    //   receiverUser: currentBalance.userTwo,
    // },
    amount: 100,
    type: EAccountType.NORMAL,
  });

  await handleAssertSendMoney(userTwo, userOne, {
    // currentBalance: {
    //   senderUser: currentBalance.userTwo,
    //   receiverUser: currentBalance.userOne,
    // },
    amount: 50,
    type: EAccountType.NORMAL,
  });
  // await handleAssertSendMoney(userOne, userTwo, { amount: 55.5 });

  // await request(app())
  //   .post(getEndpoint(`/transactions/in-house/send-money`))
  //   .set("Authorization", `Bearer ${userTwo.token}`)
  //   .send({
  //     type: userTwo.accounts[0].type,
  //     receiver_account_number: userOne.accounts[0].account_number,
  //     amount: 50,
  //   })
  //   .expect(200);
  // currentBalance.userOne += 50;
  // currentBalance.userTwo -= 50;

  // for (const user of users) {
  //   const {
  //     body: {
  //       data: [normalAccount],
  //     },
  //   } = await request(app())
  //     .get(getEndpoint(`/users/me/accounts`))
  //     .set("Authorization", `Bearer ${user.token}`)
  //     .expect(200);

  //   if (user.id === userOne.id) {
  //     expect(normalAccount.balance).toBe(currentBalance.userOne.toFixed(2));
  //   }
  //   if (user.id === userTwo.id) {
  //     expect(normalAccount.balance).toBe(currentBalance.userTwo.toFixed(2));
  //   }
  // }
});
