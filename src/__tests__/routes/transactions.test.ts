import {
  getEndpoint,
  handleAssertSendMoneyInHouse,
  handleAssertSendMoneyToBank,
  handleSignupManyAccountUsers,
} from "../../utils/tests";
import { EAccountType } from "../../types/accounts";
import request from "supertest";
import app from "../../app";
import { TTransactionTransactionInHouse } from "../../types/transactions";
import { SEND_MONEY_MAGIC_FAIL_AMOUNT } from "../../constants";
import { TRANSACTIONS_ROUTES } from "../../constants/routes";

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
      .get(getEndpoint(`/transactions/${TRANSACTIONS_ROUTES.inHouses}`))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const transactionsCount = 0;
    expect(transactions.length).toBe(transactionsCount);
  }

  await handleAssertSendMoneyInHouse(`/transactions/${TRANSACTIONS_ROUTES.inHousesSendMoney}`, {
    senderUser: userOne,
    receiverUser: userTwo,
    amount: 100,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  await handleAssertSendMoneyInHouse(`/transactions/${TRANSACTIONS_ROUTES.inHousesSendMoney}`, {
    senderUser: userTwo,
    receiverUser: userOne,
    amount: 50,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  let errorStatusCode = 500;
  await handleAssertSendMoneyInHouse(
    `/transactions/${TRANSACTIONS_ROUTES.inHousesSendMoney}`,
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

  errorStatusCode = 400;
  const largeAmount = 1000;
  // This doesn't create a transaction because it's a insufficient funds ClientError
  await handleAssertSendMoneyInHouse(
    `/transactions/${TRANSACTIONS_ROUTES.inHousesSendMoney}`,
    {
      senderUser: userTwo,
      receiverUser: userOne,
      amount: largeAmount,
      accountsTypes: {
        sender: EAccountType.NORMAL,
        receiver: EAccountType.NORMAL,
      },
    },
    errorStatusCode
  );

  const incorrectTransferPin = "1992";
  // This doesn't create a transaction because it's a insufficient funds ClientError
  await handleAssertSendMoneyInHouse(
    `/transactions/${TRANSACTIONS_ROUTES.inHousesSendMoney}`,
    {
      senderUser: {
        ...userTwo,
        transferPin: incorrectTransferPin,
      },
      receiverUser: userOne,
      amount: largeAmount,
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
      .get(getEndpoint(`/transactions/${TRANSACTIONS_ROUTES.inHouses}`))
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
      expect(transactions[1].is_success).toBe(true);
      expect(transactions[1].recipient).toBe(userTwo.accounts[0].full_name);
      expect(transactions[1].is_deposit).toBe(false);

      expect(transactions[0].is_success).toBe(true);
      expect(transactions[0].recipient).toBe(userOne.accounts[0].full_name);
      expect(transactions[0].is_deposit).toBe(true);
    }

    if (user.id === userTwo.id) {
      expect(transactions[2].is_success).toBe(true);
      expect(transactions[2].recipient).toBe(userTwo.accounts[0].full_name);
      expect(transactions[2].is_deposit).toBe(true);

      expect(transactions[1].is_success).toBe(true);
      expect(transactions[1].recipient).toBe(userOne.accounts[0].full_name);
      expect(transactions[1].is_deposit).toBe(false);

      expect(transactions[0].is_success).toBe(false);
      expect(transactions[0].recipient).toBe(userOne.accounts[0].full_name);
      expect(transactions[0].is_deposit).toBe(false);
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
      .get(getEndpoint(`/transactions/${TRANSACTIONS_ROUTES.banks}`))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const transactionsCount = 0;
    expect(transactions.length).toBe(transactionsCount);
  }

  const fakeBankDetails = {
    bank_name: "BANK_NAME",
    bank_account_full_name: "BANK_ACCOUNT_FULL_NAME",
    bank_account_number: "1234567890",
  };

  // console.log("userOne", userOne);
  // console.log("userTwo", userTwo);

  await handleAssertSendMoneyToBank(`/transactions/${TRANSACTIONS_ROUTES.banksSendMoney}`, {
    senderUser: userOne,
    bankDetails: fakeBankDetails,
    amount: 100,
    senderUserAccountsType: EAccountType.NORMAL,
  });
  await handleAssertSendMoneyToBank(`/transactions/${TRANSACTIONS_ROUTES.banksSendMoney}`, {
    senderUser: userOne,
    bankDetails: fakeBankDetails,
    amount: 10,
    senderUserAccountsType: EAccountType.NORMAL,
  });
  await handleAssertSendMoneyToBank(`/transactions/${TRANSACTIONS_ROUTES.banksSendMoney}`, {
    senderUser: userOne,
    bankDetails: fakeBankDetails,
    amount: 50,
    senderUserAccountsType: EAccountType.NORMAL,
  });
  await handleAssertSendMoneyToBank(`/transactions/${TRANSACTIONS_ROUTES.banksSendMoney}`, {
    senderUser: userThree,
    bankDetails: fakeBankDetails,
    amount: 100,
    senderUserAccountsType: EAccountType.NORMAL,
  });

  const largeAmount = 50000;
  const expectedErrorStatusCode = 400;
  // This doesn't create a transaction because it's a insufficient funds ClientError
  await handleAssertSendMoneyToBank(
    `/transactions/${TRANSACTIONS_ROUTES.banksSendMoney}`,
    {
      senderUser: userTwo,
      bankDetails: fakeBankDetails,
      amount: largeAmount,
      senderUserAccountsType: EAccountType.NORMAL,
    },
    expectedErrorStatusCode
  );

  for (const user of users) {
    const {
      body: { data: transactions },
    }: TResponse<TTransactionTransactionInHouse[]> = await request(app())
      .get(getEndpoint(`/transactions/${TRANSACTIONS_ROUTES.banks}`))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const transactionsCount = (() => {
      if (user.id === userOne.id) return 3;
      if (user.id === userTwo.id) return 0;
      if (user.id === userThree.id) return 1;
    })();
    expect(transactions.length).toBe(transactionsCount);

    if (user.id === userTwo.id) {
      continue;
    }

    expect(transactions[0].is_success).toBe(true);
    expect(transactions[0].is_deposit).toBe(false);
  }
});
