import Joi from "joi";
import jwt from "jsonwebtoken";
const { promisify } = require("util");

import type { NextFunction, Request, Response } from "express";

import UserRepo from "../repos/UserRepo";
import HashPassword from "../utils/HashPassword";
import { INPUT_SCHEMA_EMAIL_ALLOW_TLDS } from "../constants";
import handleInputValidate from "../utils/handleInputValidate";
import handleTryCatch from "../utils/handleTryCatch";
import APIError from "../utils/APIError";
import handleDeleteReturnCols from "../utils/handleDeleteReturnCols";
import sendEmail from "../services/sendEmail";
import { getForgetLoginPasscodeEmailTemplate, getSendEmailVerificationEmailTemplate } from "../emails";
import generateOneTimePassword from "../utils/generateOneTimePassword";
import { TAdminUser, TUser } from "../types/users";
import AdminUserRepo from "../repos/AdminUserRepo";
import pool from "../utils/pool";
import { AccountRepo } from "../repos/AccountRepo";

const signJwt = promisify(jwt.sign);

export const forgetLoginPasscode = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, next, {
    phone: Joi.string().min(10).max(10).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: INPUT_SCHEMA_EMAIL_ALLOW_TLDS },
      })
      .required(),
  });

  const one_time_password = generateOneTimePassword();
  const user = await UserRepo.findOneByAndUpdate(req.body, {
    one_time_password,
  });

  if (!user) {
    return next(new APIError("User not found!", 404));
  }

  await sendEmail({
    to: user.email,
    subject: "Forgot Login Passcode",
    text: `Your one time password is ${one_time_password}`,
    html: getForgetLoginPasscodeEmailTemplate({ one_time_password }),
  });

  const json = (() => {
    if (process.env.NODE_ENV !== "production")
      return {
        status: "success",
        data: one_time_password,
      };

    return {
      status: "success",
      message: "One time password sent to your email address!",
    };
  })();

  res.status(200).json(json);
});

export const resetLoginPasscode = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, next, {
    new_login_passcode: Joi.string()
      .pattern(new RegExp("^[0-9]{6,6}$"))
      .message('"new_login_passcode" must be six digits')
      .required(),
    one_time_password: Joi.string()
      .pattern(new RegExp("^[0-9a-z]{20,20}$", "i"))
      .message('"one_time_password" must be valid')
      .required(),
  });

  const hash = await HashPassword.handleHash(req.body.new_login_passcode);
  const user = await UserRepo.findOneBy({ one_time_password: req.body.one_time_password });
  if (!user) {
    return next(new APIError("Invalid one time password!", 400));
  }

  await UserRepo.findOneByAndUpdate(
    { id: user.id },
    {
      one_time_password: null,
      login_passcode: hash,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Login passcode reset successfully!",
  });
});

export const signin = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, next, {
    phone: Joi.string().min(10).max(10).required(),
    login_passcode: Joi.string()
      .pattern(new RegExp("^[0-9]{6,6}$"))
      .message('"login_passcode" must be six digits')
      .required(),
  });

  const returnCols: Array<keyof TUser> = ["login_passcode", "transfer_pin"];
  const user = await UserRepo.findOneBy({ phone: req.body.phone }, returnCols);
  if (!user) {
    return next(new APIError("Invalid credentials!", 400));
  }

  const isMatch = await HashPassword.handleCheck(req.body.login_passcode, user.login_passcode);
  if (!isMatch) {
    return next(new APIError("Invalid credentials!", 400));
  }

  const token = await signJwt(handleDeleteReturnCols<TUser>(user, returnCols), process.env.JWT_PRIVATE_SECRET_KEY, {
    expiresIn: "10m",
  });

  // Set the token as a cookie in the response
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 10, // 10 minutes
  });

  res.status(200).json({
    status: "success",
    data: handleDeleteReturnCols<TUser>(user, returnCols),
    token,
  });
});

export const signout = handleTryCatch(async (_req: Request, res: Response) => {
  res.clearCookie("token");

  res.status(200).json({
    status: "success",
    message: "Signed out successfully!",
  });
});

