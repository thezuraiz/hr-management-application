import { registerUser } from "./userController";
import express from "express";

const userRouter = express.Router();

userRouter.post("/login", () => {});

userRouter.post("/register", registerUser);

export { userRouter };
