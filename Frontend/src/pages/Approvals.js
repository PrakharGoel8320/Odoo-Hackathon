import React, { useEffect, useState } from "react";
import API from "../api/axios";

const Approvals = () => {
  const [pending, setPending] = useState([]);
  useEffect(()=>{ API.get("/expenses/pending").then(res=>setPending(res.data)); },[]);

  const act = async(id,decision)=>{
    await API.post(`/expenses/${id}/approve`,{decision});
    setPending(p=>p.filter(x=>x._id!==id));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl mb-4">Pending Approvals</h2>
      {pending.map(exp=>(
        <div key={exp._id} className="border p-3 mb-2">
          <div>Amount: {exp.amount} {exp.currency}</div>
          <div>Description: {exp.description}</div>
          <button onClick={()=>act(exp._id,"Approved")} className="bg-green-500 text-white px-2 py-1 mr-2">Approve</button>
          <button onClick={()=>act(exp._id,"Rejected")} className="bg-red-500 text-white px-2 py-1">Reject</button>
        </div>
      ))}
    </div>
  );
};
export default Approvals;