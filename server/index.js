const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const postersDir = path.join(uploadsDir, 'posters');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(postersDir)) fs.mkdirSync(postersDir);

// Serve static files
app.use('/uploads', express.static(uploadsDir));
app.use('/qrcodes', express.static(path.join(__dirname, '../qrcodes')));

// Create qrcodes directory
const qrcodesDir = path.join(__dirname, '../qrcodes');
if (!fs.existsSync(qrcodesDir)) fs.mkdirSync(qrcodesDir);

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'crtcinemadonduseni@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postersDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Database setup
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Movies table
  db.run(`CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    poster TEXT,
    location TEXT,
    min_age INTEGER DEFAULT 0,
    max_age INTEGER DEFAULT 100,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    show_date TEXT NOT NULL,
    show_time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Registrations table
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    qr_code_image TEXT,
    is_scanned BOOLEAN DEFAULT 0,
    scanned_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
  )`);

  // Feedback table
  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    registration_id INTEGER NOT NULL,
    movie_rating INTEGER NOT NULL,
    organization_rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
  )`);

  // Admin users table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create or update default admin
  db.get('SELECT * FROM admins WHERE username = ?', ['lilian'], (err, row) => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('292009', 10);
    
    if (!row) {
      db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['lilian', hashedPassword]);
    } else {
      db.run('UPDATE admins SET password = ? WHERE username = ?', [hashedPassword, 'lilian']);
    }
  });
});

// API Routes

// Get all movies
app.get('/api/movies', (req, res) => {
  db.all('SELECT * FROM movies ORDER BY show_date ASC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single movie
app.get('/api/movies/:id', (req, res) => {
  db.get('SELECT * FROM movies WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json(row);
  });
});

// Create movie (admin)
app.post('/api/movies', upload.single('poster'), (req, res) => {
  const { title, description, location, min_age, max_age, total_seats, show_date, show_time } = req.body;
  const poster = req.file ? `/uploads/posters/${req.file.filename}` : null;

  db.run(
    `INSERT INTO movies (title, description, poster, location, min_age, max_age, total_seats, available_seats, show_date, show_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, poster, location, min_age, max_age, total_seats, total_seats, show_date, show_time],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Movie created successfully' });
    }
  );
});

// Update movie
app.put('/api/movies/:id', upload.single('poster'), (req, res) => {
  const { title, description, location, min_age, max_age, total_seats, show_date, show_time } = req.body;
  const poster = req.file ? `/uploads/posters/${req.file.filename}` : req.body.existing_poster;

  db.run(
    `UPDATE movies SET title = ?, description = ?, poster = ?, location = ?, min_age = ?, max_age = ?, 
     total_seats = ?, available_seats = ?, show_date = ?, show_time = ? WHERE id = ?`,
    [title, description, poster, location, min_age, max_age, total_seats, req.body.available_seats, show_date, show_time, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Movie updated successfully' });
    }
  );
});

// Delete movie
app.delete('/api/movies/:id', (req, res) => {
  db.run('DELETE FROM movies WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Movie deleted successfully' });
  });
});

