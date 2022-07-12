import "./App.css";
import ExpenseTracker from "./component/ExpenseTracker";
import AddExpense from "./component/AddExpense";

import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/add" element={<AddExpense />}></Route>
          <Route path="/" element={<ExpenseTracker />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
