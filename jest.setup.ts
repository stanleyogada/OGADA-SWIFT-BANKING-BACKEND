import TestContext from "./src/utils/testContext";

let testContext: TestContext;
beforeEach(async () => {
  testContext = await TestContext.build();
});

afterEach(async () => {
  await testContext.destroy();
});
