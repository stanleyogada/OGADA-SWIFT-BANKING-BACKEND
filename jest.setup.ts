require("dotenv").config();
import TestContext from "./src/utils/TestContext";

let testContext: TestContext;
beforeEach(async () => {
  testContext = await TestContext.build();
});

afterEach(async () => {
  await testContext.destroy();
});
