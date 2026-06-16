const { validationResult } = require('express-validator');
const { Product } = require('../models');

// ── Helper ────────────────────────────────────────────────────────────────────
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
// @route   GET /api/products
// @desc    Get all products (with optional filtering + pagination)
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      page  = 1,
      limit = 10,
      sort  = '-createdAt', // newest first by default
    } = req.query;

    const filter = {};

    // Filter by category (case-insensitive)
    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Search by product name (partial, case-insensitive)
    if (search) {
      filter.name = { $regex: new RegExp(search, 'i') };
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // cap at 50
    const skip     = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext:    pageNum < Math.ceil(total / limitNum),
        hasPrev:    pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err); // CastError (bad ObjectId) handled by errorHandler
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/products
// @desc    Create a new product
// @access  Private — admin only
// ────────────────────────────────────────────────────────────────────────────
const createProduct = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category: category.toLowerCase(),
      stock,
      imageUrl: imageUrl || '',
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private — admin only
// ────────────────────────────────────────────────────────────────────────────
const updateProduct = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    // Normalise category if provided
    if (req.body.category) {
      req.body.category = req.body.category.toLowerCase();
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private — admin only
// ────────────────────────────────────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
