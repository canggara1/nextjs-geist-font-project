import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black font-sans">
      <h1 className="text-4xl font-bold mb-4">Inventory & POS System</h1>
      <p className="text-lg mb-8">Welcome to the Inventory and Point of Sale system frontend.</p>
      <div className="space-x-4">
        <button className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition">
          Login
        </button>
        <button className="px-6 py-3 border border-black rounded hover:bg-gray-100 transition">
          Register
        </button>
      </div>
    </div>
  );
}
