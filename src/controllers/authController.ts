import { randomBytes } from "crypto";
import Joi from "joi";
import type { Request, Response } from "express";

import UserRepo from "../repos/UserRepo";
import HashPassword from "../utils/HashPassword";

export const forgetLoginPasscode = async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      phone: Joi.string().min(10).max(10).required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net"] },
        })
        .required(),
    });

    await schema.validateAsync(req.body);

    const user = await UserRepo.findOneByEmailAndPhone(req.body);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found!",
      });
    }

    const one_time_password = randomBytes(10).toString("hex");
    const users = await UserRepo.updateOneById(user.id, {
      one_time_password,
    });

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
    if (process.env.NODE_ENV !== "prod") {
      console.log(err, err.message);
    }

    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const resetLoginPasscode = async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      new_login_passcode: Joi.string()
        .pattern(new RegExp("^[0-9]{6,6}$"))
        .message('"new_login_passcode" must be six digits'),
      one_time_password: Joi.string()
        .pattern(new RegExp("^[0-9a-z]{20,20}$", "i"))
        .message('"one_time_password" must be valid'),
    });

    await schema.validateAsync(req.body);

    const user = await UserRepo.findOneByOTP(req.body.one_time_password);

    const hash = await HashPassword.handleHash(req.body.new_login_passcode);

    await UserRepo.updateOneById(user.id, {
      one_time_password: null,
      login_passcode: hash,
    });

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
