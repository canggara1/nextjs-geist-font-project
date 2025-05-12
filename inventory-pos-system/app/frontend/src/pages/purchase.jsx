"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Purchase() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: "", expiryDate: "" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPurchaseOrders = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/purchase", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchaseOrders(response.data);
    } catch (err) {
      setError("Failed to fetch purchase orders.");
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: "", expiryDate: "" }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const formattedItems = items.map((item) => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        expiryDate: item.expiryDate,
      }));
      await axios.post(
        "/api/purchase",
        { supplier, items: formattedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Purchase order created successfully.");
      setSupplier("");
      setItems([{ productId: "", quantity: "", expiryDate: "" }]);
      fetchPurchaseOrders();
    } catch (err) {
      setError("Failed to create purchase order.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black font-sans">
      <h1 className="text-3xl font-bold mb-6">Purchase Orders</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-lg">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Supplier</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        {items.map((item, index) => (
          <div key={index} className="mb-4 border border-gray-300 rounded p-4">
            <div className="mb-2">
              <label className="block mb-1 font-medium">Product ID</label>
              <input
                type="number"
                value={item.productId}
                onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Expiry Date</label>
              <input
                type="date"
                value={item.expiryDate}
                onChange={(e) => handleItemChange(index, "expiryDate", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Remove Item
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Add Item
        </button>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Create Purchase Order
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Purchase Orders List</h2>
      {purchaseOrders.length === 0 ? (
        <p>No purchase orders found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Supplier</th>
              <th className="border border-gray-300 px-4 py-2">Items</th>
              <th className="border border-gray-300 px-4 py-2">Created By</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((order) => (
              <tr key={order.id}>
                <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                <td className="border border-gray-300 px-4 py-2">{order.supplier}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {JSON.stringify(order.items)}
                </td>
                <td className="border border-gray-300 px-4 py-2">{order.createdBy}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
