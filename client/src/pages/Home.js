import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies');
      setMovies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Se încarcă filmele...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🎬 CRT Cinema Donduseni</h1>
        <p>Bine ai venit la cinema-ul nostru!</p>
        <Link to="/admin" className="admin-link">
          🔐 Admin
        </Link>
      </header>

      {movies.length === 0 ? (
        <div className="no-movies">
          <p>Nu există filme disponibile momentan.</p>
          <p>Verifică mai târziu!</p>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              {movie.poster && (
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="movie-poster"
                />
              )}
              <div className="movie-info">
                <h2>{movie.title}</h2>
                <p className="movie-description">{movie.description}</p>
                <div className="movie-details">
                  <p>📅 {new Date(movie.show_date).toLocaleDateString('ro-RO')}</p>
                  <p>⏰ {movie.show_time}</p>
                  <p>📍 {movie.location || 'CRT Cinema Donduseni'}</p>
                  <p>👥 Locuri disponibile: {movie.available_seats} / {movie.total_seats}</p>
                  <p>🎂 Vârstă: {movie.min_age} - {movie.max_age} ani</p>
                </div>
                {movie.available_seats > 0 ? (
                  <Link to={`/register/${movie.id}`} className="reserve-button">
                    Rezervă Bilet
                  </Link>
                ) : (
                  <button className="reserve-button disabled" disabled>
                    Nu mai sunt locuri
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
