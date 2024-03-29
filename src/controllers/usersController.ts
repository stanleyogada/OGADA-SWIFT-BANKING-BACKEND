import Joi from "joi";
import type { NextFunction, Request, Response } from "express";

import UserRepo from "../repos/UserRepo";
import HashPassword from "../utils/HashPassword";
import { DEFAULT_USER_SIGNIN_CREDENTIALS, INPUT_SCHEMA_EMAIL_ALLOW_TLDS } from "../constants";
import handleInputValidate from "../utils/handleInputValidate";
import handleTryCatch from "../utils/handleTryCatch";
import APIError from "../utils/APIError";

import type { TRequestUser } from "../types/api";
import handleDeleteReturnCols from "../utils/handleDeleteReturnCols";

export const getAllUsers = handleTryCatch(async (_, res: Response) => {
  const users = await UserRepo.findManyBy();

  res.status(200).json({
    status: "success",
    data: users,
    count: users.length,
  });
});

export const getOneUser = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const showSensitiveData = req.params.show ? true : false;

  const user = await UserRepo.findOneBy(
    { id: +req.params.id },
    showSensitiveData ? ["login_passcode", "transfer_pin"] : undefined
  );

  if (!user) {
    return next(new APIError("User not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: showSensitiveData ? user : handleDeleteReturnCols(user, ["login_passcode", "transfer_pin"]),
  });
});

export const getOneUserByPhone = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserRepo.findOneBy({ phone: req.params.phone });

  if (!user) {
    return next(new APIError("User not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: handleDeleteReturnCols(user, ["login_passcode", "transfer_pin"]),
  });
});

export const getCurrentUser = handleTryCatch(async (req: TRequestUser, res: Response) => {
  const user = await UserRepo.findOneBy({ id: +req.user.id });

  res.status(200).json({
    status: "success",
    data: handleDeleteReturnCols(user, ["login_passcode", "transfer_pin"]),
  });
});

export const getAllAccounts = handleTryCatch(async (req: TRequestUser, res: Response) => {
  const accounts = await UserRepo.findAllAccountsByUserId(+req.user.id);

  res.status(200).json({
    status: "success",
    data: accounts,
    count: accounts.length,
  });
});

export const updateOneUser = handleTryCatch(async (req: TRequestUser, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, {
    nickname: Joi.string().min(3).max(30),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: INPUT_SCHEMA_EMAIL_ALLOW_TLDS },
    }),
  });

  const { user } = req;

  const reqBody = {
    ...req.body,
    ...(req.body.email && { email_is_verified: false }),
  };

  await UserRepo.findOneByAndUpdate({ id: +user.id }, reqBody);

  res.status(200).json({
    status: "success",
    message: "User updated successfully!",
  });
});

export const deleteOneUser = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserRepo.deleteOneById(req.params.id);

  if (!user) {
    return next(new APIError("User not found!", 404));
  }

  res.status(204).json({});
});

export const updateLoginPasscode = handleTryCatch(async (req: TRequestUser, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, {
    old_login_passcode: Joi.string()
      .pattern(new RegExp("^[0-9]{6,6}$"))
      .message('"old_login_passcode" must be six digits')
      .required(),
    new_login_passcode: Joi.string()
      .pattern(new RegExp("^[0-9]{6,6}$"))
      .message('"new_login_passcode" must be six digits')
      .required(),
  });

  const { user: _user } = req;
  const user = await UserRepo.findOneBy({ id: +_user.id }, ["login_passcode", "transfer_pin"]);

  const getIsMatch = async () => {
    if (DEFAULT_USER_SIGNIN_CREDENTIALS.email === user.email) {
      return req.body.old_login_passcode === user.login_passcode;
    }

    return await HashPassword.handleCheck(req.body.old_login_passcode, user.login_passcode);
  };

  if (!getIsMatch()) {
    return next(new APIError("Old login passcode is incorrect!", 400));
  }

  const getHash = async () => {
    if (DEFAULT_USER_SIGNIN_CREDENTIALS.email === user.email) {
      return req.body.new_login_passcode;
    }

    return await HashPassword.handleHash(req.body.new_login_passcode);
  };

  const hash = await getHash();
  await UserRepo.findOneByAndUpdate({ id: user.id }, { login_passcode: hash });

  res.status(200).json({
    status: "success",
    message: "Login passcode updated successfully!",
  });
});
