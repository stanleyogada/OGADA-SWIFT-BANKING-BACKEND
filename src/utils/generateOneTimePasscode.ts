import { randomBytes } from "crypto";

function generateOneTimePasscode() {
  const bytes = randomBytes(3);
  const oneTimePasscode = bytes.toString("hex").slice(0, 6).toUpperCase();

  return oneTimePasscode;
}

export default generateOneTimePasscode;
