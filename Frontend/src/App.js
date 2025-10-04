import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SubmitExpense from "./pages/SubmitExpense";
import ExpenseHistory from "./pages/ExpenseHistory";
import Approvals from "./pages/Approvals";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

const App = () => (
  <BrowserRouter>
    <Navbar />
    <div className="p-6">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/submit" element={<PrivateRoute><SubmitExpense /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><ExpenseHistory /></PrivateRoute>} />
        <Route path="/approvals" element={<PrivateRoute><Approvals /></PrivateRoute>} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;