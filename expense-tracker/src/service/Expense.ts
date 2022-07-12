import axios from "axios";
import IExpense from "../models/IExpense";

const getExpenses = () => {
  console.log(process.env.REACT_APP_API_BASE_URL);
  return axios
    .get<IExpense[]>(`${process.env.REACT_APP_API_BASE_URL}/expenses`)
    .then((response) => response.data);
};

const addExpense = (expense: Omit<IExpense, "id">) => {
  return axios
    .post<IExpense[]>(
      `${process.env.REACT_APP_API_BASE_URL}/expenses`,
      expense,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => response.data);
};

export { getExpenses, addExpense };
