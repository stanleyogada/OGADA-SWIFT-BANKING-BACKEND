import { randomBytes } from "crypto";
import Joi from "joi";
import type { Request, Response } from "express";

import UserRepo from "../repos/UserRepo";
import HashPassword from "../utils/HashPassword";
import { INPUT_SCHEMA_EMAIL_ALLOW_TLDS } from "../constants";
import handleInputValidate from "../utils/handleInputValidate";

export const forgetLoginPasscode = async (req: Request, res: Response) => {
  try {
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
    const user = (await UserRepo.findByAndUpdate(req.body, { one_time_password }))[0];

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found!",
      });
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
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const resetLoginPasscode = async (req: Request, res: Response) => {
  try {
    await handleInputValidate(req.body, {
      new_login_passcode: Joi.string()
        .pattern(new RegExp("^[0-9]{6,6}$"))
        .message('"new_login_passcode" must be six digits'),
      one_time_password: Joi.string()
        .pattern(new RegExp("^[0-9a-z]{20,20}$", "i"))
        .message('"one_time_password" must be valid'),
    });

    const hash = await HashPassword.handleHash(req.body.new_login_passcode);
    await UserRepo.findByAndUpdate(
      { one_time_password: req.body.one_time_password },
      {
        one_time_password: null,
        login_passcode: hash,
      }
    );

    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "prod") {
      console.log(err, err.message);
    }

    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
