import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import AddExpense from "./pages/addExpense";
import SplitBills from "./pages/splitBills";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/responsive.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/split-bills" element={<SplitBills />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
