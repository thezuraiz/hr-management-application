import { registerUser, loginUser } from "./userController";
import express from "express";

const userRouter = express.Router();

userRouter.post("/login", loginUser);

userRouter.post("/register", registerUser);

export { userRouter };
