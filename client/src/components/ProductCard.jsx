import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image';

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`}>
        <img
          src={imageUrl}
          alt={product.name}
          className="product-card__img"
          loading="lazy"
        />
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        <p className="product-card__price">₹{product.price.toLocaleString()}</p>
        <p className="product-card__stock">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
        <Link to={`/products/${product._id}`} className="btn btn--primary btn--sm">
          View Details
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
