import { getEndpoint, handleAssertSendMoney, handleSignupManyAccountUsers } from "../../utils/tests";
import { EAccountType } from "../../types/accounts";
import request from "supertest";
import app from "../../app";
import { TTransactionTransactionInHouse } from "../../types/transactions";

type TResponse<T> = {
  body: {
    data: T;
  };
};

test("Have POST /transactions/in-house/send-money", async () => {
  const users = await handleSignupManyAccountUsers(3);
  const [userOne, userTwo, userThree] = users;

  const amounts = [
    100,
    50,
    55.5, // TODO: make this a constant
  ];

  for (const user of users) {
    const {
      body: { data: transactions },
    }: TResponse<TTransactionTransactionInHouse[]> = await request(app())
      .get(getEndpoint("/transactions/in-house"))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const transactionsCount = 0;
    expect(transactions.length).toBe(transactionsCount);
  }

  await handleAssertSendMoney("/transactions/in-house/send-money", {
    senderUser: userOne,
    receiverUser: userTwo,
    amount: amounts[0],
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  await handleAssertSendMoney("/transactions/in-house/send-money", {
    senderUser: userTwo,
    receiverUser: userOne,
    amount: amounts[1],
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  await handleAssertSendMoney(
    "/transactions/in-house/send-money",
    {
      senderUser: userTwo,
      receiverUser: userOne,
      amount: amounts[2],
      accountsTypes: {
        sender: EAccountType.NORMAL,
        receiver: EAccountType.NORMAL,
      },
    },
    500
  );

  for (const user of users) {
    const {
      body: { data: transactions },
    }: TResponse<TTransactionTransactionInHouse[]> = await request(app())
      .get(getEndpoint("/transactions/in-house"))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const transactionsCount = user.id === userThree.id ? 0 : 3;
    expect(transactions.length).toBe(transactionsCount);

    if (user.id === userThree.id) {
      continue;
    }

    expect(transactions[0].is_success).toBe(false);
    expect(transactions[1].is_success).toBe(true);
    expect(transactions[2].is_success).toBe(true);
    expect(transactions[0].recipient).toBe(userOne.accounts[0].full_name);
    expect(transactions[1].recipient).toBe(userOne.accounts[0].full_name);
    expect(transactions[2].recipient).toBe(userTwo.accounts[0].full_name);
  }
});
