import express from "express";
import globalErrorHander from "./middleware/globalErrorHandler";
import { userRouter } from "./user/userRouter";

const app = express();

// To decode and read json data
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hello Zuraiz! App Running",
  });
});

app.use("/api/users", userRouter);

app.use(globalErrorHander);

export default app;
