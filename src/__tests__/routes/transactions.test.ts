import request from "supertest";

import app from "../../app";
import {
  getEndpoint,
  handleAssertSendMoney,
  handleSigninUser,
  handleSignupManyAccountUsers,
  handleSignupUser,
} from "../../utils/tests";
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

test("Have POST /transactions/in-house/send-money", async () => {
  const users = await handleSignupManyAccountUsers();
  const [userOne, userTwo] = users;

  await handleAssertSendMoney("/transactions/in-house/send-money", {
    senderUser: userOne,
    receiverUser: userTwo,
    amount: 100,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  await handleAssertSendMoney("/transactions/in-house/send-money", {
    senderUser: userTwo,
    receiverUser: userOne,
    amount: 50,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });
});
