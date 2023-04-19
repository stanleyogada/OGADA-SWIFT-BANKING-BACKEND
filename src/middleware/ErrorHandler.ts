import type { Request, Response, NextFunction } from "express";
import app from "../app";
import APIError from "../utils/APIError";

const sendDev = (err: APIError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    err,
  });
};

const sendProd = (err: APIError, res: Response) => {
  if (err.isAPIError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: "An unexpected error occurred! Please try again later",
  });
};

const ErrorHandler = (err: APIError, _: Request, res: Response, _next: NextFunction) => {
  err = { ...err, message: err.message, stack: err.stack };
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (app().get("env") === "development") {
    sendDev(err, res);
  } else {
    sendProd(err, res);
  }
};

export default ErrorHandler;
