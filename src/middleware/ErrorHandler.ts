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
  if (err.isAPIError || err.status === "fail") {
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

  if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
    err.statusCode = 401;
    err.status = "fail";
    err.message = "Invalid token. Please log in again!";
  }

  if (err.stack.includes("ValidationError")) {
    err.statusCode = 400;
    err.status = "fail";
    err.message = "Invalid request body";
  }

  if (app().get("env") === "development") {
    sendDev(err, res);
  } else {
    sendProd(err, res);
  }
};

export default ErrorHandler;
