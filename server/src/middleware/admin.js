/**
 * admin middleware
 *
 * Must be used AFTER the protect middleware (which attaches req.user).
 * Blocks any user whose role is not 'admin' with a 403 Forbidden.
 *
 * Usage: router.post('/', protect, admin, handler)
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({
    success: false,
    message: 'Access denied. Admins only.',
  });
};

module.exports = admin;
