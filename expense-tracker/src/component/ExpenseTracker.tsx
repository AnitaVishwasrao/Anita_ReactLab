import React, { Component } from "react";
import { Col, Container, Row } from "react-bootstrap";
import IExpense from "../models/IExpense";
import IExpenseSummary from "../models/IExpenseSummary";
import IPayeeExpense from "../models/IPayeeExpense";
import { getExpenses } from "../service/Expense";
import { Link } from "react-router-dom";
import "./ExpenseTracker.css";

type Props = {};

type State = {
  expenses: IExpense[];
  expenseSummary: IExpenseSummary;
  error: Error | null;
  showExpenses: boolean;
};

const columns = ["Date", "Product Purchased", "Price", "Payee"];

class ExpenseTracker extends Component<Props, State> {
  state: State = {
    expenses: [],
    expenseSummary: {
      totalExpense: 0,
      expenseMadeByPayee: [],
      remainingAmountToBePaid: {
        payee: "",
        expense: 0,
      },
    },
    error: null,
    showExpenses: false,
  };

  getFixedNumber = (iNumber: number) => {
    return parseFloat(iNumber.toFixed(2));
  };

  getTotalExpense = (expenses: IExpense[]) => {
    let totalExpense = 0;
    totalExpense = expenses?.reduce((total, obj) => obj.price + total, 0);
    return this.getFixedNumber(totalExpense);
  };

  getExpenseMadeByPayee = (expenses: IExpense[]) => {
    const payees = expenses?.map((expense) => expense.payee);
    const uniquePayees = payees?.filter(function (item, index, arr) {
      return arr.indexOf(item) === index;
    });

    const expensesMadeByPayee: IPayeeExpense[] = [];

    uniquePayees?.forEach((payee) => {
      let expense = expenses
        ?.filter((expense) => expense.payee === payee)
        .reduce((total, obj) => obj.price + total, 0);
      expense = this.getFixedNumber(expense);
      expensesMadeByPayee.push({ payee: payee, expense: expense as number });
    });

    return expensesMadeByPayee;
  };

  getRemainingAmountTobePaid = (
    totalExpense: number,
    expensesMadeByPayee: IPayeeExpense[]
  ) => {
    const remainingPayment: IPayeeExpense = {
      payee: "",
      expense: 0,
    };

    //get the total contributions to be made by each payee
    //(here expensesMadeByPayee.length is considered instead number of payees configured in UI
    //i.e it is assumed that the contribution is started only when a payment is made)
    const contributionPerPayee = this.getFixedNumber(
      totalExpense / expensesMadeByPayee.length
    );

    //get all the payees whose contribution is less than the contribution
    const payeesWithMinContribution = expensesMadeByPayee.filter(
      (expense: any) => expense.expense < contributionPerPayee
    );

    //get the payee who has paid highest amount
    const payeeWithMaxContribution = expensesMadeByPayee.filter(
      (expense: any) => expense.expense > contributionPerPayee
    );

    //set remaining amount to be received by maximum payer and maximum payer's name
    if (payeesWithMinContribution.length > 0) {
      const remainingAmount =
        payeeWithMaxContribution[0].expense -
        payeesWithMinContribution.reduce(
          (total: any, obj: any) => obj.expense + total,
          0
        );
      if (remainingAmount > 0) {
        remainingPayment.payee = payeeWithMaxContribution[0].payee;
        remainingPayment.expense = this.getFixedNumber(remainingAmount);
      }
    }
    return remainingPayment;
  };

  getTableCellStyles = (index: number) => {
    switch (index) {
      case 0:
        return "#EEA74B";
      case 1:
        return "#00FFFF";
      case 2:
        return "#A367DB";
      case 3:
        return "#2CEBDB";
    }
  };

  getBackgroundColor = (index: number) => {
    return index % 2 === 0 ? "#2CEBDB" : "#5F9EA0";
  };

  async componentDidMount() {
    try {
      const data = await getExpenses();
      if (data.length > 0) {
        const totalExpense = this.getTotalExpense(data);
        const expenseMadeByPayee = this.getExpenseMadeByPayee(data);
        const remainingAmountTobePaid = this.getRemainingAmountTobePaid(
          totalExpense,
          expenseMadeByPayee
        );

        this.setState({
          expenses: data,
          expenseSummary: {
            totalExpense: totalExpense,
            expenseMadeByPayee: expenseMadeByPayee,
            remainingAmountToBePaid: remainingAmountTobePaid,
          },
          error: null,
          showExpenses: data.length > 0,
        });
      }
    } catch (error: any) {
      this.setState(error);
      alert(error);
    }
  }

  componentWillUnmount() {
    this.setState({
      expenses: [],
      expenseSummary: {
        totalExpense: 0,
        expenseMadeByPayee: [],
        remainingAmountToBePaid: {
          payee: "",
          expense: 0,
        },
      },
      error: null,
      showExpenses: false,
    });
  }

  render() {
    const { expenses, expenseSummary, error, showExpenses } = this.state;

    return (
      <>
        <header className="text-center bg-secondary ">
          <h1 className="mb-2">Expense Tracker</h1>
        </header>

        <Container>
          <div id="expenses-wrapper">
            <Row>
              {showExpenses && (
                <Col xs={10} md={11}>
                  <div className="table-responsive ">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          {columns.map((column) => (
                            <th key={column} className="text-white bg-dark">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense, index) => (
                          <tr key={expense.id}>
                            <td
                              style={{
                                backgroundColor: this.getTableCellStyles(0),
                              }}
                            >
                              {expense.date.toString()}
                            </td>
                            <td
                              style={{
                                backgroundColor: this.getTableCellStyles(1),
                              }}
                            >
                              {expense.product}
                            </td>
                            <td
                              style={{
                                backgroundColor: this.getTableCellStyles(2),
                              }}
                            >
                              {expense.price}
                            </td>
                            <td
                              style={{
                                backgroundColor: this.getTableCellStyles(3),
                              }}
                            >
                              {expense.payee}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Col>
              )}
              <Col xs={2} md={1}>
                <Link to="/add" className="btn btn-primary btn-sm">
                  Add
                </Link>
              </Col>
            </Row>
          </div>
          <hr />
          {showExpenses && (
            <div id="expenses-summary-wrapper">
              <Row>
                <Col xs={6}>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <td
                            style={{
                              backgroundColor: "#00FFFF",
                              color: "black",
                            }}
                          >
                            Total:
                          </td>
                          <td style={{ backgroundColor: "#0AFDAC" }}>
                            {expenseSummary?.totalExpense}
                          </td>
                        </tr>
                        {expenseSummary.expenseMadeByPayee.map(
                          (element: any, index: number) => (
                            <tr key={element.payee}>
                              <td
                                style={{
                                  backgroundColor: "#00FFFF",
                                  color: "black",
                                }}
                              >{`${element.payee} Paid:`}</td>
                              <td
                                style={{
                                  backgroundColor:
                                    this.getBackgroundColor(index),
                                  color: "black",
                                }}
                              >
                                {element.expense}
                              </td>
                            </tr>
                          )
                        )}
                        {
                          <tr style={{ backgroundColor: "#FF5E5E" }}>
                            <td>{`Pay ${expenseSummary.remainingAmountToBePaid?.payee}`}</td>
                            <td>
                              {expenseSummary?.remainingAmountToBePaid.expense}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Container>
      </>
    );
  }
}

export default ExpenseTracker;
