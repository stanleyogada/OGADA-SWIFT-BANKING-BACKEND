import express from "express";
import helmet from "helmet";
import cors from "cors";
import usersRouter from "../routes/usersRouter";

export default () => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(helmet());
  app.use(cors());

  // Routes
  app.use("/api/v1/users", usersRouter);

  return app;
};
