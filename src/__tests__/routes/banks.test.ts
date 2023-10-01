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
  const accountName = "CHINEDU STANLEY OGADA";
  const accountNumber = "1597576718";
  const bankCode = "044";

  const {
    body: { data },
  }: {
    body: { data: TBankVerification };
  } = await request(app())
    .get(getEndpoint(`/banks/verify?bank_code=${bankCode}&bank_account_number=${accountNumber}`))
    .expect(200);

  expect(data.account_name).toEqual(accountName);
});
