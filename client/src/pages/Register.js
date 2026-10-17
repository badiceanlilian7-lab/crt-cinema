import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchMovie = async () => {
    try {
      const response = await axios.get(`/api/movies/${movieId}`);
      setMovie(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movie:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie();
    
    // Load saved user data from localStorage
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    const savedAge = localStorage.getItem('userAge');
    
    if (savedName || savedEmail || savedAge) {
      setFormData({
        name: savedName || '',
        email: savedEmail || '',
        age: savedAge || ''
      });
    }
  }, [movieId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post('/api/register', {
        movie_id: movieId,
        ...formData
      });

      if (response.data.id) {
        // Save user data to localStorage for future use
        localStorage.setItem('userName', formData.name);
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userAge', formData.age);
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 5000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Eroare la înregistrare');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="error-container">
        <p>Filmul nu a fost găsit.</p>
        <Link to="/">Înapoi la pagina principală</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="success-container">
        <div className="success-message">
          <h1>✅ Înregistrare reușită!</h1>
          <p>Ți-ai rezervat biletul pentru "{movie.title}"</p>
          <p>Codul QR a fost trimis pe email-ul tău.</p>
          <p>Vei fi redirecționat către pagina principală în 5 secunde...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Rezervă Bilet</h1>
        <h2>{movie.title}</h2>
        
        <div className="movie-summary">
          <p>📅 {new Date(movie.show_date).toLocaleDateString('ro-RO')}</p>
          <p>⏰ {movie.show_time}</p>
          <p>📍 {movie.location || 'CRT Cinema Donduseni'}</p>
          <p>🎂 Vârstă necesară: {movie.min_age} - {movie.max_age} ani</p>
          <p>👥 Locuri disponibile: {movie.available_seats}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nume complet *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Introduceți numele complet"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="exemplu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Vârstă *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="0"
              max="120"
              placeholder="Vârsta ta"
            />
          </div>

          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? 'Se procesează...' : 'Rezervă Bilet'}
          </button>
        </form>

        <Link to="/" className="back-link">Înapoi la filme</Link>
      </div>
    </div>
  );
}

export default Register;
