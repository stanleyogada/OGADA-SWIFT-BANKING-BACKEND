import { handleAssertSendMoney, handleSignupManyAccountUsers } from "../../utils/tests";
import { EAccountType } from "../../types/accounts";
import request from "supertest";
import app from "../../app";
import { TTransactionTransactionInHouse } from "../../types/transactions";

test("Have POST /transactions/in-house/send-money", async () => {
  const users = await handleSignupManyAccountUsers();
  const [userOne, userTwo] = users;

  const amount = [
    100,
    50,
    55.5, // TODO: make this a constant
  ];

  let transactionsRes: {
    body: { data: TTransactionTransactionInHouse[] };
  };

  transactionsRes = await request(app())
    .get("/transactions/in-house")
    .set("Authorization", `Bearer ${userOne.token}`)
    .expect(200);
  expect(transactionsRes.body.data.length).toBe(0);

  transactionsRes = await request(app())
    .get("/transactions/in-house")
    .set("Authorization", `Bearer ${userTwo.token}`)
    .expect(200);
  expect(transactionsRes.body.data.length).toBe(0);

  await handleAssertSendMoney("/transactions/in-house/send-money", {
    senderUser: userOne,
    receiverUser: userTwo,
    amount: amount[0],
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  await handleAssertSendMoney("/transactions/in-house/send-money", {
    senderUser: userTwo,
    receiverUser: userOne,
    amount: amount[1],
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
      amount: amount[2],
      accountsTypes: {
        sender: EAccountType.NORMAL,
        receiver: EAccountType.NORMAL,
      },
    },
    500
  );

  transactionsRes = await request(app())
    .get("/transactions/in-house")
    .set("Authorization", `Bearer ${userOne.token}`)
    .expect(200);

  expect(transactionsRes.body.data.length).toBe(3);
  transactionsRes.body.data.forEach((transaction, i) => {
    expect(transaction.sender_account_number).toBe(userOne.accounts[0].account_number);
    expect(transaction.recipient).toBe(userTwo.accounts[0].full_name);
    expect(transaction.amount).toBe(amount[i]);
    expect(transaction.is_success).toBe(i === 2 ? false : true);
    expect(transaction.type).toBe(EAccountType.NORMAL);
  });

  //
  //

  transactionsRes = await request(app())
    .get("/transactions/in-house")
    .set("Authorization", `Bearer ${userTwo.token}`)
    .expect(200);

  expect(transactionsRes.body.data.length).toBe(3);
  transactionsRes.body.data.forEach((transaction, i) => {
    expect(transaction.sender_account_number).toBe(userOne.accounts[0].account_number);
    expect(transaction.recipient).toBe(userTwo.accounts[0].full_name);
    expect(transaction.amount).toBe(amount[i]);
    expect(transaction.is_success).toBe(i === 2 ? false : true);
    expect(transaction.type).toBe(EAccountType.NORMAL);
  });
});