// Register for movie
app.post('/api/register', async (req, res) => {
  const { movie_id, name, email, age } = req.body;

  // Check if movie exists and has available seats
  db.get('SELECT * FROM movies WHERE id = ?', [movie_id], async (err, movie) => {
    if (err || !movie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }

    if (movie.available_seats <= 0) {
      res.status(400).json({ 
        error: 'Din păcate, nu mai avem locuri disponibile. Dacă va apărea un loc, te vom anunța pe paginile noastre de socializare: Instagram Crt Donduseni și Facebook Crt Donduseni. Fii cu ochi pe noi!' 
      });
      return;
    }

    // Check age restrictions
    if (age < movie.min_age || age > movie.max_age) {
      res.status(400).json({ 
        error: `Din păcate, vârsta ta nu corespunde restricțiilor pentru acest film. Pentru acest film este necesar să ai între ${movie.min_age} și ${movie.max_age} ani.` 
      });
      return;
    }

    // Generate unique QR code
    const qrCodeData = `${Date.now()}-${movie_id}-${Math.random().toString(36).substr(2, 9)}`;
    const qrCodeImagePath = `/qrcodes/${qrCodeData}.png`;
    const qrCodeFullPath = path.join(qrcodesDir, `${qrCodeData}.png`);

    try {
      await QRCode.toFile(qrCodeFullPath, qrCodeData, {
        width: 300,
        margin: 2
      });

      db.run(
        `INSERT INTO registrations (movie_id, name, email, age, qr_code, qr_code_image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [movie_id, name, email, age, qrCodeData, qrCodeImagePath],
        async function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // Update available seats
          db.run(
            'UPDATE movies SET available_seats = available_seats - 1 WHERE id = ?',
            [movie_id]
          );

          // Send email with QR code as attachment
          const mailOptions = {
            from: 'CRT Cinema Donduseni <crtcinemadonduseni@gmail.com>',
            to: email,
            subject: `Biletul tău pentru ${movie.title} - APROBAT ✅`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px; color: white;">
                  <h1 style="color: #e94560; text-align: center;">🎬 CRT Cinema Donduseni</h1>
                  <h2 style="text-align: center; margin-top: 20px;">Salut, ${name}!</h2>
                  <p style="text-align: center; margin-top: 20px;">Biletul tău a fost <strong style="color: #2ecc71;">APROBAT</strong> ✅</p>
                  <p style="text-align: center; margin-top: 10px;">Aici se află biletul tău la filmul <strong>${movie.title}</strong></p>
                  
                  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="text-align: center; font-size: 18px;">📅 Data: ${new Date(movie.show_date).toLocaleDateString('ro-RO')}</p>
                    <p style="text-align: center; font-size: 18px;">⏰ Ora: ${movie.show_time}</p>
                    <p style="text-align: center; font-size: 18px;">📍 Locația: ${movie.location || 'CRT Cinema Donduseni'}</p>
                    <p style="text-align: center; font-size: 18px;">🎂 Vârsta: ${age} ani</p>
                  </div>
                  
                  <p style="text-align: center; margin-top: 20px;">Te așteptăm cu drag!</p>
                  
                  <div style="text-align: center; margin: 30px 0; background: white; padding: 20px; border-radius: 10px;">
                    <p style="color: #333; font-weight: bold; margin-bottom: 15px;">Codul tău de acces:</p>
                    <p style="font-size: 24px; font-weight: bold; color: #e94560; letter-spacing: 2px; font-family: monospace;">${qrCodeData}</p>
                  </div>
                  
                  <p style="text-align: center; margin-top: 20px;">📎 Codul QR este atașat ca imagine în acest email</p>
                  
                  <p style="text-align: center; color: #ccc; font-size: 14px;">Acest cod este valabil 2 zile după data filmului</p>
                  <p style="text-align: center; color: #e94560; font-weight: bold; margin-top: 20px;">Prezintă acest cod la intrare pentru acces</p>
                </div>
              </div>
            `,
            attachments: [
              {
                filename: `bilet-${movie.title}-${name}.png`,
                path: qrCodeFullPath,
                contentType: 'image/png'
              }
            ]
          };

          try {
            await transporter.sendMail(mailOptions);
          } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
          }

          res.json({
            id: this.lastID,
            qr_code: qrCodeData,
            qr_code_image: qrCodeImagePath,
            message: 'Registration successful'
          });
        }
      );
    } catch (qrErr) {
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  });
});