export const signup = handleTryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    await handleInputValidate(req.body, next, {
      first_name: Joi.string().min(2).max(30).required(),
      last_name: Joi.string().min(2).max(30).required(),
      middle_name: Joi.string().min(2).max(30),
      phone: Joi.string().min(10).max(10).required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: INPUT_SCHEMA_EMAIL_ALLOW_TLDS },
        })
        .required(),
      login_passcode: Joi.string()
        .pattern(new RegExp("^[0-9]{6,6}$"))
        .message('"login_passcode" must be six digits')
        .required(),
      transfer_pin: Joi.string()
        .pattern(new RegExp("^[0-9]{4,4}$"))
        .message('"transfer_pin" must be 4 digits')
        .required(),
    });

    req.body.login_passcode = await HashPassword.handleHash(req.body.login_passcode);
    req.body.transfer_pin = await HashPassword.handleHash(req.body.transfer_pin);

    await pool.query(`BEGIN TRANSACTION;`);
    const user = await UserRepo.createOne(req.body);
    await AccountRepo.createAccounts(user.id);
    await pool.query(`COMMIT TRANSACTION;`);

    res.status(201).json({
      status: "success",
      data: handleDeleteReturnCols<TUser>(user, ["login_passcode", "transfer_pin"]),
    });
  },
  async () => {
    // TODO: only rollback if transaction is active
    await pool.query(`ROLLBACK TRANSACTION;`); // TODO: test this (make an error creating an account and user then check if it's rolled back)
  }
);

export const sendEmailVerification = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, next, {
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: INPUT_SCHEMA_EMAIL_ALLOW_TLDS },
      })
      .required(),
  });

  const one_time_password = generateOneTimePassword();
  const user = await UserRepo.findOneByAndUpdate(req.body, {
    one_time_password,
  });

  if (!user) {
    return next(new APIError("User not found!", 404));
  }

  await sendEmail({
    to: user.email,
    subject: "Verify Email Address",
    text: `Your one time password is ${one_time_password}`,
    html: getSendEmailVerificationEmailTemplate({ one_time_password }),
  });

  const json = (() => {
    if (process.env.NODE_ENV !== "production")
      return {
        status: "success",
        data: one_time_password,
      };

    return {
      status: "success",
      message: "One time password sent to your email address!",
    };
  })();

  res.status(200).json(json);
});

export const confirmEmailVerification = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  await handleInputValidate({ one_time_password: req.params.otp }, next, {
    one_time_password: Joi.string()
      .pattern(new RegExp("^[0-9a-z]{20,20}$", "i"))
      .message('"one_time_password" must be valid')
      .required(),
  });

  const user = await UserRepo.findOneBy({ one_time_password: req.params.otp });
  if (!user) {
    return next(new APIError("Invalid one time password!", 400));
  }

  await UserRepo.findOneByAndUpdate(
    { id: user.id },
    {
      one_time_password: null,
      email_is_verified: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Email address verified successfully!",
  });
});

export const signinAdmin = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, next, {
    phone: Joi.string().min(10).max(10).required(),
    login_passcode: Joi.string()
      .pattern(new RegExp("^[0-9]{6,6}$"))
      .message('"login_passcode" must be six digits')
      .required(),
  });

  const returnCols: Array<keyof TAdminUser> = ["login_passcode"];

  const adminUser = await AdminUserRepo.findOneBy({ phone: req.body.phone }, returnCols);
  if (!adminUser) {
    return next(new APIError("Invalid credentials!", 400));
  }

  const isMatch = await HashPassword.handleCheck(req.body.login_passcode, adminUser.login_passcode);
  if (!isMatch) {
    return next(new APIError("Invalid credentials!", 400));
  }

  const token = await signJwt(
    handleDeleteReturnCols<TAdminUser>(adminUser, returnCols),
    process.env.JWT_PRIVATE_SECRET_KEY
  );

  // Set the token as a cookie in the response
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({
    status: "success",
    data: handleDeleteReturnCols<TAdminUser>(adminUser, returnCols),
    token,
  });
});
