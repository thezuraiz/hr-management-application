import express from "express";
import { getAllTodos, getPriorities, submitTodo } from "./todoController";
import authenticate from "../middleware/authenticationHandler";
import multer from "multer";

const todoRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

todoRouter.get("/priorities", authenticate, getPriorities);
todoRouter.get("/", getAllTodos);
todoRouter.post(
  "/submit",
  authenticate,
  upload.fields([
    { name: "todo", maxCount: 1 },
    { name: "todoName", maxCount: 1 },
    { name: "todoDescription", maxCount: 1 },
  ]),
  submitTodo
);

export { todoRouter };
