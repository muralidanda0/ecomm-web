/**
 * Barrel export for all Mongoose models.
 * Import from here to keep requires clean across the codebase:
 *   const { User, Product, Cart, Order } = require('../models');
 */

const User    = require('./User');
const Product = require('./Product');
const Cart    = require('./Cart');
const Order   = require('./Order');

module.exports = { User, Product, Cart, Order };
