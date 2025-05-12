"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Transfer() {
  const [transfers, setTransfers] = useState([]);
  const [toBranchId, setToBranchId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTransfers = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/transfer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfers(response.data);
    } catch (err) {
      setError("Failed to fetch transfers.");
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const items = [
        {
          productId: parseInt(productId),
          quantity: parseInt(quantity),
          expiryDate,
        },
      ];
      await axios.post(
        "/api/transfer",
        { toBranchId, items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Stock transfer created successfully.");
      setToBranchId("");
      setProductId("");
      setQuantity("");
      setExpiryDate("");
      fetchTransfers();
    } catch (err) {
      setError("Failed to create stock transfer.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black font-sans">
      <h1 className="text-3xl font-bold mb-6">Stock Transfers</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-md">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <div className="mb-4">
          <label className="block mb-1 font-medium">To Branch ID</label>
          <input
            type="text"
            value={toBranchId}
            onChange={(e) => setToBranchId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

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

        <div className="mb-4">
          <label className="block mb-1 font-medium">Expiry Date</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Create Transfer
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Existing Transfers</h2>
      {transfers.length === 0 ? (
        <p>No transfers found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">From Branch</th>
              <th className="border border-gray-300 px-4 py-2">To Branch</th>
              <th className="border border-gray-300 px-4 py-2">Product ID</th>
              <th className="border border-gray-300 px-4 py-2">Quantity</th>
              <th className="border border-gray-300 px-4 py-2">Expiry Date</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id}>
                <td className="border border-gray-300 px-4 py-2">{transfer.id}</td>
                <td className="border border-gray-300 px-4 py-2">{transfer.fromBranchId}</td>
                <td className="border border-gray-300 px-4 py-2">{transfer.toBranchId}</td>
                <td className="border border-gray-300 px-4 py-2">{transfer.productId}</td>
                <td className="border border-gray-300 px-4 py-2">{transfer.quantity}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(transfer.expiryDate).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2">{transfer.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
