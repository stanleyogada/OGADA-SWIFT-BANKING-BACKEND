import express from "express";
import helmet from "helmet";
import cors from "cors";
import usersRouter from "../routes/usersRouter";
import authRouter from "../routes/authRouter";

export default () => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(helmet());
  app.use(cors());

  // Routes
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/auth", authRouter);

  return app;
};
