import express, { NextFunction, Request, Response } from "express";
import authenticate from "../middleware/authenticationHandler";

const documentRouter = express.Router();

documentRouter.post(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ msg: "/document" });
  }
);

export { documentRouter };
