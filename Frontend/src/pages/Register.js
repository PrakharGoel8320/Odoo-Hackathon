import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Register = () => {
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"Employee", companyId:"", companyName:"", country:"" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/register", form);
      alert("Registered successfully. Please login.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="border p-2 w-full" type="email" placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
        <input className="border p-2 w-full" type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/>
        <select className="border p-2 w-full" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option>Employee</option><option>Manager</option><option>Admin</option>
        </select>
        {form.role === "Admin" ? (
          <>
            <input className="border p-2 w-full" placeholder="Company Name" onChange={e=>setForm({...form,companyName:e.target.value})}/>
            <input className="border p-2 w-full" placeholder="Country" onChange={e=>setForm({...form,country:e.target.value})}/>
          </>
        ):(
          <input className="border p-2 w-full" placeholder="Company ID" onChange={e=>setForm({...form,companyId:e.target.value})}/>
        )}
        <button className="bg-green-500 text-white px-4 py-2 rounded" type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;