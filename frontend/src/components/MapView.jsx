import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom DivIcons for crisp SVG pins
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        border: 2px solid #ffffff;
      ">
        <span style="
          transform: rotate(45deg);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          font-family: sans-serif;
        ">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to dynamically fit map bounds when points change
const MapBoundsAdjuster = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
};

const MapView = ({ attractions = [], hotel = null, restaurants = [], polyline = [] }) => {
  // Default coordinates fallback (Ooty)
  const defaultCenter = attractions.length > 0
    ? [attractions[0].latitude, attractions[0].longitude]
    : [11.4102, 76.6950];

  const allPoints = [];
  attractions.forEach((a) => {
    if (a.latitude && a.longitude) allPoints.push([a.latitude, a.longitude]);
  });
  if (hotel && hotel.latitude && hotel.longitude) {
    allPoints.push([hotel.latitude, hotel.longitude]);
  }
  restaurants.forEach((r) => {
    if (r.latitude && r.longitude) allPoints.push([r.latitude, r.longitude]);
  });

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {allPoints.length > 0 && <MapBoundsAdjuster points={allPoints} />}

        {/* Route Polyline */}
        {polyline && polyline.length > 1 && (
          <Polyline
            positions={polyline}
            pathOptions={{
              color: '#2563eb',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8'
            }}
          />
        )}

        {/* Attraction Markers */}
        {attractions.map((att, idx) => {
          if (!att.latitude || !att.longitude) return null;
          return (
            <Marker
              key={`att-${att.id || idx}`}
              position={[att.latitude, att.longitude]}
              icon={createCustomIcon('#2563eb', `${idx + 1}`)}
            >
              <Popup>
                <div style={{ padding: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{att.name || att.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
                    {att.category} • Rating: {att.rating} ★
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                    {att.price === 0 ? 'Free Entry' : `Ticket: ₹${att.price}`}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Hotel Marker */}
        {hotel && hotel.latitude && hotel.longitude && (
          <Marker
            position={[hotel.latitude, hotel.longitude]}
            icon={createCustomIcon('#f59e0b', '🏨')}
          >
            <Popup>
              <div style={{ padding: '4px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{hotel.name}</strong>
                <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
                  Hotel Stay • Rating: {hotel.rating} ★
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>
                  ₹{hotel.price_per_night} / night
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Restaurant Markers */}
        {restaurants.map((rest, idx) => {
          if (!rest.latitude || !rest.longitude) return null;
          return (
            <Marker
              key={`rest-${rest.id || idx}`}
              position={[rest.latitude, rest.longitude]}
              icon={createCustomIcon('#10b981', '🍽️')}
            >
              <Popup>
                <div style={{ padding: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{rest.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
                    {rest.cuisine} • Rating: {rest.rating} ★
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                    Avg Cost: ₹{rest.average_cost}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 14px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        fontSize: '0.78rem',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />
          <span>Attractions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>Hotel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          <span>Restaurants</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
