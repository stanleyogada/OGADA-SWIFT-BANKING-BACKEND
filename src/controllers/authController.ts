import { randomBytes } from "crypto";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { promisify } from "util";

import type { NextFunction, Request, Response } from "express";

import UserRepo from "../repos/UserRepo";
import HashPassword from "../utils/HashPassword";
import { INPUT_SCHEMA_EMAIL_ALLOW_TLDS } from "../constants";
import handleInputValidate from "../utils/handleInputValidate";
import handleTryCatch from "../utils/handleTryCatch";
import APIError from "../utils/APIError";

const signJwt = promisify(jwt.sign);

export const forgetLoginPasscode = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, {
    phone: Joi.string().min(10).max(10).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: INPUT_SCHEMA_EMAIL_ALLOW_TLDS },
      })
      .required(),
  });

  const one_time_password = randomBytes(10).toString("hex");
  // TODO: const expire_at = new Date(new Date().getTime() + 1000 * 60 * 10); // 10 minutes
  const user = await UserRepo.findOneByAndUpdate(req.body, {
    one_time_password,
    // TODO: expire_at,
  });

  if (!user) {
    return next(new APIError("User not found!", 404));
  }

  // TODO: Send one_time_password to user's email address
  const json = (() => {
    if (process.env.NODE_ENV === "test")
      return {
        status: "success",
        data: one_time_password,
      };

    return {
      status: "success",
    };
  })();

  res.status(200).json(json);
});

export const resetLoginPasscode = handleTryCatch(async (req: Request, res: Response) => {
  await handleInputValidate(req.body, {
    new_login_passcode: Joi.string()
      .pattern(new RegExp("^[0-9]{6,6}$"))
      .message('"new_login_passcode" must be six digits'),
    one_time_password: Joi.string()
      .pattern(new RegExp("^[0-9a-z]{20,20}$", "i"))
      .message('"one_time_password" must be valid'),
  });

  const hash = await HashPassword.handleHash(req.body.new_login_passcode);

  // TODO: const user = await UserRepo.findOneBy({ one_time_password: req.body.one_time_password });
  // TODO: if(new Date(user.expire_at).getTime() < new Date().getTime()) return next(new APIError("Expe"))

  await UserRepo.findOneByAndUpdate(
    { one_time_password: req.body.one_time_password },
    {
      one_time_password: null,
      login_passcode: hash,
    }
  );

  res.status(200).json({
    status: "success",
  });
});

export const signin = handleTryCatch(async (req: Request, res: Response, next: NextFunction) => {
  await handleInputValidate(req.body, {
    phone: Joi.string().min(10).max(10).required(),
    login_passcode: Joi.string().pattern(new RegExp("^[0-9]{6,6}$")).message('"login_passcode" must be six digits'),
  });

  const user = await UserRepo.findOneBy({ phone: req.body.phone });
  if (!user) {
    return next(new APIError("Invalid credentials!", 401));
  }
  const isMatch = await HashPassword.handleCheck(req.body.login_passcode, user.login_passcode);
  if (!isMatch) {
    return next(new APIError("Invalid credentials!", 401));
  }

  const token = await signJwt(user, process.env.JWT_PRIVATE_SECRET_KEY, { expiresIn: "10m" });

  // Set the token as a cookie in the response
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    // sameSite: "strict", // TODO: Add this back or Add CORS to app middleware
    maxAge: 600000,
  });

  res.status(200).json({
    status: "success",
    data: user,
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
