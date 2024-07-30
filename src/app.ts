import express from "express";
import globalErrorHander from "./middleware/globalErrorHandler";
import { userRouter } from "./user/userRouter";
import { documentRouter } from "./document/documentRouter";
import { todoRouter } from "./todo/todoRouter";

const app = express();

// To decode and read json data
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hello Zuraiz! App Running",
  });
});

app.use("/api/users", userRouter);

app.use("/api/document", documentRouter);
app.use("/api/todo",todoRouter)

app.use(globalErrorHander);

export default app;
