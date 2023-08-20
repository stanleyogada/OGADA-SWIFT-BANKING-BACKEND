import request from "supertest";
import {
  getEndpoint,
  handleAssertSendMoneyInHouse,
  handleAssertSendMoneyToBank,
  handleAssertSendMoneyToMobile,
  handleSignupManyAccountUsers,
} from "../../utils/tests";
import { EAccountType } from "../../types/accounts";
import { TRANSACTIONS_ROUTES } from "../../constants/routes";
import app from "../../app";
import {
  ETransactionType,
  TTransactionAll,
  TTransactionTransactionBank,
  TTransactionTransactionInHouse,
  TTransactionTransactionMobile,
  TTransactionTransactionReward,
} from "../../types/transactions";

type TResponse<T> = {
  body: {
    data: T;
  };
};

test("Ensures money can be sent in-house and transactions are recorded", async () => {
  const users = await handleSignupManyAccountUsers(2);
  const [userOne, userTwo] = users;

  await handleAssertSendMoneyInHouse(`/transactions${TRANSACTIONS_ROUTES.inHousesSendMoney}`, {
    senderUser: userOne,
    receiverUser: userTwo,
    amount: 100,
    accountsTypes: {
      sender: EAccountType.NORMAL,
      receiver: EAccountType.NORMAL,
    },
  });

  await handleAssertSendMoneyToBank(`/transactions${TRANSACTIONS_ROUTES.banksSendMoney}`, {
    senderUser: userOne,
    bankDetails: {
      bank_name: "BANK_NAME",
      bank_account_full_name: "BANK_ACCOUNT_FULL_NAME",
      bank_account_number: "1234567890",
    },
    amount: 100,
    senderUserAccountsType: EAccountType.NORMAL,
  });

  await handleAssertSendMoneyToMobile(`/transactions${TRANSACTIONS_ROUTES.mobilesSendMoney}`, {
    senderUser: userOne,
    senderUserAccountsType: EAccountType.NORMAL,
    mobileDetails: {
      is_airtime: false,
      operator: "MTN",
      phone_number: "08123456789",
    },
    amount: 100,
  });

  const {
    body: { data: userOneTransactions },
  }: TResponse<TTransactionAll[]> = await request(app())
    .get(getEndpoint(`/transactions${TRANSACTIONS_ROUTES.all}`))
    .set("Authorization", `Bearer ${userOne.token}`)
    .expect(200);

  expect(userOneTransactions.length).toBe(4);

  expect(userOneTransactions[0].transaction_type).toBe(ETransactionType.REWARD);
  expect(userOneTransactions[1].transaction_type).toBe(ETransactionType.MOBILE);
  expect(userOneTransactions[2].transaction_type).toBe(ETransactionType.TRANSFER_TO_BANK);
  expect(userOneTransactions[3].transaction_type).toBe(ETransactionType.IN_HOUSE_TRANSFER);

  for (const transaction of userOneTransactions) {
    expect(transaction.is_success).toBe(true);
    if (transaction.transaction_type === ETransactionType.REWARD) {
      expect(transaction.is_deposit).toBe(true);
    } else {
      expect(transaction.is_deposit).toBe(false);
    }

    const {
      body: { data: transactionData },
    }: TResponse<
      | TTransactionTransactionInHouse
      | TTransactionTransactionBank
      | TTransactionTransactionReward
      | TTransactionTransactionMobile
    > = await request(app())
      .get(getEndpoint(`/transactions/${transaction.transaction_type.toLowerCase()}/${transaction.transaction_id}`))
      .set("Authorization", `Bearer ${userOne.token}`)
      .expect(200);

    switch (transaction.transaction_type) {
      case ETransactionType.REWARD:
        expect((transactionData as TTransactionTransactionReward).note).toMatch(/cashback/i);
        break;
      case ETransactionType.MOBILE:
        expect((transactionData as TTransactionTransactionMobile).operator).toMatch(/mtn/i);
        break;
      case ETransactionType.TRANSFER_TO_BANK:
        expect((transactionData as TTransactionTransactionBank).bank_name).toMatch(/bank_name/i);
        break;
      case ETransactionType.IN_HOUSE_TRANSFER:
        expect((transactionData as TTransactionTransactionInHouse).recipient).toBe(userTwo.accounts[0].full_name);
        break;
    }
  }

  const {
    body: { data: userTwoTransactions },
  }: TResponse<TTransactionAll[]> = await request(app())
    .get(getEndpoint(`/transactions${TRANSACTIONS_ROUTES.all}`))
    .set("Authorization", `Bearer ${userTwo.token}`)
    .expect(200);

  expect(userTwoTransactions.length).toBe(1);
  expect(userTwoTransactions[0].transaction_type).toBe(ETransactionType.IN_HOUSE_TRANSFER);
  expect(userTwoTransactions[0].is_success).toBe(true);
  expect(userTwoTransactions[0].is_deposit).toBe(true);
});
