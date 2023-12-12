import { Request, Response, Router } from "express";
import {
  deleteExpense,
  getExpense,
  getExpenses,
  patchExpense,
  postExpense,
} from "../services/expenses";

const expenseRouter = Router();

expenseRouter.get("", getExpenses);
expenseRouter.post("", postExpense);
expenseRouter.get("/:id", getExpense);
expenseRouter.patch("/:id", patchExpense);
expenseRouter.delete("/:id", deleteExpense);

export default expenseRouter;
