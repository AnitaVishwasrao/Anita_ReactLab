import IPayeeExpense from "./IPayeeExpense";

export default interface IExpenseSummary {
  totalExpense: number;
  expenseMadeByPayee: IPayeeExpense[];
  remainingAmountToBePaid: IPayeeExpense;
}
