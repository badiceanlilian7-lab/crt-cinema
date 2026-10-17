import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showEditMovie, setShowEditMovie] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [newAdminForm, setNewAdminForm] = useState({
    username: '',
    password: ''
  });

  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    location: '',
    min_age: 0,
    max_age: 100,
    total_seats: 50,
    show_date: '',
    show_time: ''
  });
  const [posterFile, setPosterFile] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchStats();
    fetchMovies();
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchRegistrations = async (movieId) => {
    try {
      const response = await axios.get(`/api/movies/${movieId}/registrations`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchFeedback = async (movieId) => {
    try {
      const response = await axios.get(`/api/movies/${movieId}/feedback`);
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(movieForm).forEach(key => {
      formData.append(key, movieForm[key]);
    });
    if (posterFile) {
      formData.append('poster', posterFile);
    }

    try {
      await axios.post('/api/movies', formData);
      setShowAddMovie(false);
      setPosterFile(null);
      setMovieForm({
        title: '',
        description: '',
        location: '',
        min_age: 0,
        max_age: 100,
        total_seats: 50,
        show_date: '',
        show_time: ''
      });
      fetchMovies();
      fetchStats();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Eroare la adăugarea filmului');
    }
  };

  const handleEditMovie = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(movieForm).forEach(key => {
      formData.append(key, movieForm[key]);
    });
    formData.append('existing_poster', selectedMovie.poster);
    if (posterFile) {
      formData.append('poster', posterFile);
    }

    try {
      await axios.put(`/api/movies/${selectedMovie.id}`, formData);
      setShowEditMovie(false);
      setSelectedMovie(null);
      setPosterFile(null);
      setMovieForm({
        title: '',
        description: '',
        location: '',
        min_age: 0,
        max_age: 100,
        total_seats: 50,
        show_date: '',
        show_time: ''
      });
      fetchMovies();
    } catch (error) {
      console.error('Error editing movie:', error);
      alert('Eroare la editarea filmului');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('/api/admin/change-password', passwordForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      alert('Parola a fost schimbată cu succes!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.error || 'Eroare la schimbarea parolei');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/admin/admins', newAdminForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddAdmin(false);
      setNewAdminForm({ username: '', password: '' });
      fetchAdmins();
      alert('Admin creat cu succes!');
    } catch (error) {
      console.error('Error creating admin:', error);
      alert(error.response?.data?.error || 'Eroare la crearea adminului');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest admin?')) {
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdmins();
      alert('Admin șters cu succes!');
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert(error.response?.data?.error || 'Eroare la ștergerea adminului');
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest film?')) return;

    try {
      await axios.delete(`/api/movies/${movieId}`);
      fetchMovies();
      fetchStats();
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Eroare la ștergerea filmului');
    }
  };

  const openEditMovie = (movie) => {
    setSelectedMovie(movie);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      location: movie.location,
      min_age: movie.min_age,
      max_age: movie.max_age,
      total_seats: movie.total_seats,
      show_date: movie.show_date,
      show_time: movie.show_time
    });
    setShowEditMovie(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>🎬 Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Deconectare</button>
      </header>

      <nav className="admin-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'movies' ? 'active' : ''}
          onClick={() => setActiveTab('movies')}
        >
          Filme
        </button>
        <button 
          className={activeTab === 'registrations' ? 'active' : ''}
          onClick={() => setActiveTab('registrations')}
        >
          Înregistrări
        </button>
        <button
          className={activeTab === 'feedback' ? 'active' : ''}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback
        </button>
        <button
          className={activeTab === 'admins' ? 'active' : ''}
          onClick={() => setActiveTab('admins')}
        >
          Admini
        </button>
        <button
          onClick={() => navigate('/admin/scanner')}
        >
          Scanner QR
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Filme</h3>
              <p className="stat-number">{stats?.total_movies || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Înregistrări</h3>
              <p className="stat-number">{stats?.total_registrations || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Scanate</h3>
              <p className="stat-number">{stats?.scanned_registrations || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Feedback</h3>
              <p className="stat-number">{stats?.total_feedback || 0}</p>
            </div>
          </div>
        )}

        {activeTab === 'movies' && (
          <div className="movies-section">
            <div className="section-header">
              <h2>Gestionare Filme</h2>
              <button 
                className="add-button"
                onClick={() => setShowAddMovie(true)}
              >
                + Adaugă Film Nou
              </button>
            </div>

            <div className="movies-list">
              {movies.map((movie) => (
                <div key={movie.id} className="admin-movie-card">
                  {movie.poster && (
                    <img src={movie.poster} alt={movie.title} className="movie-poster-small" />
                  )}
                  <div className="movie-details">
                    <h3>{movie.title}</h3>
                    <p>{movie.description}</p>
                    <p>📅 {new Date(movie.show_date).toLocaleDateString('ro-RO')} ⏰ {movie.show_time}</p>
                    <p>📍 {movie.location || 'CRT Cinema Donduseni'}</p>
                    <p>🎂 {movie.min_age}-{movie.max_age} ani | 👥 {movie.available_seats}/{movie.total_seats} locuri</p>
                  </div>
                  <div className="movie-actions">
                    <button onClick={() => openEditMovie(movie)}>Editare</button>
                    <button onClick={() => handleDeleteMovie(movie.id)} className="delete-button">Ștergere</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="registrations-section">
            <h2>Înregistrări</h2>
            <select 
              value={selectedMovie?.id || ''}
              onChange={(e) => {
                const movie = movies.find(m => m.id === parseInt(e.target.value));
                setSelectedMovie(movie);
                if (movie) fetchRegistrations(movie.id);
              }}
              className="movie-select"
            >
              <option value="">Selectează un film</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>{movie.title}</option>
              ))}
            </select>

            {selectedMovie && (
              <div className="registrations-list">
                <h3>{selectedMovie.title}</h3>
                {registrations.length === 0 ? (
                  <p>Nu există înregistrări pentru acest film.</p>
                ) : (
                  <table className="registrations-table">
                    <thead>
                      <tr>
                        <th>Nume</th>
                        <th>Email</th>
                        <th>Vârstă</th>
                        <th>Cod QR</th>
                        <th>Scanat</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => (
                        <tr key={reg.id}>
                          <td>{reg.name}</td>
                          <td>{reg.email}</td>
                          <td>{reg.age}</td>
                          <td>{reg.qr_code}</td>
                          <td>{reg.is_scanned ? '✅' : '❌'}</td>
                          <td>{new Date(reg.created_at).toLocaleDateString('ro-RO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="feedback-section">
            <h2>Feedback</h2>
            <select 
              value={selectedMovie?.id || ''}
              onChange={(e) => {
                const movie = movies.find(m => m.id === parseInt(e.target.value));
                setSelectedMovie(movie);
                if (movie) fetchFeedback(movie.id);
              }}
              className="movie-select"
            >
              <option value="">Selectează un film</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>{movie.title}</option>
              ))}
            </select>

            {selectedMovie && (
              <div className="feedback-list">
                <h3>{selectedMovie.title}</h3>
                {feedback.length === 0 ? (
                  <p>Nu există feedback pentru acest film.</p>
                ) : (
                  feedback.map((fb) => (
                    <div key={fb.id} className="feedback-card">
                      <h4>{fb.attendee_name}</h4>
                      <p>⭐ Film: {fb.movie_rating}/5</p>
                      <p>⭐ Organizare: {fb.organization_rating}/5</p>
                      {fb.comment && <p>💬 {fb.comment}</p>}
                      <p className="feedback-date">{new Date(fb.created_at).toLocaleDateString('ro-RO')}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="admins-section">
            <div className="section-header">
              <h2>Gestionare Admini</h2>
              <div className="admin-actions">
                <button
                  className="add-button"
                  onClick={() => setShowChangePassword(true)}
                >
                  Schimbă Parola
                </button>
                <button
                  className="add-button"
                  onClick={() => setShowAddAdmin(true)}
                >
                  + Adaugă Admin Nou
                </button>
              </div>
            </div>

            <div className="admins-list">
              {admins.map((admin) => (
                <div key={admin.id} className="admin-card">
                  <div className="admin-info">
                    <h3>{admin.username}</h3>
                    <p>Creat: {new Date(admin.created_at).toLocaleDateString('ro-RO')}</p>
                  </div>
                  <div className="admin-actions">
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="delete-button"
                    >
                      Ștergere
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showAddMovie && (
        <div className="modal">
          <div className="modal-content">
            <h2>Adaugă Film Nou</h2>
            <form onSubmit={handleAddMovie}>
              <div className="form-group">
                <label>Titlu *</label>
                <input
                  type="text"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({...movieForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descriere</label>
                <textarea
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({...movieForm, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Locație</label>
                <input
                  type="text"
                  value={movieForm.location}
                  onChange={(e) => setMovieForm({...movieForm, location: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Vârstă Minimă</label>
                  <input
                    type="number"
                    value={movieForm.min_age}
                    onChange={(e) => setMovieForm({...movieForm, min_age: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Vârstă Maximă</label>
                  <input
                    type="number"
                    value={movieForm.max_age}
                    onChange={(e) => setMovieForm({...movieForm, max_age: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Număr Locuri</label>
                <input
                  type="number"
                  value={movieForm.total_seats}
                  onChange={(e) => setMovieForm({...movieForm, total_seats: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    value={movieForm.show_date}
                    onChange={(e) => setMovieForm({...movieForm, show_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ora *</label>
                  <input
                    type="time"
                    value={movieForm.show_time}
                    onChange={(e) => setMovieForm({...movieForm, show_time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPosterFile(e.target.files[0]);
                    }
                  }}
                />
                {posterFile && (
                  <p style={{ color: '#2ecc71', marginTop: '5px', fontSize: '0.9rem' }}>
                    ✅ {posterFile.name}
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button type="submit">Salvează</button>
                <button type="button" onClick={() => setShowAddMovie(false)}>Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditMovie && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editează Film</h2>
            <form onSubmit={handleEditMovie}>
              <div className="form-group">
                <label>Titlu *</label>
                <input
                  type="text"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({...movieForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descriere</label>
                <textarea
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({...movieForm, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Locație</label>
                <input
                  type="text"
                  value={movieForm.location}
                  onChange={(e) => setMovieForm({...movieForm, location: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Vârstă Minimă</label>
                  <input
                    type="number"
                    value={movieForm.min_age}
                    onChange={(e) => setMovieForm({...movieForm, min_age: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Vârstă Maximă</label>
                  <input
                    type="number"
                    value={movieForm.max_age}
                    onChange={(e) => setMovieForm({...movieForm, max_age: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Număr Locuri</label>
                <input
                  type="number"
                  value={movieForm.total_seats}
                  onChange={(e) => setMovieForm({...movieForm, total_seats: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    value={movieForm.show_date}
                    onChange={(e) => setMovieForm({...movieForm, show_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ora *</label>
                  <input
                    type="time"
                    value={movieForm.show_time}
                    onChange={(e) => setMovieForm({...movieForm, show_time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPosterFile(e.target.files[0]);
                    }
                  }}
                />
                {posterFile && (
                  <p style={{ color: '#2ecc71', marginTop: '5px', fontSize: '0.9rem' }}>
                    ✅ {posterFile.name}
                  </p>
                )}
                {selectedMovie.poster && !posterFile && (
                  <p style={{ color: '#ccc', marginTop: '5px', fontSize: '0.9rem' }}>
                    Poster curent: {selectedMovie.poster}
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button type="submit">Salvează</button>
                <button type="button" onClick={() => setShowEditMovie(false)}>Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="modal">
          <div className="modal-content">
            <h2>Schimbă Parola</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Parola Curentă *</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Parola Nouă *</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Salvează</button>
                <button type="button" onClick={() => setShowChangePassword(false)}>Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddAdmin && (
        <div className="modal">
          <div className="modal-content">
            <h2>Adaugă Admin Nou</h2>
            <form onSubmit={handleCreateAdmin}>
              <div className="form-group">
                <label>Nume Utilizator *</label>
                <input
                  type="text"
                  value={newAdminForm.username}
                  onChange={(e) => setNewAdminForm({...newAdminForm, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Parolă *</label>
                <input
                  type="password"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Creează Admin</button>
                <button type="button" onClick={() => setShowAddAdmin(false)}>Anulează</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
