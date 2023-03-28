import type { Request, Response } from "express";
import Joi from "joi";
import UserRepo from "../repos/UserRepo";

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
    const user = await UserRepo.findOneById(req.params.id);

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
    const schema = Joi.object({
      first_name: Joi.string().min(3).max(30).required(),
      last_name: Joi.string().min(3).max(30).required(),
      middle_name: Joi.string().min(3).max(30),
      nickname: Joi.string().min(3).max(30),
      phone: Joi.string().min(10).max(10).required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net"] },
        })
        .required(),
      login_passcode: Joi.string().pattern(new RegExp("^[0-9]{6,6}$")).message('"login_passcode" must be six digits'),
    });

    await schema.validateAsync(req.body);

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
    const schema = Joi.object({
      nickname: Joi.string().min(3).max(30),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    });

    await schema.validateAsync(req.body);

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
