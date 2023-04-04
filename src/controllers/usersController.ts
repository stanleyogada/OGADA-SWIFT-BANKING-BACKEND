import Joi from "joi";
import type { Request, Response } from "express";

import UserRepo from "../repos/UserRepo";
import HashPassword from "../utils/HashPassword";
import { INPUT_SCHEMA_EMAIL_ALLOW_TLDS } from "../constants";
import handleInputValidate from "../utils/handleInputValidate";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserRepo.find();

    res.status(200).json({
      status: "success",
      data: users,
      count: users.length,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const getOneUser = async (req: Request, res: Response) => {
  try {
    const user = (await UserRepo.findBy({ id: +req.params.id }))[0];

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found!",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const createOneUser = async (req: Request, res: Response) => {
  try {
    await handleInputValidate(req.body, {
      first_name: Joi.string().min(3).max(30).required(),
      last_name: Joi.string().min(3).max(30).required(),
      middle_name: Joi.string().min(3).max(30),
      nickname: Joi.string().min(3).max(30),
      phone: Joi.string().min(10).max(10).required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: INPUT_SCHEMA_EMAIL_ALLOW_TLDS },
        })
        .required(),
      login_passcode: Joi.string().pattern(new RegExp("^[0-9]{6,6}$")).message('"login_passcode" must be six digits'),
    });

    const hash = await HashPassword.handleHash(req.body.login_passcode);
    req.body.login_passcode = hash;

    const user = await UserRepo.createOne(req.body);

    res.status(201).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const updateOneUser = async (req: Request, res: Response) => {
  try {
    await handleInputValidate(req.body, {
      nickname: Joi.string().min(3).max(30),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: INPUT_SCHEMA_EMAIL_ALLOW_TLDS },
      }),
    });

    const user = await UserRepo.updateOneById(req.params.id, req.body);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found!",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }
};

export const deleteOneUser = async (req: Request, res: Response) => {
  try {
    const user = await UserRepo.deleteOneById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found!",
      });
    }

    res.status(204).json({});
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
