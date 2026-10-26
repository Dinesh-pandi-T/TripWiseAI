import React from 'react';
import { Sun, CloudRain, Cloud, Wind, Droplets, Compass } from 'lucide-react';

const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  const isRain = weather.preference === 'indoor' || (weather.condition && weather.condition.toLowerCase().includes('rain'));

  return (
    <div className="card" style={{
      padding: '24px',
      background: isRain
        ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
        : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: isRain ? '1px solid #bfdbfe' : '1px solid #fde68a',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        {/* Main Weather Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: isRain ? '#3b82f6' : '#f59e0b',
            color: '#fff',
            borderRadius: '14px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isRain ? <CloudRain size={28} /> : <Sun size={28} />}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>
              Destination Live Weather • {weather.destination}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                {weather.temperature}°C
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>
                {weather.condition}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Atmospheric Metrics */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#475569' }}>
            <Droplets size={16} color="#3b82f6" />
            <span>Humidity: <strong>{weather.humidity}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#475569' }}>
            <Wind size={16} color="#06b6d4" />
            <span>Wind: <strong>{weather.wind_speed} km/h</strong></span>
          </div>
        </div>
      </div>

      {/* AI Weather-Recommendation Hint */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(4px)',
        borderRadius: '10px',
        fontSize: '0.88rem',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontWeight: 700, color: isRain ? '#2563eb' : '#d97706' }}>
          💡 AI Travel Insight:
        </span>
        <span>{weather.recommendation_hint}</span>
      </div>

      {/* Multi-Day Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {weather.forecast.map((f, i) => (
            <div key={i} style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '8px',
              padding: '8px 14px',
              minWidth: '100px',
              textAlign: 'center',
              fontSize: '0.8rem'
            }}>
              <div style={{ color: '#64748b', fontWeight: 500 }}>{f.date}</div>
              <div style={{ fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{f.max_temp}° / {f.min_temp}°</div>
              <div style={{ color: '#475569', fontSize: '0.75rem' }}>{f.condition}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
