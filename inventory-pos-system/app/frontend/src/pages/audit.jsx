"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Audit() {
  const [audits, setAudits] = useState([]);
  const [error, setError] = useState("");

  const fetchAudits = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/audit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAudits(response.data);
    } catch (err) {
      setError("Failed to fetch audit trails.");
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-white text-black font-sans">
      <h1 className="text-3xl font-bold mb-6">Audit Trails</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {audits.length === 0 ? (
        <p>No audit trails found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Action</th>
              <th className="border border-gray-300 px-4 py-2">User</th>
              <th className="border border-gray-300 px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td className="border border-gray-300 px-4 py-2">{audit.id}</td>
                <td className="border border-gray-300 px-4 py-2">{audit.action}</td>
                <td className="border border-gray-300 px-4 py-2">{audit.userId}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(audit.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
