import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  { icon: '🚀', title: 'Lightning Fast', desc: 'Optimized for performance with React + Vite.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'JWT auth & encrypted transactions built-in.' },
  { icon: '📦', title: 'Easy Inventory', desc: 'Manage products, stock & categories effortlessly.' },
  { icon: '📊', title: 'Admin Dashboard', desc: 'Real-time analytics and order management.' },
];

const HomePage = () => {
  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__badge">✨ Full-Stack MERN Platform</div>
        <h1 className="hero__title">
          Shop Smarter,<br />
          <span className="gradient-text">Live Better.</span>
        </h1>
        <p className="hero__subtitle">
          Discover thousands of premium products with blazing-fast delivery,
          secure checkout, and a seamless shopping experience.
        </p>
        <div className="hero__cta">
          <Link to="/products" className="btn btn--primary">Browse Products</Link>
          <Link to="/register" className="btn btn--ghost">Create Account</Link>
        </div>
        {/* Floating decorative blobs */}
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="features">
        <h2 className="features__heading">Why Choose ShopNova?</h2>
        <div className="features__grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-card__icon">{f.icon}</span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="cta-banner">
        <h2>Ready to start shopping?</h2>
        <p>Join thousands of happy customers today.</p>
        <Link to="/products" className="btn btn--primary">Shop Now →</Link>
      </section>
    </div>
  );
};

export default HomePage;
