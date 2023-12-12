import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import expenseRouter from "./router/expenseRouter";

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use("/expenses", expenseRouter);

app.listen(port, () => {
  console.log("Server is running on port", port);
});
