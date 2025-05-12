"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState("");
  const [branchId, setBranchId] = useState("");
  const [productType, setProductType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const fetchInventory = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const params = {};
      if (branchId) params.branchId = branchId;
      if (productType) params.productType = productType;
      if (expiryDate) params.expiryDate = expiryDate;

      const response = await axios.get("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setInventory(response.data);
    } catch (err) {
      setError("Failed to fetch inventory.");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-white text-black font-sans">
      <h1 className="text-3xl font-bold mb-6">Inventory</h1>

      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Branch ID"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Product Type"
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="date"
          placeholder="Expiry Date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={fetchInventory}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Filter
        </button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Product Name</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">Quantity</th>
            <th className="border border-gray-300 px-4 py-2">Price</th>
            <th className="border border-gray-300 px-4 py-2">Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No inventory found.
              </td>
            </tr>
          ) : (
            inventory.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2">{item.product.name}</td>
                <td className="border border-gray-300 px-4 py-2">{item.product.category.name}</td>
                <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2">{item.product.price}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(item.expiryDate).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
