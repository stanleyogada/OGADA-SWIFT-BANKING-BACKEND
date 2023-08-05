import Joi from "joi";

import type { PartialSchemaMap } from "joi";
import type { Request } from "express";

const handleInputValidate = async (reqBody: Request["body"], schemaObject: PartialSchemaMap<unknown>) => {
  const schema = Joi.object(schemaObject);
  await schema.validateAsync(reqBody);
};

export default handleInputValidate;
