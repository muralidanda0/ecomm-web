import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductById } from '../services/productService';
import { addToCart } from '../services/cartService';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getProductById(id);
        setProduct(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setAdding(true);
    setMessage('');
    try {
      await addToCart(id, quantity);
      await refreshCart();
      setMessage('Added to cart!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="loading">Loading product…</div>;
  if (error && !product) {
    return (
      <div className="page">
        <div className="alert alert--error">{error}</div>
        <Link to="/products" className="btn btn--ghost">← Back to Products</Link>
      </div>
    );
  }

  const imageUrl = product.imageUrl || 'https://via.placeholder.com/500x400?text=No+Image';

  return (
    <div className="page">
      <Link to="/products" className="btn btn--ghost btn--sm" style={{ marginBottom: '1.5rem' }}>
        ← Back to Products
      </Link>

      <div className="detail-grid">
        <img
          src={imageUrl}
          alt={product.name}
          style={{ width: '100%', borderRadius: 16, maxHeight: 420, objectFit: 'cover' }}
        />
        <div>
          <span className="product-card__category">{product.category}</span>
          <h1 className="page__title">{product.name}</h1>
          <p className="product-card__price" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
            ₹{product.price.toLocaleString()}
          </p>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {product.description}
          </p>
          <p className="product-card__stock" style={{ marginBottom: '1.5rem' }}>
            {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
          </p>

          {error && <div className="alert alert--error">{error}</div>}
          {message && <div className="alert alert--success">{message}</div>}

          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="qty-control">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>
              {isAuthenticated && (
                <Link to="/cart" className="btn btn--ghost">View Cart</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
