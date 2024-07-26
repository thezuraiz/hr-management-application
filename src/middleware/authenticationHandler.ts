import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { config } from "../config/config";
import { verify } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId: string;
}
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(401, "User not Authenticated"));
  }

  try {
    const parsedToken = token.split(" ")[1];
    const decoded = await verify(parsedToken, config.jwt_key as string);

    const _req = req as AuthRequest;
    _req.userId = decoded.sub as string;
  } catch (e) {
    return next(createHttpError(401, "Token Expired: " + e));
  }
  next();
};

export default authenticate;
