import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrderById } from '../services/orderService';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-badge--${status}`}>{status}</span>
);

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await getOrderById(id);
        setOrder(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="loading">Loading order…</div>;

  if (error || !order) {
    return (
      <div className="page">
        <div className="alert alert--error">{error || 'Order not found.'}</div>
        <Link to="/orders" className="btn btn--ghost">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/orders" className="btn btn--ghost btn--sm" style={{ marginBottom: '1.5rem' }}>
        ← Back to Orders
      </Link>

      {justPlaced && (
        <div className="alert alert--success" style={{ marginBottom: '1.5rem' }}>
          Order placed successfully! Your order confirmation is below.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page__title">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="page__subtitle">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="detail-grid">
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#e2e8f0' }}>Items</h2>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                marginBottom: '0.75rem',
              }}
            >
              <p style={{ fontWeight: 700, color: '#e2e8f0' }}>{item.name}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                ₹{item.price.toLocaleString()} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
          <div className="cart-summary" style={{ marginTop: '1rem' }}>
            <p className="cart-summary__total">
              Total: <span>₹{order.totalPrice.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#e2e8f0' }}>Shipping Address</h2>
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              color: '#94a3b8',
              lineHeight: 1.8,
            }}
          >
            <p style={{ color: '#e2e8f0', fontWeight: 600 }}>{order.address.fullName}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.street}</p>
            <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
