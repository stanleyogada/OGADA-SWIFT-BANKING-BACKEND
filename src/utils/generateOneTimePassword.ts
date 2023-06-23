import { randomBytes } from "crypto";

function generateOneTimePassword() {
  const bytes = randomBytes(10);
  const oneTimePasscode = bytes.toString("hex").toUpperCase();

  return oneTimePasscode;
}

export default generateOneTimePassword;