// Get registrations for a movie
app.get('/api/movies/:id/registrations', (req, res) => {
  db.all(
    `SELECT r.*, m.title as movie_title FROM registrations r 
     JOIN movies m ON r.movie_id = m.id 
     WHERE r.movie_id = ? ORDER BY r.created_at DESC`,
    [req.params.id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Scan QR code
app.post('/api/scan', (req, res) => {
  const { qr_code } = req.body;

  db.get(
    `SELECT r.*, m.title as movie_title, m.show_date, m.show_time, m.min_age, m.max_age
     FROM registrations r 
     JOIN movies m ON r.movie_id = m.id 
     WHERE r.qr_code = ?`,
    [qr_code],
    (err, registration) => {
      if (err || !registration) {
        res.status(404).json({ error: 'Invalid QR code' });
        return;
      }

      // Check if QR code is expired (2 days after movie)
      const movieDate = new Date(registration.show_date);
      const expiryDate = new Date(movieDate);
      expiryDate.setDate(expiryDate.getDate() + 2);
      const now = new Date();

      if (now > expiryDate) {
        res.status(400).json({ 
          error: 'QR code has expired',
          expired: true
        });
        return;
      }

      if (registration.is_scanned) {
        res.json({ 
          message: 'Already scanned',
          scanned: true,
          registration
        });
        return;
      }

      // Mark as scanned
      db.run(
        'UPDATE registrations SET is_scanned = 1, scanned_at = CURRENT_TIMESTAMP WHERE id = ?',
        [registration.id],
        (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ 
            message: 'QR code scanned successfully',
            scanned: false,
            registration
          });
        }
      );
    }
  );
});

// Submit feedback
app.post('/api/feedback', (req, res) => {
  const { movie_id, registration_id, movie_rating, organization_rating, comment } = req.body;

  db.run(
    `INSERT INTO feedback (movie_id, registration_id, movie_rating, organization_rating, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [movie_id, registration_id, movie_rating, organization_rating, comment],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Feedback submitted successfully' });
    }
  );
});

// Get feedback for a movie
app.get('/api/movies/:id/feedback', (req, res) => {
  db.all(
    `SELECT f.*, r.name as attendee_name FROM feedback f 
     JOIN registrations r ON f.registration_id = r.id 
     WHERE f.movie_id = ? ORDER BY f.created_at DESC`,
    [req.params.id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const bcrypt = require('bcryptjs');

  console.log('Login attempt for username:', username);

  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (!admin) {
      console.log('Admin not found');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    console.log('Admin found, comparing password');
    const passwordMatch = bcrypt.compareSync(password, admin.password);
    console.log('Password match:', passwordMatch);

    if (passwordMatch) {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: admin.id }, 'crt-cinema-secret-key-2024', { expiresIn: '24h' });
      res.json({ token, admin: { id: admin.id, username: admin.username } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Get dashboard stats
app.get('/api/admin/stats', (req, res) => {
  db.all(`
    SELECT
      (SELECT COUNT(*) FROM movies) as total_movies,
      (SELECT COUNT(*) FROM registrations) as total_registrations,
      (SELECT COUNT(*) FROM registrations WHERE is_scanned = 1) as scanned_registrations,
      (SELECT COUNT(*) FROM feedback) as total_feedback
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows[0]);
  });
});

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, 'crt-cinema-secret-key-2024');
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all admins
app.get('/api/admin/admins', verifyAdminToken, (req, res) => {
  db.all('SELECT id, username, created_at FROM admins ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new admin
app.post('/api/admin/admins', verifyAdminToken, (req, res) => {
  const { username, password } = req.body;
  const bcrypt = require('bcryptjs');

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(400).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    res.json({ id: this.lastID, username, message: 'Admin created successfully' });
  });
});

// Change admin password
app.put('/api/admin/change-password', verifyAdminToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const bcrypt = require('bcryptjs');

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  db.get('SELECT * FROM admins WHERE id = ?', [req.adminId], (err, admin) => {
    if (err || !admin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    const passwordMatch = bcrypt.compareSync(currentPassword, admin.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE admins SET password = ? WHERE id = ?', [hashedNewPassword, req.adminId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Password changed successfully' });
    });
  });
});

// Delete admin
app.delete('/api/admin/admins/:id', verifyAdminToken, (req, res) => {
  const adminIdToDelete = parseInt(req.params.id);

  if (adminIdToDelete === req.adminId) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM admins WHERE id = ?', [adminIdToDelete], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }
    res.json({ message: 'Admin deleted successfully' });
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
