import React, { useState } from 'react';
import {
  MapPin, Clock, Globe, Tag, ExternalLink,
  Plus, Check, Sparkles, Navigation, Info
} from 'lucide-react';

const categoryColors = {
  Attraction: 'badge-primary',
  Viewpoint: 'badge-success',
  Museum: 'badge-purple',
  ThemePark: 'badge-warning',
  Zoo: 'badge-success',
  Artwork: 'badge-purple',
  Monument: 'badge-warning',
  Memorial: 'badge-purple',
  Castle: 'badge-warning',
  Heritage: 'badge-primary',
  Nature: 'badge-success',
  Adventure: 'badge-warning',
};

const AttractionCard = ({ attraction, isSelected, onToggleSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!attraction) return null;

  const name = attraction.name || 'Not available';
  const category = attraction.category || 'Not available';
  const latitude = attraction.latitude != null ? attraction.latitude : 'Not available';
  const longitude = attraction.longitude != null ? attraction.longitude : 'Not available';
  const address = attraction.address || 'Not available';
  const openingHours = attraction.opening_hours || attraction.openingHours || 'Not available';
  
  let fee = 'Not available';
  if (attraction.fee != null && attraction.fee !== '') {
    fee = attraction.fee;
  } else if (attraction.price != null) {
    fee = attraction.price === 0 ? 'Free' : `₹${attraction.price}`;
  }

  const website = attraction.website || null;
  const source = attraction.source || 'OpenStreetMap';

  const badgeClass = categoryColors[category.replace(/\s+/g, '')] || 'badge-primary';

  return (
    <div
      className={`card ${isSelected ? 'selected-card' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.25s ease'
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span className={`badge ${badgeClass}`} style={{ fontWeight: 600 }}>
          {category}
        </span>

        <span
          style={{
            fontSize: '0.75rem',
            color: '#0284c7',
            background: '#e0f2fe',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontWeight: 700,
            letterSpacing: '0.3px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          Source: {source}
        </span>
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '12px',
            lineHeight: 1.35
          }}
        >
          {name}
        </h3>

        {attraction.description && (
          <p
            style={{
              fontSize: '0.88rem',
              color: '#64748b',
              marginBottom: '14px',
              lineHeight: 1.5
            }}
          >
            {attraction.description}
          </p>
        )}

        {attraction.recommendation_score != null && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Algorithm Match</span>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>{attraction.recommendation_score}%</span>
            </div>
            <div className="score-bar-bg">
              <div
                className="score-bar-fill"
                style={{ width: `${Math.min(100, Math.max(10, attraction.recommendation_score))}%` }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid #edf2f7',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.84rem',
            color: '#334155',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Navigation size={15} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ wordBreak: 'break-word' }}>
              <strong style={{ color: '#475569' }}>Coordinates:</strong>{' '}
              {latitude !== 'Not available' && longitude !== 'Not available' ? (
                <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>
                  {typeof latitude === 'number' ? latitude.toFixed(6) : latitude},{' '}
                  {typeof longitude === 'number' ? longitude.toFixed(6) : longitude}
                </span>
              ) : (
                <span style={{ color: '#94a3b8' }}>Not available</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <MapPin size={15} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ wordBreak: 'break-word' }}>
              <strong style={{ color: '#475569' }}>Address:</strong>{' '}
              <span style={{ color: address === 'Not available' ? '#94a3b8' : '#0f172a' }}>
                {address}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Clock size={15} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#475569' }}>Opening Hours:</strong>{' '}
              <span style={{ color: openingHours === 'Not available' ? '#94a3b8' : '#0f172a' }}>
                {openingHours}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Tag size={15} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#475569' }}>Fee:</strong>{' '}
              <span style={{ color: fee === 'Not available' ? '#94a3b8' : '#10b981', fontWeight: fee === 'Not available' ? 400 : 600 }}>
                {fee}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Globe size={15} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ wordBreak: 'break-all' }}>
              <strong style={{ color: '#475569' }}>Website:</strong>{' '}
              {website ? (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#2563eb',
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  {website}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span style={{ color: '#94a3b8' }}>Not available</span>
              )}
            </div>
          </div>
        </div>

        {onToggleSelect && (
          <button
            type="button"
            onClick={() => onToggleSelect(attraction)}
            className={`btn ${isSelected ? 'btn-outline' : 'btn-primary'}`}
            style={{ width: '100%', marginTop: 'auto', padding: '10px 16px' }}
          >
            {isSelected ? (
              <>
                <Check size={16} color="var(--primary)" />
                Selected in Itinerary
              </>
            ) : (
              <>
                <Plus size={16} />
                Add to Itinerary
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AttractionCard;
