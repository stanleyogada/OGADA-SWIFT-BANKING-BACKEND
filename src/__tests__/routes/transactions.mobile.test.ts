import request from "supertest";

import app from "../../app";
import { TRANSACTIONS_ROUTES } from "../../constants/routes";
import { getEndpoint, handleAssertSendMoneyToMobile, handleSignupManyAccountUsers } from "../../utils/tests";
import { TTransactionTransactionMobile, TTransactionTransactionReward } from "../../types/transactions";
import { EAccountType } from "../../types/accounts";

type TResponse<T> = {
  body: {
    data: T;
  };
};

test("Ensures CASHBACK rewards when mobile transfer is successful and transaction is recorded", async () => {
  const createUserCount = 3;
  const users = await handleSignupManyAccountUsers(createUserCount);
  const [userOne, userTwo, userThree] = users;

  const handleGetUserTransactions = async (user: typeof userOne) => {
    const {
      body: { data: mobileTransactions },
    }: TResponse<TTransactionTransactionMobile[]> = await request(app())
      .get(getEndpoint(`/transactions/${TRANSACTIONS_ROUTES.mobiles}`))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    const {
      body: { data: cashbackTransactions },
    }: TResponse<TTransactionTransactionReward[]> = await request(app())
      .get(getEndpoint(`/transactions/${TRANSACTIONS_ROUTES.rewards}/cashback`))
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    return {
      mobileTransactions,
      cashbackTransactions,
    };
  };

  for (const user of users) {
    const { mobileTransactions, cashbackTransactions } = await handleGetUserTransactions(user);

    const transactionsCount = 0;
    expect(mobileTransactions.length).toBe(transactionsCount);
    // expect(cashbackTransactions.length).toBe(transactionsCount);
  }

  const mobileDetails = {
    is_airtime: false,
    operator: "MTN",
    phone_number: "08123456789",
  };

  await handleAssertSendMoneyToMobile(`/transactions/${TRANSACTIONS_ROUTES.mobilesSendMoney}`, {
    senderUser: userOne,
    senderUserAccountsType: EAccountType.NORMAL,
    mobileDetails,
    amount: 100,
  });

  await handleAssertSendMoneyToMobile(`/transactions/${TRANSACTIONS_ROUTES.mobilesSendMoney}`, {
    senderUser: userTwo,
    senderUserAccountsType: EAccountType.NORMAL,
    mobileDetails,
    amount: 50,
  });

  await handleAssertSendMoneyToMobile(`/transactions/${TRANSACTIONS_ROUTES.mobilesSendMoney}`, {
    senderUser: userThree,
    senderUserAccountsType: EAccountType.NORMAL,
    mobileDetails,
    amount: 10,
  });
  await handleAssertSendMoneyToMobile(`/transactions/${TRANSACTIONS_ROUTES.mobilesSendMoney}`, {
    senderUser: userThree,
    senderUserAccountsType: EAccountType.NORMAL,
    mobileDetails,
    amount: 100,
  });

  for (const user of users) {
    const { mobileTransactions, cashbackTransactions } = await handleGetUserTransactions(user);

    const transactionsCount = (() => {
      if (user.id === userOne.id) return 1;
      if (user.id === userTwo.id) return 1;
      if (user.id === userThree.id) return 2;
    })();
    expect(mobileTransactions.length).toBe(transactionsCount);
    expect(cashbackTransactions.length).toBe(transactionsCount);
  }
});
