import React, { Component } from "react";
import {
  Col,
  Row,
  Form,
  FormGroup,
  Button,
  ToastContainer,
  Toast,
  Container,
} from "react-bootstrap";
import { addExpense } from "../service/Expense";
import { Link } from "react-router-dom";
import "./AddExpense.css";
import { PAYEE } from "../common/Constants";

type Props = {};

type State = {
  values: {
    date: string;
    product: string;
    price: number;
    payee: string;
  };
  errors: {
    date: string[];
    product: string[];
    price: string[];
    payee: string[];
  };
  isValid: boolean;
  responseState: "initial" | "success" | "error";
  toastMessage: string;
  show: boolean;
};

class AddExpense extends Component<Props, State> {
  state: State = {
    values: {
      date: "",
      product: "",
      price: 0,
      payee: "",
    },
    errors: {
      date: [],
      product: [],
      price: [],
      payee: [],
    },
    isValid: false,
    responseState: "initial",
    toastMessage: "",
    show: false,
  };

  validate(nameOfInput?: keyof State["values"]) {
    const errors: State["errors"] = {
      date: [],
      price: [],
      product: [],
      payee: [],
    };
    let isValid = true;

    const { date, product, price, payee } = this.state.values;

    if (date.trim() === "") {
      errors.date.push("date cannot be empty");
      isValid = false;
    }

    if (product.trim() === "") {
      errors.product.push("Product cannot be empty");
      isValid = false;
    }

    if (price.toString().trim() === "") {
      errors.price.push("Price cannot be empty");
      isValid = false;
    }

    if (payee.toString().trim() === "") {
      errors.payee.push("Payee cannot be empty");
      isValid = false;
    }

    const pricePattern = /^\d+(\.\d{1,2})?$/;
    if (!pricePattern.test(price.toString())) {
      errors.price.push("Price needs to be a valid currency value");
      isValid = false;
    }

    if (nameOfInput) {
      this.setState((state) => {
        return {
          errors: {
            ...state.errors,
            [nameOfInput]: errors[nameOfInput],
          },
          isValid,
        };
      });

      return errors[nameOfInput].length === 0;
    } else {
      this.setState({
        errors,
        isValid,
      });
      return isValid;
    }
  }

  updateValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    this.setState(
      (state) => {
        return {
          values: {
            ...state.values,
            [name]: name === "price" ? parseFloat(value) : value,
          },
        };
      },
      () => {
        this.validate(name as keyof State["values"]);
      }
    );
  };

  updateSelectValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    this.setState(
      (state) => {
        return {
          values: {
            ...state.values,
            [name]: value,
          },
        };
      },
      () => {
        this.validate(name as keyof State["values"]);
      }
    );
  };

  addExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!this.validate) {
      return;
    }

    try {
      this.setState({
        responseState: "initial",
      });

      const expense = {
        ...this.state.values,
      };
      const data = await addExpense(expense);
      this.setState({
        responseState: "success",
        toastMessage: `A menu item has been added successfully`,
        show: true,
      });
    } catch (err: any) {
      this.setState({
        responseState: "error",
        toastMessage: err.message,
        show: true,
      });
    }
  };

  render() {
    const { payee, price, product, date } = this.state.values;
    const {
      payee: payeeErrs,
      price: priceErrs,
      product: productErrs,
      date: dateErrs,
    } = this.state.errors;
    const isValid = this.state.isValid;
    const { responseState, toastMessage, show } = this.state;

    return (
      <>
        <Container className="mx-auto" id="form-wrapper">
          <Row>
            <Col
              xs={12}
              className="text-center  custom-bg-color my-2 header p-2"
            >
              <h3>Add Menu Item</h3>

              <div className="notes mt-2">
                <span className="text-danger">
                  Read the below instructions before proceeding:
                </span>
                <span>
                  Make sure you fill all the fields where * is provided
                </span>
              </div>
            </Col>

            <Col xs={12}>
              <Form onSubmit={this.addExpense}>
                <Form.Group
                  as={Row}
                  className="my-3 form-element"
                  controlId="payee"
                >
                  <Form.Label column sm={12}>
                    Payee <span className="text-danger">*</span>
                  </Form.Label>
                  <Col sm={4}>
                    <Form.Select
                      as="select"
                      name="payee"
                      value={payee}
                      onChange={this.updateSelectValue}
                      aria-describedby="payeeHelp"
                      isInvalid={payeeErrs.length !== 0}
                      className="mb-3"
                    >
                      {PAYEE?.map((payee, index) => (
                        <option value={payee.value} key={index}>
                          {payee.text}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                      {payeeErrs.map((err) => (
                        <div key={err}>{err}</div>
                      ))}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <Form.Group
                  as={Row}
                  className="my-3 form-element"
                  controlId="product"
                >
                  <Form.Label column sm={12}>
                    Product Purchased <span className="text-danger">*</span>
                  </Form.Label>
                  <Col sm={12}>
                    <Form.Control
                      type="text"
                      name="product"
                      value={product}
                      onChange={this.updateValue}
                      aria-describedby="productHelp"
                      isInvalid={productErrs.length !== 0}
                      className="mb-3"
                    />

                    <Form.Control.Feedback type="invalid">
                      {productErrs.map((err) => (
                        <div key={err}>{err}</div>
                      ))}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <Form.Group
                  as={Row}
                  className="my-3 form-element"
                  controlId="price"
                >
                  <Form.Label column sm={12}>
                    Price <span className="text-danger">*</span>
                  </Form.Label>
                  <Col sm={12}>
                    <Form.Control
                      type="number"
                      name="price"
                      value={price}
                      onChange={this.updateValue}
                      aria-describedby="priceHelp"
                      isInvalid={priceErrs.length !== 0}
                      className="mb-3"
                    />

                    <Form.Control.Feedback type="invalid">
                      {priceErrs.map((err) => (
                        <div key={err}>{err}</div>
                      ))}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <Form.Group
                  as={Row}
                  className="my-3 form-element"
                  controlId="date"
                >
                  <Form.Label column sm={12}>
                    Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Col sm={12}>
                    <Form.Control
                      type="date"
                      name="date"
                      value={date}
                      onChange={this.updateValue}
                      aria-describedby="dateHelp"
                      isInvalid={dateErrs.length !== 0}
                      className="mb-3"
                    />

                    <Form.Control.Feedback type="invalid">
                      {dateErrs.map((err) => (
                        <div key={err}>{err}</div>
                      ))}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <div id="action-btn-group">
                  <Row>
                    <Col md={12}>
                      <Button
                        type="submit"
                        className="btn btn-warning custom-bg-color"
                        disabled={!isValid}
                      >
                        Submit
                      </Button>
                      <Link
                        to="/"
                        className="btn btn-warning ms-3 custom-bg-color"
                      >
                        Close
                      </Link>
                    </Col>
                  </Row>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
        {responseState !== "initial" && (
          <ToastContainer className="p-3" position="top-end">
            <Toast
              bg={responseState === "success" ? "success" : "danger"}
              show={show}
              autohide
              delay={5000}
              onClose={() => this.setState({ show: false })}
            >
              <Toast.Header closeButton={false}>
                {responseState === "success" ? "Success" : "Error"}
              </Toast.Header>
              <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
          </ToastContainer>
        )}
      </>
    );
  }
}

export default AddExpense;
