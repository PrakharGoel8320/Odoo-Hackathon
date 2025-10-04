import React, { useState } from "react";
import API from "../api/axios";

const SubmitExpense = () => {
  const [form, setForm] = useState({ amount:"", currency:"", category:"", description:"", date:"" });
  const [receipt, setReceipt] = useState(null);
  const [ocrText, setOcrText] = useState("");

  const handleUpload = async () => {
    if (!receipt) return alert("Choose a file first");
    const data = new FormData();
    data.append("receipt", receipt);
    try {
      const res = await API.post("/expenses/upload", data, { headers: {"Content-Type":"multipart/form-data"} });
      setOcrText(res.data?.ocrTextSnippet || "");
      setForm({...form, description: res.data?.ocrTextSnippet || ""});
    } catch (err) { alert("OCR failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/expenses/submit", form);
      alert("Expense submitted");
    } catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl mb-4">Submit Expense</h2>
      <input type="file" onChange={e=>setReceipt(e.target.files[0])}/>
      <button className="bg-blue-500 text-white px-2 py-1 rounded ml-2" onClick={handleUpload}>Upload & OCR</button>
      {ocrText && <pre className="bg-gray-100 p-2 mt-2">{ocrText}</pre>}
      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <input className="border p-2 w-full" placeholder="Amount" onChange={e=>setForm({...form,amount:e.target.value})}/>
        <input className="border p-2 w-full" placeholder="Currency" onChange={e=>setForm({...form,currency:e.target.value})}/>
        <input className="border p-2 w-full" placeholder="Category" onChange={e=>setForm({...form,category:e.target.value})}/>
        <input className="border p-2 w-full" placeholder="Date YYYY-MM-DD" onChange={e=>setForm({...form,date:e.target.value})}/>
        <textarea className="border p-2 w-full" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <button className="bg-green-500 text-white px-4 py-2 rounded" type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SubmitExpense;