import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './pages/Scanner';
import Feedback from './pages/Feedback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register/:movieId" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/scanner" element={<Scanner />} />
        <Route path="/feedback/:movieId/:registrationId" element={<Feedback />} />
      </Routes>
    </Router>
  );
}

export default App;
