import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Plan Trip', path: '/plan' },
    { name: 'Explore', path: '/explore' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-container">
          {/* Logo */}
          <Link to="/" className="nav-brand">
            <div style={{
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              borderRadius: '10px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Compass size={22} />
            </div>
            <span>SmartTrip</span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="nav-actions">
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={16} />
              Login
            </button>
            <Link to="/plan" className="btn btn-primary btn-sm">
              <Sparkles size={16} />
              Plan My Trip
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-outline btn-sm mobile-only"
              style={{ display: 'none' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Login Demo Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Welcome to SmartTrip</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              SmartTrip uses guest mode by default to let you plan trips, generate ML recommendations, and save itineraries instantly!
            </p>
            <div className="form-group">
              <label className="form-label">Active Session</label>
              <input type="text" className="form-input" value="Student / Guest Explorer" disabled readOnly />
            </div>
            <button
              onClick={() => setShowLoginModal(false)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
