import type { NextFunction } from "express";

import APIError from "../utils/APIError";
import HashPassword from "../utils/HashPassword";

import type { TRequestUser } from "../types/api";

const handleValidateTransferPin = async (req: TRequestUser, _, next: NextFunction) => {
  const { user } = req;
  const { transfer_pin } = req.body;

  const isTransferPinValid = await HashPassword.handleCheck(transfer_pin, user.transfer_pin);

  if (!isTransferPinValid) {
    return next(new APIError("Transfer pin is not correct", 400));
  }

  delete req.body.transfer_pin;

  next();
};

export default handleValidateTransferPin;
