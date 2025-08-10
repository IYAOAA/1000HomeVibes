// server.js
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

// ------------- Config -------------
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'products.json');
const AUTH_FILE = path.join(__dirname, 'auth.json');
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this_in_production';

// CORS: set allowed origin via env for production (example: your Netlify URL)
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'; // change '*' to your Netlify URL in production
app.use(cors({ origin: CORS_ORIGIN }));

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));

// Helper to read/write products
function readProducts() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// Admin credentials source: prefer environment vars; fallback to auth.json
// If you're using env, set ADMIN_USERNAME and ADMIN_PASSWORD_HASH (bcrypt hashed)
function getAuth() {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH) {
    return {
      username: process.env.ADMIN_USERNAME,
      passwordHash: process.env.ADMIN_PASSWORD_HASH
    };
  }
  if (fs.existsSync(AUTH_FILE)) {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  }
  // no admin set yet
  return null;
}

// ------------- Auth -----------------
// Login route: returns a JWT token if credentials match
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const auth = getAuth();
  if (!auth) return res.status(500).json({ error: 'Admin not configured' });

  if (username !== auth.username) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, auth.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

// Middleware to protect routes
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Missing token' });
  const token = parts[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ------------- Products API -------------
app.get('/api/products', (req, res) => {
  res.json(readProducts());
});

app.get('/api/products/:id', (req, res) => {
  const products = readProducts();
  const p = products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Protected: add product
app.post('/api/products', requireAuth, (req, res) => {
  const { title, description, image, link } = req.body;
  if (!title || !link) return res.status(400).json({ error: 'title and link required' });
  const products = readProducts();
  const newProduct = { id: uuidv4(), title, description: description || '', image: image || '', link };
  products.unshift(newProduct);
  writeProducts(products);
  res.json(newProduct);
});

// Protected: update
app.put('/api/products/:id', requireAuth, (req, res) => {
  const products = readProducts();
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...products[idx], ...req.body };
  products[idx] = updated;
  writeProducts(products);
  res.json(updated);
});

// Protected: delete
app.delete('/api/products/:id', requireAuth, (req, res) => {
  let products = readProducts();
  products = products.filter(p => p.id !== req.params.id);
  writeProducts(products);
  res.json({ success: true });
});

// ------------- (Optional) Serve frontend -------------
// If you want the backend to serve frontend, uncomment and adjust the path
// app.use(express.static(path.join(__dirname, '../frontend')));
// app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

// Start server
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
