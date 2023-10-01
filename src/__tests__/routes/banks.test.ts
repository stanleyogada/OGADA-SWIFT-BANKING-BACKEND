import request from "supertest";

import app from "../../app";
import { getEndpoint } from "../../utils/tests";
import { TBank, TBankVerification } from "../../types/banks";

test("Have /banks working", async () => {
  const {
    body: { data: banks },
  }: {
    body: { data: TBank[] };
  } = await request(app()).get(getEndpoint("/banks")).expect(200);

  expect(banks.length).toBeGreaterThan(0);
  expect(banks[0]).toHaveProperty("code");
  expect(banks[0]).toHaveProperty("name");
  expect(banks[0]).toHaveProperty("logo");
});

test("Have /banks/verify working", async () => {
  const details = {
    correct: {
      accountName: "CHINEDU STANLEY OGADA",
      accountNumber: "1597576718",
      bankCode: "044",
    },
    wrong: {
      accountNumber: "1234567890",
      bankCode: "000",
    },
  };

  await request(app()).get(getEndpoint(`/banks/verify`)).expect(400);

  await request(app())
    .get(getEndpoint(`/banks/verify?bank_code=${details.correct.bankCode}`))
    .expect(400);

  await request(app())
    .get(getEndpoint(`/banks/verify?bank_account_number=${details.correct.accountNumber}`))
    .expect(400);

  await request(app())
    .get(
      getEndpoint(
        `/banks/verify?bank_code=${details.correct.bankCode}&bank_account_number=${details.wrong.accountNumber}`
      )
    )
    .expect(400);

  const {
    body: { data },
  }: {
    body: { data: TBankVerification };
  } = await request(app())
    .get(
      getEndpoint(
        `/banks/verify?bank_code=${details.correct.bankCode}&bank_account_number=${details.correct.accountNumber}`
      )
    )
    .expect(200);
  expect(data.account_name).toEqual(details.correct.accountName);
});
