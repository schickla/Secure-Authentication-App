const fs = require('fs');
const https = require('https');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db = require('./db/database');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = 3000;

const httpsOptions = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem')
};

// Security headers
app.use(helmet());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');

// Sessions
app.use(
  session({
    secret: 'super-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 30
    }
  })
);

// Rate limit auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts. Please try again later.'
});

// Count failed login attempts for this username + IP in last 15 minutes
function getFailedAttempts(username, ip) {
  const row = db.prepare(`
    SELECT COUNT(*) AS count
    FROM login_attempts
    WHERE username = ?
      AND ip_address = ?
      AND success = 0
      AND timestamp >= datetime('now', '-15 minutes')
  `).get(username, ip);

  return row.count;
}

// Home
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user || null });
});

// Register page
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Register handler
app.post('/register', authLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || password.length < 6) {
    return res.render('register', {
      error: 'Username and password are required. Password must be at least 6 characters.'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (username, password)
      VALUES (?, ?)
    `).run(username.trim(), hashedPassword);

    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Username already exists.' });
  }
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login handler
app.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  if (!username || !password) {
    return res.render('login', { error: 'Please enter both username and password.' });
  }

  const cleanUsername = username.trim();
  const failedAttempts = getFailedAttempts(cleanUsername, ip);

  if (failedAttempts >= 5) {
    return res.render('login', {
      error: 'Too many failed attempts. Try again in 15 minutes.'
    });
  }

  const user = db.prepare(`
    SELECT * FROM users WHERE username = ?
  `).get(cleanUsername);

  if (!user) {
    db.prepare(`
      INSERT INTO login_attempts (username, ip_address, success)
      VALUES (?, ?, 0)
    `).run(cleanUsername, ip);

    return res.render('login', { error: 'Invalid credentials.' });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    db.prepare(`
      INSERT INTO login_attempts (username, ip_address, success)
      VALUES (?, ?, 0)
    `).run(cleanUsername, ip);

    return res.render('login', { error: 'Invalid credentials.' });
  }

  db.prepare(`
    INSERT INTO login_attempts (username, ip_address, success)
    VALUES (?, ?, 1)
  `).run(cleanUsername, ip);

  req.session.user = {
    id: user.id,
    username: user.username
  };

  res.redirect('/dashboard');
});

// Dashboard
app.get('/dashboard', requireAuth, (req, res) => {
  const attempts = db.prepare(`
    SELECT username, ip_address, success, timestamp
    FROM login_attempts
    ORDER BY timestamp DESC
    LIMIT 20
  `).all();

  const stats = db.prepare(`
    SELECT
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS failed
    FROM login_attempts
  `).get();

  res.render('dashboard', {
    user: req.session.user,
    attempts,
    stats
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS server running at https://kepler.canisius.edu:${PORT}`);
});
