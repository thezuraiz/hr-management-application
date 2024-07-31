import express from "express";
import {
  deleteTodo,
  getAllTodos,
  getPriorities,
  getTodo,
  submitTodo,
} from "./todoController";
import authenticate from "../middleware/authenticationHandler";
import multer from "multer";

const todoRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
todoRouter.get("/priorities", authenticate, getPriorities);
todoRouter.get("/", authenticate, getAllTodos);
todoRouter.get("/:id", authenticate, getTodo);
todoRouter.post("/delete/:id", authenticate, deleteTodo);

export { todoRouter };
