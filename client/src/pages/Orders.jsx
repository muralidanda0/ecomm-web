import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-badge--${status}`}>{status}</span>
);

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getMyOrders();
        setOrders(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loading">Loading orders…</div>;

  return (
    <div className="page">
      <h1 className="page__title">My Orders</h1>
      <p className="page__subtitle">Track and view your order history.</p>

      {error && <div className="alert alert--error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here.</p>
          <Link to="/products" className="btn btn--primary" style={{ marginTop: '1rem' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`} style={{ display: 'block' }}>
            <article className="order-card">
              <div>
                <p className="order-card__id">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {formatDate(order.createdAt)} · {order.items.length} item(s)
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <StatusBadge status={order.status} />
                <span className="order-card__total">₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </article>
          </Link>
        ))
      )}
    </div>
  );
};

export default OrdersPage;
