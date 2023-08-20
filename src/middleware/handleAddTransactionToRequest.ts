import { NextFunction } from "express";
import handleTryCatch from "../utils/handleTryCatch";

import type { TRequestTransaction } from "../types/api";
import APIError from "../utils/APIError";

const handleAddTransactionToRequest = (resource: string) =>
  handleTryCatch(async (req: TRequestTransaction, _, next: NextFunction) => {
    const { transactionId } = req.params;

    if (!transactionId) {
      return next(new APIError("`transactionId` param is required", 400));
    }

    req.resource = resource;
    req.transactionId = transactionId;

    return next();
  });

export default handleAddTransactionToRequest;
