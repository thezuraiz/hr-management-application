import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "Hello Zuraiz! App Running",
  });
});



export default app;
