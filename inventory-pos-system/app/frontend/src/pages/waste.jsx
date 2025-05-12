"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Waste() {
  const [wasteLogs, setWasteLogs] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchWasteLogs = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/waste", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWasteLogs(response.data);
    } catch (err) {
      setError("Failed to fetch waste logs.");
    }
  };

  useEffect(() => {
    fetchWasteLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/waste",
        { productId: parseInt(productId), quantity: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Waste stock added successfully.");
      setProductId("");
      setQuantity("");
      fetchWasteLogs();
    } catch (err) {
      setError("Failed to add waste stock.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black font-sans">
      <h1 className="text-3xl font-bold mb-6">Waste Management</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-md">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Product ID</label>
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Add Waste
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Waste Logs</h2>
      {wasteLogs.length === 0 ? (
        <p>No waste logs found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Product ID</th>
              <th className="border border-gray-300 px-4 py-2">Quantity</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {wasteLogs.map((log) => (
              <tr key={log.id}>
                <td className="border border-gray-300 px-4 py-2">{log.id}</td>
                <td className="border border-gray-300 px-4 py-2">{log.productId}</td>
                <td className="border border-gray-300 px-4 py-2">{log.quantity}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
