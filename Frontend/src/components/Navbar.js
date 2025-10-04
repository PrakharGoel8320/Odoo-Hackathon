import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div>
        {user && <Link to="/dashboard" className="mr-4">Dashboard</Link>}
        {user && <Link to="/submit" className="mr-4">Submit Expense</Link>}
        {user && <Link to="/history" className="mr-4">My Expenses</Link>}
        {user && (user.role === "Manager" || user.role === "Admin") && (
          <Link to="/approvals" className="mr-4">Approvals</Link>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span className="mr-4">Hi, {user.name} ({user.role})</span>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/" className="mr-4">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;