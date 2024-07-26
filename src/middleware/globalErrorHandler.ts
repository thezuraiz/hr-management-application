import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

const globalErrorHander = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode;
  return res.status(statusCode).json({
    error: error.message,
    errorStack:
      config.node_env == "DEVELOPMENT" ? error.stack : "Not Available",
  });
};

export default globalErrorHander;
