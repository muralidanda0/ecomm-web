import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCart, updateCartItem, removeFromCart } from '../services/cartService';

const CartPage = () => {
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const loadCart = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getCart();
      setCart(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (productId, newQty, maxStock) => {
    if (newQty < 1 || newQty > maxStock) return;
    setUpdating(productId);
    try {
      const { data } = await updateCartItem(productId, newQty);
      setCart(data.data);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity.');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdating(productId);
    try {
      const { data } = await removeFromCart(productId);
      setCart(data.data);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="loading">Loading cart…</div>;

  const items = cart?.items ?? [];
  const totalPrice = items.reduce((sum, item) => {
    const price = item.productId?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="page">
      <h1 className="page__title">Your Cart</h1>
      <p className="page__subtitle">
        {items.length === 0 ? 'Your cart is empty.' : `${items.length} item(s) in your cart.`}
      </p>

      {error && <div className="alert alert--error">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here yet</h3>
          <p>Browse products and add items to your cart.</p>
          <Link to="/products" className="btn btn--primary" style={{ marginTop: '1rem' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {items.map((item) => {
            const product = item.productId;
            if (!product) return null;
            const imageUrl = product.imageUrl || 'https://via.placeholder.com/80?text=?';
            const lineTotal = product.price * item.quantity;

            return (
              <div key={product._id} className="cart-item">
                <img src={imageUrl} alt={product.name} className="cart-item__img" />
                <div className="cart-item__info">
                  <p className="cart-item__name">{product.name}</p>
                  <p className="cart-item__price">
                    ₹{product.price.toLocaleString()} × {item.quantity} = ₹{lineTotal.toLocaleString()}
                  </p>
                </div>
                <div className="cart-item__actions">
                  <div className="qty-control">
                    <button
                      type="button"
                      disabled={updating === product._id || item.quantity <= 1}
                      onClick={() => handleUpdateQty(product._id, item.quantity - 1, product.stock)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      disabled={updating === product._id || item.quantity >= product.stock}
                      onClick={() => handleUpdateQty(product._id, item.quantity + 1, product.stock)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    disabled={updating === product._id}
                    onClick={() => handleRemove(product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <div className="cart-summary">
            <p className="cart-summary__total">
              Total: <span>₹{totalPrice.toLocaleString()}</span>
            </p>
            <Link to="/checkout" className="btn btn--primary">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
