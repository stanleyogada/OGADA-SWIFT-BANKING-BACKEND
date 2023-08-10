import { getEndpoint, handleAssertSendMoney, handleSignupManyAccountUsers } from "../../utils/tests";
import { EAccountType } from "../../types/accounts";
import request from "supertest";
import app from "../../app";
import { TTransactionTransactionInHouse } from "../../types/transactions";
import { SEND_MONEY_MAGIC_FAIL_AMOUNT } from "../../constants";

type TResponse<T> = {
  body: {
    data: T;
  };
};

test("Ensures money can be sent in-house and transactions are recorded", async () => {
  const createUserCount = 3;
  const users = await handleSignupManyAccountUsers(createUserCount);
  const [userOne, userTwo, userThree] = users;

  for (const user of users) {
    const {
      body: { data: transactions },
    }: TResponse<TTransactionTransactionInHouse[]> = await request(app())
      .get(getEndpoint("/transactions/in-houses"))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const transactionsCount = 0;
    expect(transactions.length).toBe(transactionsCount);
  }

  await handleAssertSendMoney("/transactions/in-houses/send-money", {
    senderUser: userOne,
    receiverUser: userTwo,
    amount: 100,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  await handleAssertSendMoney("/transactions/in-houses/send-money", {
    senderUser: userTwo,
    receiverUser: userOne,
    amount: 50,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  const errorStatusCode = 500;
  await handleAssertSendMoney(
    "/transactions/in-houses/send-money",
    {
      senderUser: userTwo,
      receiverUser: userOne,
      amount: SEND_MONEY_MAGIC_FAIL_AMOUNT,
      accountsTypes: {
        sender: EAccountType.NORMAL,
        receiver: EAccountType.NORMAL,
      },
    },
    errorStatusCode
  );

  for (const user of users) {
    const {
      body: { data: transactions },
    }: TResponse<TTransactionTransactionInHouse[]> = await request(app())
      .get(getEndpoint("/transactions/in-houses"))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const transactionsCount = (() => {
      if (user.id === userOne.id) return 2;
      if (user.id === userTwo.id) return 3;
      if (user.id === userThree.id) return 0;
    })();
    expect(transactions.length).toBe(transactionsCount);

    if (user.id === userThree.id) {
      continue;
    }

    if (user.id === userOne.id) {
      expect(transactions[0].is_success).toBe(true);
      expect(transactions[0].recipient).toBe(userOne.accounts[0].full_name);

      expect(transactions[1].is_success).toBe(true);
      expect(transactions[1].recipient).toBe(userTwo.accounts[0].full_name);
    }

    if (user.id === userTwo.id) {
      expect(transactions[0].is_success).toBe(false);
      expect(transactions[0].recipient).toBe(userOne.accounts[0].full_name);

      expect(transactions[1].is_success).toBe(true);
      expect(transactions[1].recipient).toBe(userOne.accounts[0].full_name);

      expect(transactions[2].is_success).toBe(true);
      expect(transactions[2].recipient).toBe(userTwo.accounts[0].full_name);
    }
  }
});

test("Ensures money can be sent to bank and transactions are recorded", async () => {
  const createUserCount = 3;
  const users = await handleSignupManyAccountUsers(createUserCount);
  const [userOne, userTwo, userThree] = users;

  for (const user of users) {
    const {
      body: { data: transactions },
    }: TResponse<TTransactionTransactionInHouse[]> = await request(app())
      .get(getEndpoint("/transactions/banks"))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const transactionsCount = 0;
    expect(transactions.length).toBe(transactionsCount);
  }
});
