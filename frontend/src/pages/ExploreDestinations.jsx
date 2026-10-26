import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Search, ArrowRight, Sparkles } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { fetchDestinations } from '../services/api';

const ExploreDestinations = () => {
  const navigate = useNavigate();
  const { updateTripPlan } = useTrip();

  const [destinations, setDestinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations()
      .then((data) => setDestinations(data))
      .catch((err) => console.error('Error fetching destinations:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectDestination = (destName) => {
    updateTripPlan({ destination: destName });
    navigate('/plan');
  };

  const filtered = destinations.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-wrapper" style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
            Destination Catalog
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', marginBottom: '12px' }}>
            Explore Popular Destinations
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 28px' }}>
            Discover prime tourist locations across India with curated attractions, weather profiles, and realistic cost benchmarks.
          </p>

          {/* Search Box */}
          <div style={{ maxWidth: '460px', margin: '0 auto', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by city, state, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '44px', borderRadius: '9999px', boxShadow: 'var(--shadow-sm)' }}
            />
          </div>
        </div>

        {/* Destination Grid */}
        <div className="grid-3">
          {filtered.map((dest) => (
            <div key={dest.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  Avg ₹{dest.avg_daily_budget} / day
                </div>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <MapPin size={15} color="var(--primary)" />
                  <span>{dest.state}, {dest.country}</span>
                </div>

                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#0f172a' }}>
                  {dest.name}
                </h3>

                <p style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  flex: 1
                }}>
                  {dest.description}
                </p>

                <div style={{
                  padding: '10px 0',
                  borderTop: '1px solid #f1f5f9',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  color: '#475569'
                }}>
                  <Calendar size={14} color="#f59e0b" />
                  <span>Best Season: <strong>{dest.best_season}</strong></span>
                </div>

                <button
                  onClick={() => handleSelectDestination(dest.name)}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Sparkles size={16} />
                  Plan Trip to {dest.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreDestinations;
