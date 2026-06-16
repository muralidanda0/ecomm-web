const express = require('express');
const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 API is up and running!',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
