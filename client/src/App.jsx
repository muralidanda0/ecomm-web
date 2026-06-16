import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import './index.css';

// Placeholder pages (to be built out)
const PlaceholderPage = ({ title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#94a3b8' }}>
    <h2 style={{ fontSize: '2rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>{title}</h2>
    <p>🚧 This page is coming soon.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/products" element={<PlaceholderPage title="Products" />} />
          <Route path="/cart"     element={<PlaceholderPage title="Cart" />} />
          <Route path="/login"    element={<PlaceholderPage title="Login" />} />
          <Route path="/register" element={<PlaceholderPage title="Register" />} />
          <Route path="*"         element={<PlaceholderPage title="404 – Page Not Found" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
