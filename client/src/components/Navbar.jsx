import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        🛒 <span>ShopNova</span>
      </Link>
      <ul className="navbar__links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li>
          <Link to="/cart" className="navbar__cart-link">
            Cart
            {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
          </Link>
        </li>
        {isAuthenticated ? (
          <>
            <li><Link to="/orders">Orders</Link></li>
            <li className="navbar__user">
              <span className="navbar__username">{user?.name}</span>
              <button type="button" className="navbar__logout" onClick={logout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="navbar__btn">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
