const express   = require('express');
const { protect } = require('../middleware/auth');
const admin       = require('../middleware/admin');
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

// All order routes are private
router.use(protect);

// POST /api/orders/place         — place order from cart + address
router.post('/place', placeOrder);

// GET  /api/orders/my-orders     — get logged-in user's orders
router.get('/my-orders', getMyOrders);

// GET  /api/orders/:id           — get single order (owner or admin)
router.get('/:id', getOrderById);

// PUT  /api/orders/:id/status    — update order status (admin only)
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
