import Joi from "joi";

import type { PartialSchemaMap } from "joi";
import type { NextFunction, Request } from "express";

import APIError from "./APIError";

const handleInputValidate = async (
  reqBody: Request["body"],
  next: NextFunction,
  schemaObject: PartialSchemaMap<unknown>
) => {
  try {
    const schema = Joi.object(schemaObject);
    await schema.validateAsync(reqBody);
  } catch (err) {
    next(new APIError(err.message, 400));
  }
};

export default handleInputValidate;
