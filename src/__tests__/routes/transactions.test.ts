import { handleAssertSendMoney, handleSignupManyAccountUsers } from "../../utils/tests";
import { EAccountType } from "../../types/accounts";

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

  await handleAssertSendMoney(
    "/transactions/in-house/send-money",
    {
      senderUser: userTwo,
      receiverUser: userOne,
      amount: 55.5, // TODO: make this a constant
      accountsTypes: {
        sender: EAccountType.NORMAL,
        receiver: EAccountType.NORMAL,
      },
    },
    500
  );
});
