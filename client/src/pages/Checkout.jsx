import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCart } from '../services/cartService';
import { placeOrder } from '../services/orderService';

const emptyAddress = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState(emptyAddress);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getCart();
        setCart(data.data);
        if (!data.data?.items?.length) {
          navigate('/cart');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cart.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const totalPrice = (cart?.items ?? []).reduce((sum, item) => {
    const price = item.productId?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await placeOrder(address);
      await refreshCart();
      navigate(`/orders/${data.data._id}`, {
        state: { justPlaced: true },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading checkout…</div>;

  return (
    <div className="page">
      <h1 className="page__title">Checkout</h1>
      <p className="page__subtitle">Enter your shipping address to complete your order.</p>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="detail-grid">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" name="fullName" value={address.fullName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone (10 digits)</label>
            <input
              id="phone"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              required
              pattern="\d{10}"
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label htmlFor="street">Street Address</label>
            <input id="street" name="street" value={address.street} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input id="city" name="city" value={address.city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input id="state" name="state" value={address.state} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="pincode">Pincode (6 digits)</label>
            <input
              id="pincode"
              name="pincode"
              value={address.pincode}
              onChange={handleChange}
              required
              pattern="\d{6}"
              maxLength={6}
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place Order — ₹${totalPrice.toLocaleString()}`}
          </button>
        </form>

        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#e2e8f0' }}>Order Summary</h2>
          {(cart?.items ?? []).map((item) => {
            const product = item.productId;
            if (!product) return null;
            return (
              <div key={product._id} style={{ marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                {product.name} × {item.quantity} — ₹{(product.price * item.quantity).toLocaleString()}
              </div>
            );
          })}
          <div className="cart-summary" style={{ marginTop: '1rem' }}>
            <p className="cart-summary__total">
              Total: <span>₹{totalPrice.toLocaleString()}</span>
            </p>
          </div>
          <Link to="/cart" className="btn btn--ghost btn--sm" style={{ marginTop: '1rem' }}>
            ← Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
