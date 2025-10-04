import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl mb-4">Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <pre className="bg-gray-100 p-3">{JSON.stringify(user,null,2)}</pre>
    </div>
  );
};
export default Dashboard;