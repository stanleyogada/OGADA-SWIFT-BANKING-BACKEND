import type { NextFunction } from "express";

import APIError from "../utils/APIError";
import HashPassword from "../utils/HashPassword";

import type { TRequestUser } from "../types/api";
import UserRepo from "../repos/UserRepo";
import { DEFAULT_USER_SIGNIN_CREDENTIALS } from "../constants";

const handleValidateTransferPin = async (req: TRequestUser, _, next: NextFunction) => {
  const {
    user: { id },
  } = req;
  const { transfer_pin } = req.body;

  const user = await UserRepo.findOneBy(
    {
      id,
    },
    ["transfer_pin"]
  );

  const getIsMatch = async () => {
    if (DEFAULT_USER_SIGNIN_CREDENTIALS.email === user.email) {
      return transfer_pin === DEFAULT_USER_SIGNIN_CREDENTIALS.transfer_pin;
    }

    return await HashPassword.handleCheck(transfer_pin, user.transfer_pin);
  };

  if (!(await getIsMatch())) {
    return next(new APIError("Transfer pin is not correct", 400));
  }

  delete req.body.transfer_pin;

  next();
};

export default handleValidateTransferPin;
