import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Feedback() {
  const { movieId, registrationId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [formData, setFormData] = useState({
    movie_rating: 5,
    organization_rating: 5,
    comment: ''
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
  }, [movieId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: parseInt(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await axios.post('/api/feedback', {
        movie_id: movieId,
        registration_id: registrationId,
        ...formData
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Eroare la trimiterea feedback-ului');
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
        <button onClick={() => navigate('/')}>Înapoi la pagina principală</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="success-container">
        <div className="success-message">
          <h1>✅ Mulțumim pentru feedback!</h1>
          <p>Opinia ta este foarte importantă pentru noi.</p>
          <p>Vei fi redirecționat către pagina principală...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h1>📝 Feedback</h1>
        <h2>{movie.title}</h2>
        <p>Te rugăm să evaluezi experiența ta la cinema.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="rating-section">
            <h3>Cum ți s-a părut filmul?</h3>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${formData.movie_rating >= star ? 'active' : ''}`}
                  onClick={() => handleRatingChange('movie_rating', star)}
                >
                  ⭐
                </button>
              ))}
              <span className="rating-value">{formData.movie_rating}/5</span>
            </div>
          </div>

          <div className="rating-section">
            <h3>Cum ți s-a părut organizarea?</h3>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${formData.organization_rating >= star ? 'active' : ''}`}
                  onClick={() => handleRatingChange('organization_rating', star)}
                >
                  ⭐
                </button>
              ))}
              <span className="rating-value">{formData.organization_rating}/5</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comentarii (opțional)</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Spune-ne ce ai crezut..."
              rows="4"
            />
          </div>

          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? 'Se trimite...' : 'Trimite Feedback'}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="skip-button">
          Sari peste feedback
        </button>
      </div>
    </div>
  );
}

export default Feedback;
