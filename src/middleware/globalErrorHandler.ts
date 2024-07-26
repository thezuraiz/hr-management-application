import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";

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
      process.env.NODE_ENV == "DEVELOPMENT" ? error.stack : "Not Available",
  });
};

export default globalErrorHander;
