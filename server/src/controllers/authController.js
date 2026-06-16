const jwt         = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User }    = require('../models');

// ── Helper: generate signed JWT ───────────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ── Helper: send validation errors as 422 ────────────────────────────────────
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return null;
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    // 1. Validate request body
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { name, email, password } = req.body;

    // 2. Check if email is already taken
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 3. Create user — password hashing handled by Mongoose pre-save hook
    const user = await User.create({ name, email, password });

    // 4. Respond (do NOT send password back)
    res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now log in.',
      data: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login and receive a JWT token
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    // 1. Validate request body
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { email, password } = req.body;

    // 2. Find user — re-include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Compare provided password with stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Generate JWT
    const token = generateToken(user._id, user.role);

    // 5. Respond with token and user info
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      data: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private (requires protect middleware)
// ────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    res.status(200).json({
      success: true,
      data: {
        id:        req.user._id,
        name:      req.user.name,
        email:     req.user.email,
        role:      req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
