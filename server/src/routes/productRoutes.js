const express  = require('express');
const { body, query } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const admin       = require('../middleware/admin');

const router = express.Router();

// ── Validation: create product ────────────────────────────────────────────────
const createValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.')
    .isLength({ max: 120 }).withMessage('Name cannot exceed 120 characters.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters.'),

  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.'),

  body('stock')
    .notEmpty().withMessage('Stock is required.')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),

  body('imageUrl')
    .optional()
    .isURL().withMessage('Image URL must be a valid URL.'),
];

// ── Validation: update product (all fields optional) ─────────────────────────
const updateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty.')
    .isLength({ max: 120 }).withMessage('Name cannot exceed 120 characters.'),

  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty.')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters.'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),

  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty.'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),

  body('imageUrl')
    .optional()
    .isURL().withMessage('Image URL must be a valid URL.'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// Public
router.get('/',    getProducts);
router.get('/:id', getProductById);

// Admin protected
router.post('/',    protect, admin, createValidation,  createProduct);
router.put('/:id',  protect, admin, updateValidation,  updateProduct);
router.delete('/:id', protect, admin,                  deleteProduct);

module.exports = router;
