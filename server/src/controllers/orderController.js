const { Order, Cart, Product } = require('../models');

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/orders/place
// @desc    Place an order from current cart + supplied address
// @access  Private
// @body    { address: { fullName, phone, street, city, state, pincode } }
// ────────────────────────────────────────────────────────────────────────────
const placeOrder = async (req, res, next) => {
  try {
    const { address } = req.body;

    // ── Validate address fields ──────────────────────────────────────────────
    const requiredAddressFields = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
    const missingFields = requiredAddressFields.filter((f) => !address?.[f]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing address fields: ${missingFields.join(', ')}`,
      });
    }

    // ── Fetch user's cart with populated products ────────────────────────────
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      'items.productId',
      'name price stock'
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Add items before placing an order.',
      });
    }

    // ── Build order items & validate stock ───────────────────────────────────
    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart no longer exist.',
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}.`,
        });
      }

      orderItems.push({
        productId: product._id,
        name:      product.name,
        price:     product.price,
        quantity:  item.quantity,
      });

      totalPrice += product.price * item.quantity;
    }

    // ── Deduct stock for each product ────────────────────────────────────────
    const stockUpdates = orderItems.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      })
    );
    await Promise.all(stockUpdates);

    // ── Create order ─────────────────────────────────────────────────────────
    const order = await Order.create({
      userId:     req.user._id,
      items:      orderItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      status:     'pending',
      address,
    });

    // ── Clear cart after successful order ────────────────────────────────────
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! 🎉',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/orders/my-orders
// @desc    Get all orders of the logged-in user (newest first)
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/orders/:id
// @desc    Get a single order by ID (owner or admin only)
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).select('-__v');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Only allow the order owner or an admin to view it
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order.',
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private — admin
// @body    { status: 'processing' | 'shipped' | 'delivered' | 'cancelled' }
// ────────────────────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Prevent re-opening a delivered or cancelled order
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${order.status} order.`,
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, updateOrderStatus };
