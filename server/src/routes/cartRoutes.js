const express   = require('express');
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

const router = express.Router();

// All cart routes are private
router.use(protect);

// GET  /api/cart           — get current user's cart
router.get('/', getCart);

// POST /api/cart/add       — add item { productId, quantity }
router.post('/add', addToCart);

// PUT  /api/cart/update    — update item quantity { productId, quantity }
router.put('/update', updateCartItem);

// DELETE /api/cart/remove/:productId — remove a specific item
router.delete('/remove/:productId', removeFromCart);

// DELETE /api/cart/clear   — clear entire cart
router.delete('/clear', clearCart);

module.exports = router;
