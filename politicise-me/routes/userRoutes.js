const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Add user registration route
router.post('/register', async (req, res) => {
  const { username, email, password, linkedinId } = req.body;
  try {
    const newUser = new User({ username, email, password, linkedinId });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
