import { Request, Response } from "express";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { HttpStatus } from "../../common/enum";
import { SUCCESS } from "../../common/constant";
import moment from "moment";

export interface ExpenseEntity {
  id: number;
  name: string;
  nominal: number;
  category: string;
  date: Date;
}

export interface ExpenseInput {
  name: string;
  nominal: number;
  category: string;
}

const getCurrentId = (expenses: ExpenseEntity[]): number => {
  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
    return 1;
  }

  const lastId = expenses[expenses.length - 1].id;

  return lastId + 1;
};

const getFilePath = (): string => {
  return path.join(__dirname, "../../../data/expenses.json");
};

const readFileFromJson = (): ExpenseEntity[] => {
  const jsonPath = getFilePath();
  const expenses = readFileSync(jsonPath, "utf-8");

  return JSON.parse(expenses);
};

const writeFileIntoJson = (data: ExpenseEntity[]): ExpenseEntity[] => {
  const jsonPath = getFilePath();
  writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");

  return data;
};

export const getExpenses = (req: Request, res: Response) => {
  const { category, startdate, enddate } = req.query;

  let expenses = readFileFromJson();

  if (category) {
    expenses = expenses.filter(
      (expense) =>
        expense.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (startdate && enddate) {
    const startDateMoment = moment(String(startdate));
    const endDateMoment = moment(String(enddate));

    if (startDateMoment.isAfter(endDateMoment)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: "startdate is newer than enddate",
      });
    }
    expenses = expenses.filter(
      (expense) =>
        moment(expense.date).isSameOrBefore(endDateMoment) &&
        moment(expense.date).isSameOrAfter(startDateMoment)
    );
  }

  return res.status(HttpStatus.OK).json({
    code: HttpStatus.OK,
    message: SUCCESS,
    data: expenses,
  });
};

export const postExpense = (req: Request, res: Response) => {
  const { name, nominal, category } = req.body;

  if (!name || !nominal || !category) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      code: HttpStatus.BAD_REQUEST,
      message: "Name, nominal, and category cannot be empty",
    });
  }

  const inputPayload: ExpenseInput = {
    name,
    nominal,
    category,
  };

  const expenses = readFileFromJson();

  const currentId = getCurrentId(expenses);
  const currentDate = moment().toDate();

  const expense = {
    id: currentId,
    date: currentDate,
    ...inputPayload,
  };

  expenses.push(expense);
  writeFileIntoJson(expenses);

  return res.status(HttpStatus.CREATED).json({
    code: HttpStatus.CREATED,
    message: SUCCESS,
    data: expenses,
  });
};

export const getExpense = (req: Request, res: Response) => {
  const { id } = req.params;

  if (isNaN(parseInt(id))) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      code: HttpStatus.BAD_REQUEST,
      message: "Id must be integer",
    });
  }

  const expenses = readFileFromJson();
  const expense = expenses.find((item) => item.id === parseInt(id));

  if (!expense) {
    return res.status(HttpStatus.NOT_FOUND).json({
      code: HttpStatus.NOT_FOUND,
      message: `Expense with id ${id} not found`,
    });
  }

  return res.status(HttpStatus.OK).json({
    code: HttpStatus.OK,
    message: SUCCESS,
    data: expense,
  });
};

export const patchExpense = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, nominal, category } = req.body;

  if (isNaN(parseInt(id))) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      code: HttpStatus.BAD_REQUEST,
      message: "Id must be integer",
    });
  }

  const expenses = readFileFromJson();
  const expense = expenses.find((item) => item.id === parseInt(id));

  if (!expense) {
    return res.status(HttpStatus.NOT_FOUND).json({
      code: HttpStatus.NOT_FOUND,
      message: `Expense with id ${id} not found`,
    });
  }

  const indexOfCurrentExpense = expenses
    .map((expense) => expense.id)
    .indexOf(parseInt(id));

  const newExpense = {
    id: expense.id,
    name: name || expense.name,
    nominal: nominal || expense.nominal,
    category: category || expense.category,
    date: expense.date,
  };

  expenses.splice(indexOfCurrentExpense, 1, newExpense);

  writeFileIntoJson(expenses);

  return res.status(HttpStatus.OK).json({
    code: HttpStatus.OK,
    message: SUCCESS,
    data: expenses,
  });
};

export const deleteExpense = (req: Request, res: Response) => {
  const { id } = req.params;

  if (isNaN(parseInt(id))) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      code: HttpStatus.BAD_REQUEST,
      message: "Id must be integer",
    });
  }

  const expenses = readFileFromJson();
  const expense = expenses.find((item) => item.id === parseInt(id));

  if (!expense) {
    return res.status(HttpStatus.NOT_FOUND).json({
      code: HttpStatus.NOT_FOUND,
      message: `Expense with id ${id} not found`,
    });
  }

  const indexOfCurrentExpense = expenses
    .map((expense) => expense.id)
    .indexOf(parseInt(id));

  expenses.splice(indexOfCurrentExpense, 1);

  writeFileIntoJson(expenses);

  return res.status(HttpStatus.OK).json({
    code: HttpStatus.OK,
    message: SUCCESS,
    data: expenses,
  });
};
