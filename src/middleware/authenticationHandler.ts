import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { config } from "../config/config";
import { verify } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userID: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authenticate");
  if (!token) {
    return next(createHttpError(401, "User Not Authenticated"));
  }

  try {
    const parsedToken = token.split(" ")[1];
    const decode = verify(parsedToken, config.jwt_key as string);

    const _req = req as AuthRequest;
    _req.userID = decode.sub as string;
  } catch (e) {
    return next(createHttpError(401, "Token Expired"));
  }

  next();
};

export default authenticate;
