"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "",
    unit: "",
    shelfLifeDays: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError("Failed to fetch products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      if (editingId) {
        await axios.put(
          `/api/products/${editingId}`,
          {
            name: form.name,
            type: form.type,
            unit: form.unit,
            shelfLifeDays: parseInt(form.shelfLifeDays),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Product updated successfully.");
      } else {
        await axios.post(
          "/api/products",
          {
            name: form.name,
            type: form.type,
            unit: form.unit,
            shelfLifeDays: parseInt(form.shelfLifeDays),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Product created successfully.");
      }
      setForm({ name: "", type: "", unit: "", shelfLifeDays: "" });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError("Failed to save product.");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      type: product.type,
      unit: product.unit,
      shelfLifeDays: product.shelfLifeDays.toString(),
    });
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Product deleted successfully.");
      fetchProducts();
    } catch (err) {
      setError("Failed to delete product.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black font-sans">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-md">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Type</label>
          <input
            type="text"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Unit</label>
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Shelf Life (Days)</label>
          <input
            type="number"
            name="shelfLifeDays"
            value={form.shelfLifeDays}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
            min="1"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          {editingId ? "Update Product" : "Add Product"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setForm({ name: "", type: "", unit: "", shelfLifeDays: "" });
              setEditingId(null);
              setError("");
              setSuccess("");
            }}
            className="ml-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        )}
      </form>

      <h2 className="text-2xl font-semibold mb-4">Product List</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Type</th>
              <th className="border border-gray-300 px-4 py-2">Unit</th>
              <th className="border border-gray-300 px-4 py-2">Shelf Life (Days)</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                <td className="border border-gray-300 px-4 py-2">{product.type}</td>
                <td className="border border-gray-300 px-4 py-2">{product.unit}</td>
                <td className="border border-gray-300 px-4 py-2">{product.shelfLifeDays}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="mr-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
