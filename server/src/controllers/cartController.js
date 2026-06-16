const { Cart, Product } = require('../models');

// ────────────────────────────────────────────────────────────────────────────
// @route   GET /api/cart
// @desc    Get current user's cart with populated product details
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      'items.productId',
      'name price imageUrl stock category'
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { userId: req.user._id, items: [], totalItems: 0, totalPrice: 0 },
      });
    }

    // Compute totals on the fly
    const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.items.reduce((sum, i) => {
      const price = i.productId?.price ?? 0;
      return sum + price * i.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      data: { ...cart.toObject(), totalItems, totalPrice },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   POST /api/cart/add
// @desc    Add item to cart; if product already exists, increment quantity
// @access  Private
// @body    { productId, quantity }
// ────────────────────────────────────────────────────────────────────────────
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    // Verify product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available in stock.`,
      });
    }

    // Upsert cart for this user
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      // Check combined quantity against stock
      if (product.stock < existingItem.quantity + quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} unit(s) left.`,
        });
      }
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // Return populated cart
    await cart.populate('items.productId', 'name price imageUrl stock category');

    res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/cart/update
// @desc    Update the quantity of an existing cart item
// @access  Private
// @body    { productId, quantity }
// ────────────────────────────────────────────────────────────────────────────
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available in stock.`,
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart.' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId', 'name price imageUrl stock category');

    res.status(200).json({
      success: true,
      message: 'Cart item updated.',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/cart/remove/:productId
// @desc    Remove a specific item from the cart
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/cart/clear
// @desc    Clear all items from the user's cart
// @access  Private
// ────────────────────────────────────────────────────────────────────────────
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(200).json({ success: true, message: 'Cart is already empty.' });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ success: true, message: 'Cart cleared successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
