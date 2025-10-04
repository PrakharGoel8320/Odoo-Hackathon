import React, { useEffect, useState } from "react";
import API from "../api/axios";

const ExpenseHistory = () => {
  const [expenses, setExpenses] = useState([]);
  useEffect(()=>{ API.get("/expenses/my").then(res=>setExpenses(res.data)); },[]);
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl mb-4">My Expenses</h2>
      <table className="table-auto w-full border">
        <thead><tr><th>Amount</th><th>Currency</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {expenses.map(ex=>(<tr key={ex._id}>
            <td>{ex.amount}</td><td>{ex.currency}</td><td>{ex.date?.slice(0,10)}</td><td>{ex.status}</td>
          </tr>))}
        </tbody>
      </table>
    </div>
  );
};
export default ExpenseHistory;