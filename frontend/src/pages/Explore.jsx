import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, MapPin, RefreshCw, AlertTriangle,
  Compass, Sparkles, Filter, Clock
} from 'lucide-react';
import { getAttractions } from '../services/api';
import AttractionCard from '../components/AttractionCard';

const FEATURED_DESTINATIONS = [
  'Ooty',
  'Kodaikanal',
  'Madurai',
  'Chennai',
  'Coimbatore'
];

const Explore = () => {
  const [selectedDestination, setSelectedDestination] = useState('Ooty');
  const [searchInput, setSearchInput] = useState('');
  const [attractions, setAttractions] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [poiFilter, setPoiFilter] = useState('');

  const fetchLiveAttractions = useCallback(async (dest) => {
    if (!dest || !dest.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getAttractions(dest.trim());
      // Handle response structure { destination, updated_at, count, attractions: [...] } or direct array
      if (response && Array.isArray(response.attractions)) {
        setAttractions(response.attractions);
        setUpdatedAt(response.updated_at || new Date().toISOString());
      } else if (Array.isArray(response)) {
        setAttractions(response);
        setUpdatedAt(new Date().toISOString());
      } else {
        setAttractions([]);
        setUpdatedAt(new Date().toISOString());
      }
      setSelectedDestination(dest.trim());
    } catch (err) {
      console.error('Failed to fetch attractions:', err);
      setError('Unable to load live attraction data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial destination (Ooty) on component mount
  useEffect(() => {
    fetchLiveAttractions('Ooty');
  }, [fetchLiveAttractions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchLiveAttractions(searchInput.trim());
    }
  };

  const handleDestinationClick = (dest) => {
    setSearchInput(dest);
    fetchLiveAttractions(dest);
  };

  // Derive categories for filtering
  const categories = ['All', ...new Set(attractions.map((a) => a.category).filter(Boolean))];

  // Filter attractions
  const displayedAttractions = attractions.filter((a) => {
    const matchCat = filterCategory === 'All' || a.category === filterCategory;
    const matchSearch = !poiFilter.trim() ||
      (a.name && a.name.toLowerCase().includes(poiFilter.toLowerCase())) ||
      (a.category && a.category.toLowerCase().includes(poiFilter.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="page-wrapper" style={{ padding: '40px 0 80px', background: 'var(--bg-main)', minHeight: '85vh' }}>
      <div className="container">
        {/* Page Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            <Compass size={16} />
            Live OpenStreetMap Attraction Explorer
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Explore Real-World Attractions
          </h1>

          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 28px' }}>
            Directly connected to the Flask backend and OpenStreetMap / Overpass API. Discover authentic points of interest, viewpoints, and cultural landmarks in real time.
          </p>

          {/* Search Input Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: '560px',
              margin: '0 auto 20px',
              display: 'flex',
              gap: '10px',
              position: 'relative'
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search destination (e.g., Ooty, Kodaikanal, Madurai)..."
                className="form-input"
                style={{
                  paddingLeft: '44px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                borderRadius: '12px',
                padding: '0 24px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Search size={16} />
              Search
            </button>
          </form>

          {/* Supported Featured Destination Chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '8px'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>
              Quick Select:
            </span>
            {FEATURED_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => handleDestinationClick(dest)}
                className={`btn btn-sm ${selectedDestination.toLowerCase() === dest.toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '9999px',
                  padding: '5px 14px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <MapPin size={13} />
                {dest}
              </button>
            ))}
          </div>
        </div>

        {/* Status Bar: Destination Info & Backend Timestamp */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              {selectedDestination}
            </span>
            <span className="badge badge-primary">
              {attractions.length} Live Attractions
            </span>
          </div>

          {/* Exact Last Updated Timestamp Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.86rem',
            color: '#64748b'
          }}>
            <Clock size={15} color="#0284c7" />
            <span>
              <strong>Data updated:</strong> {updatedAt || 'Checking...'}
            </span>
          </div>
        </div>

        {/* Main Content State Handling */}

        {/* 1. LOADING STATE */}
        {loading && (
          <div
            className="card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                border: '4px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 600 }}>
              Loading real-world attractions...
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px' }}>
              Querying OpenStreetMap Overpass servers for live geographic points of interest in {selectedDestination}.
            </p>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div
            className="card"
            style={{
              padding: '50px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              background: '#fff5f5',
              border: '1px solid #fed7d7',
              borderRadius: '16px'
            }}
          >
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '50%'
            }}>
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#991b1b', marginBottom: '6px', fontWeight: 700 }}>
                Unable to load live attraction data.
              </h3>
              <p style={{ color: '#7f1d1d', fontSize: '0.92rem', maxWidth: '450px', margin: '0 auto' }}>
                The Overpass mirror or Flask API could not complete the request. Please verify your backend server is running and try again.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchLiveAttractions(selectedDestination)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '10px', marginTop: '8px' }}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && attractions.length === 0 && (
          <div
            className="card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px'
            }}
          >
            <div style={{
              background: '#f1f5f9',
              color: '#64748b',
              padding: '14px',
              borderRadius: '50%'
            }}>
              <Compass size={36} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>
              No attractions found for this destination.
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '420px' }}>
              We could not find tourist or historic places in OpenStreetMap for "{selectedDestination}". Try searching for another city or select a featured location above.
            </p>
          </div>
        )}

        {/* 4. SUCCESS RESULTS STATE */}
        {!loading && !error && attractions.length > 0 && (
          <>
            {/* Category Filter & POI Search Filter */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '24px'
            }}>
              {/* Category Filter Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Filter size={15} /> Category:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: '8px', fontSize: '0.82rem' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Local Filter Within Current Results */}
              <div style={{ minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="Filter within results..."
                  value={poiFilter}
                  onChange={(e) => setPoiFilter(e.target.value)}
                  className="form-input"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    background: '#ffffff'
                  }}
                />
              </div>
            </div>

            {/* Grid of Real Attraction Cards */}
            <div className="grid-3" style={{ gap: '24px' }}>
              {displayedAttractions.map((attraction) => (
                <AttractionCard
                  key={attraction.id}
                  attraction={attraction}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Explore;
