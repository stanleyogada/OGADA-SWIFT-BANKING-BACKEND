import request from "supertest";

import app from "../../app";
import { getEndpoint, handleSigninUser, handleSignupUser } from "../../utils/tests";
import { ACCOUNT_DEFAULT_BALANCE } from "../../constants";
import { EAccountType } from "../../types/accounts";
import { TUserAccount } from "../../types/users";

type TUser = {
  id: number;
  token: string;
  accounts: (TUserAccount & {
    currentBalance: number;
  })[];
};

const handleAssertSendMoney = async (
  senderUser: TUser,
  receiverUser: TUser,
  opts: {
    accountsTypes: {
      sender: EAccountType;
      receiver: EAccountType;
    };
    amount: number;
  }
) => {
  const handleFindAccount = (user: TUser) => {
    return user.accounts.find(
      (account) => account.type === opts.accountsTypes[user.id === senderUser.id ? "sender" : "receiver"]
    );
  };

  const senderAccount = handleFindAccount(senderUser);
  const receiverAccount = handleFindAccount(receiverUser);

  await request(app())
    .post(getEndpoint(`/transactions/in-house/send-money`))
    .set("Authorization", `Bearer ${senderUser.token}`)
    .send({
      type: opts.accountsTypes.sender,
      receiver_account_number: receiverUser.accounts[0].account_number,
      amount: opts.amount,
      remark: "Happy birthday!",
    })
    .expect(200);
  senderAccount.currentBalance -= opts.amount;
  receiverAccount.currentBalance += opts.amount;

  for (const user of [senderUser, receiverUser]) {
    const {
      body: {
        data: [normalAccount],
      },
    }: {
      body: {
        data: TUserAccount[];
      };
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

const handleSignupManyAccountUsers = async (nUsers: number = 2) => {
  const users: TUser[] = Array.from({ length: nUsers }, (_, i) => ({
    id: i + 1,
    token: "",
    accounts: [],
  }));

  for (const _user of users) {
    const user = await handleSignupUser(201, _user.id);
    const { token: userToken } = await handleSigninUser(200, {
      phone: user.phone,
      login_passcode: user.plain_login_passcode,
    });
    const {
      body: { data: userAccounts },
    }: {
      body: { data: TUserAccount[] };
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

  return users;
};

test("Have POST /transactions/in-house/send-money", async () => {
  const users = await handleSignupManyAccountUsers();
  const [userOne, userTwo] = users;

  expect(userOne.accounts[0].currentBalance).toBe(+ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL]);
  expect(userTwo.accounts[0].currentBalance).toBe(+ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL]);

  await handleAssertSendMoney(userOne, userTwo, {
    amount: 100,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  expect(userOne.accounts[0].currentBalance).toBe(+ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL] - 100);
  expect(userTwo.accounts[0].currentBalance).toBe(+ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL] + 100);

  await handleAssertSendMoney(userTwo, userOne, {
    amount: 50,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  expect(userOne.accounts[0].currentBalance).toBe(+ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL] - 50);
  expect(userTwo.accounts[0].currentBalance).toBe(+ACCOUNT_DEFAULT_BALANCE[EAccountType.NORMAL] + 50);
});
