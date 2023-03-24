import TestContext from "./src/utils/testContext";

let testContext: TestContext;
beforeAll(async () => {
  testContext = await TestContext.build();
});

beforeEach(async () => {
  await testContext.reset();
});

afterAll(async () => {
  await testContext.destroy();
});
