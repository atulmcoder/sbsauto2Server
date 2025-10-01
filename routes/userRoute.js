// routes/userRoute.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// POST /api/users
router.post('/', async (req, res) => {
   console.log('POST /api/users body:', req.body);
  try {
    const { firstName, lastName, email, mobile, message } = req.body;

    // Simple server-side required fields check
    if (!firstName || !lastName || !email || !mobile) {
      return res.status(400).json({ message: 'firstName, lastName, email and mobile are required' });
    }

    // Optional: Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // Create and save
    const newUser = new User({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      mobile: String(mobile).trim(),
      message: message ? String(message).trim() : undefined
    });

    const savedUser = await newUser.save();

    console.log('User registered successfully:', { email: savedUser.email, id: savedUser._id });
    return res.status(201).json({ message: 'User registered successfully', user: savedUser });

  } catch (error) {
    console.error('Error registering user:', error);

    // Mongoose validation error -> 400 Bad Request
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Duplicate key error (unique index) -> 409 Conflict
    if (error.code === 11000) {
      // error.keyValue e.g. { email: 'a@b.com' }
      const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
      return res.status(409).json({
        message: `Duplicate ${duplicateField}: value already exists`,
        field: duplicateField,
        value: error.keyValue ? error.keyValue[duplicateField] : undefined
      });
    }

    // Generic server error
    return res.status(500).json({
      message: 'Error registering user due to a server issue.',
      error: error.message
    });
  }
});

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;
