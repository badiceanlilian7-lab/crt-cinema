import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Admin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved admin credentials from localStorage
    const savedUsername = localStorage.getItem('adminUsername');
    if (savedUsername) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/admin/login', formData);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
      localStorage.setItem('adminUsername', formData.username);
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Credențiale invalide');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>🔐 Admin Login</h1>
        <p>CRT Cinema Donduseni</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Utilizator</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Nume utilizator"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parolă</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Parolă"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Se autentifică...' : 'Autentificare'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;
