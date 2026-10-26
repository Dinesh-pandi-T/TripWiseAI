import React from 'react';
import { Compass, Heart, Github, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#fff' }}>
              <Compass className="text-primary" size={24} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem' }}>SmartTrip</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: '#94a3b8', marginBottom: '16px' }}>
              An AI & Data Science powered travel planning platform integrating TF-IDF content recommendations, route optimization, real-time weather adaptations, and dynamic budget estimation.
            </p>
            <div className="badge badge-primary">
              College Data Science Project
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '16px' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Home Landing</Link></li>
              <li><Link to="/plan" style={{ color: '#94a3b8' }}>Plan Trip Engine</Link></li>
              <li><Link to="/explore" style={{ color: '#94a3b8' }}>Explore Destinations</Link></li>
              <li><Link to="/analytics" style={{ color: '#94a3b8' }}>Data Science Analytics</Link></li>
              <li><Link to="/about" style={{ color: '#94a3b8' }}>ML Methodology & Architecture</Link></li>
            </ul>
          </div>

          {/* Machine Learning Specs */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '16px' }}>Data Science Core</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
              <li>• TF-IDF Vectorization (1-2 N-grams)</li>
              <li>• Cosine Similarity Matrix</li>
              <li>• Multi-Factor Weighted Scoring</li>
              <li>• Haversine Distance Route Optimization</li>
              <li>• Open-Meteo Weather Adaptation</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '16px' }}>Tech Stack</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.8' }}>
              React.js, Vite, Axios, Recharts, React-Leaflet, Python Flask, Pandas, Scikit-learn, SQLite.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.85rem',
          color: '#64748b'
        }}>
          <div>
            &copy; {new Date().getFullYear()} SmartTrip Planning & Recommendation System. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Built with Data Science & AI <Sparkles size={14} color="#f59e0b" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
