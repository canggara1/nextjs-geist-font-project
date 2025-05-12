"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    permissions: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchRoles = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (err) {
      setError("Failed to fetch roles.");
    }
  };

  useEffect(() => {
    fetchRoles();
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
      const permissionsArray = form.permissions.split(",").map((p) => p.trim());
      if (editingId) {
        await axios.put(
          `/api/roles/${editingId}/permissions`,
          { permissions: permissionsArray },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Role permissions updated successfully.");
      } else {
        await axios.post(
          "/api/roles",
          { name: form.name, permissions: permissionsArray },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Role created successfully.");
      }
      setForm({ name: "", permissions: "" });
      setEditingId(null);
      fetchRoles();
    } catch (err) {
      setError("Failed to save role.");
    }
  };

  const handleEdit = (role) => {
    setForm({
      name: role.name,
      permissions: role.permissions.join(", "),
    });
    setEditingId(role.id);
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black font-sans">
      <h1 className="text-3xl font-bold mb-6">Role Management</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-md">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        {!editingId && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">Role Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Permissions (comma separated)</label>
          <input
            type="text"
            name="permissions"
            value={form.permissions}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          {editingId ? "Update Permissions" : "Create Role"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setForm({ name: "", permissions: "" });
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

      <h2 className="text-2xl font-semibold mb-4">Roles List</h2>
      {roles.length === 0 ? (
        <p>No roles found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Role Name</th>
              <th className="border border-gray-300 px-4 py-2">Permissions</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="border border-gray-300 px-4 py-2">{role.name}</td>
                <td className="border border-gray-300 px-4 py-2">{role.permissions.join(", ")}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="mr-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    Edit
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
