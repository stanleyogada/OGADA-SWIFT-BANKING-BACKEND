import { getEndpoint, handleAssertSendMoney, handleSignupManyAccountUsers } from "../../utils/tests";
import { EAccountType } from "../../types/accounts";
import request from "supertest";
import app from "../../app";
import { TTransactionTransactionInHouse } from "../../types/transactions";

test("Have POST /transactions/in-house/send-money", async () => {
  const users = await handleSignupManyAccountUsers();
  const [userOne, userTwo] = users;

  const amounts = [
    100,
    50,
    55.5, // TODO: make this a constant
  ];

  let transactionsRes: {
    body: { data: TTransactionTransactionInHouse[] };
  };

  transactionsRes = await request(app())
    .get(getEndpoint("/transactions/in-house"))
    .set("Authorization", `Bearer ${userOne.token}`)
    .expect(200);
  expect(transactionsRes.body.data.length).toBe(0);

  transactionsRes = await request(app())
    .get(getEndpoint("/transactions/in-house"))
    .set("Authorization", `Bearer ${userTwo.token}`)
    .expect(200);
  expect(transactionsRes.body.data.length).toBe(0);

  for (const amount of amounts) {
    const statusCode =
      amount === 55.5 // TODO: make this (55.5) a constant
        ? 500
        : 200;

    await handleAssertSendMoney(
      "/transactions/in-house/send-money",
      {
        senderUser: userOne,
        receiverUser: userTwo,
        amount,
        accountsTypes: {
          sender: EAccountType.NORMAL,
          receiver: EAccountType.NORMAL,
        },
      },
      statusCode
    );
  }

  transactionsRes = await request(app())
    .get(getEndpoint("/transactions/in-house"))
    .set("Authorization", `Bearer ${userOne.token}`)
    .expect(200);

  // console.log(transactionsRes.body.data);

  expect(transactionsRes.body.data.length).toBe(3);
  transactionsRes.body.data.forEach((transaction, i) => {
    expect(transaction.sender_account_number).toBe(userOne.accounts[0].account_number);
    expect(transaction.recipient).toBe(userTwo.accounts[0].full_name);
    expect(transaction.amount).toBe(amounts[i]);
    expect(transaction.is_success).toBe(i === 2 ? false : true);
    expect(transaction.type).toBe(EAccountType.NORMAL);
  });

  //
  //

  transactionsRes = await request(app())
    .get(getEndpoint("/transactions/in-house"))
    .set("Authorization", `Bearer ${userTwo.token}`)
    .expect(200);

  expect(transactionsRes.body.data.length).toBe(3);
  transactionsRes.body.data.forEach((transaction, i) => {
    expect(transaction.sender_account_number).toBe(userOne.accounts[0].account_number);
    expect(transaction.recipient).toBe(userTwo.accounts[0].full_name);
    expect(transaction.amount).toBe(amounts[i]);
    expect(transaction.is_success).toBe(i === 2 ? false : true);
    expect(transaction.type).toBe(EAccountType.NORMAL);
  });
});
