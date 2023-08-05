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
  endpoint: string,
  opts: {
    senderUser: TUser;
    receiverUser: TUser;
    accountsTypes: {
      sender: EAccountType;
      receiver: EAccountType;
    };
    amount: number;
  }
) => {
  const { senderUser, receiverUser } = opts;

  const handleFindAccount = (user: TUser) => {
    return user.accounts.find(
      (account) => account.type === opts.accountsTypes[user.id === senderUser.id ? "sender" : "receiver"]
    );
  };

  const senderAccount = handleFindAccount(senderUser);
  const receiverAccount = handleFindAccount(receiverUser);

  await request(app())
    .post(getEndpoint(endpoint))
    .set("Authorization", `Bearer ${senderUser.token}`)
    .send({
      sender_account_type: opts.accountsTypes.sender,
      receiver_account_number: receiverAccount.account_number,
      amount: opts.amount,
      remark: "Happy birthday!",
    })
    .expect(200);

  senderAccount.currentBalance -= opts.amount;
  receiverAccount.currentBalance += opts.amount;

  for (const user of [senderUser, receiverUser]) {
    const {
      body: { data },
    }: {
      body: {
        data: (TUserAccount & {
          currentBalance: number;
        })[];
      };
    } = await request(app())
      .get(getEndpoint(`/users/me/accounts`))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const newUser: TUser = {
      id: user.id,
      token: user.token,
      accounts: data,
    };
    const account = handleFindAccount(newUser);

    if (user.id === senderUser.id) {
      expect(account.balance).toBe(senderAccount.currentBalance.toFixed(2));
    }
    if (user.id === receiverUser.id) {
      expect(account.balance).toBe(receiverAccount.currentBalance.toFixed(2));
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

export { handleAssertSendMoney, handleSignupManyAccountUsers };
