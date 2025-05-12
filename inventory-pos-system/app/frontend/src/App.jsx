import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900">Inventory & POS System</h1>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Additional routes will be added here */}
      </Routes>
    </Router>
  );
}
