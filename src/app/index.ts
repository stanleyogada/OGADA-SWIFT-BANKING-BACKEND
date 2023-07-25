import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import usersRouter from "src/routes/usersRouter";
import authRouter from "src/routes/authRouter";
import ErrorHandler from "src/middleware/ErrorHandler";
import APIError from "src/utils/APIError";

export default () => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(helmet());
  app.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );

  // Logging
  (() => {
    if (process.env.NODE_ENV === "test") return;

    app.use(
      (() => {
        if (process.env.NODE_ENV === "development") {
          return morgan("dev");
        }

        if (process.env.NODE_ENV === "production") {
          return morgan("combined");
        }
      })()
    );
  })();

  // Routes
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/auth", authRouter);

  app.use("*", (req, _res, next) => {
    next(new APIError(`can't find ${req.originalUrl}, with the method:${req.method}, on this server!`));
  });

  // ERROR HANDLER MIDDLEWARE (Last middleware to use)
  app.use(ErrorHandler);

  return app;
};
