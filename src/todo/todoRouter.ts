import express from "express";
import { getPriorities } from "./todoController";
import authenticate from "../middleware/authenticationHandler";

const todoRouter = express.Router();

todoRouter.get("/priorities", authenticate, getPriorities);

export { todoRouter };
