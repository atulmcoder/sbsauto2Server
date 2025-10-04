// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const JWT_SECRET = process.env.JWT_SECRET;

// login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username, isAdmin:true }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ ok: true, token });
  }
  return res.status(401).json({ ok: false, message: 'Invalid credentials' });
});

module.exports = router;
