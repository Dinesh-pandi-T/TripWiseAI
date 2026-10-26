import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, Sparkles, MapPin, Calendar, DollarSign,
  CloudSun, Route, BarChart3, ArrowRight, Star
} from 'lucide-react';
import { fetchDestinations } from '../services/api';

const featureList = [
  {
    icon: Sparkles,
    color: '#3b82f6',
    title: 'Personalized Recommendations',
    desc: 'Content-based filtering using TF-IDF vectorization and multi-factor weighted scoring tailored to your exact travel interests.'
  },
  {
    icon: Calendar,
    color: '#8b5cf6',
    title: 'Smart Itinerary',
    desc: 'Automated daily schedule allocating balanced sightseeing hours, meal stops at top restaurants, and evening hotel rest.'
  },
  {
    icon: DollarSign,
    color: '#10b981',
    title: 'Budget Planning',
    desc: 'Itemized expense breakdown for accommodation, dining, transit, and entry passes with smart cost-saving suggestions.'
  },
  {
    icon: CloudSun,
    color: '#f59e0b',
    title: 'Weather Insights',
    desc: 'Live Open-Meteo weather intelligence that dynamically promotes indoor attractions during rainfall and outdoor sights in clear skies.'
  },
  {
    icon: Route,
    color: '#06b6d4',
    title: 'Route Optimization',
    desc: 'Haversine distance calculation and Nearest-Neighbor algorithm to minimize transit time between attractions.'
  },
  {
    icon: BarChart3,
    color: '#ec4899',
    title: 'Travel Analytics',
    desc: 'Interactive Data Science dashboard displaying popularity rankings, price distributions, and category analytics with Recharts.'
  }
];

const Home = () => {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    fetchDestinations()
      .then((data) => setDestinations(data.slice(0, 4)))
      .catch((err) => console.error('Failed to load destinations:', err));
  }, []);

  return (
    <div>
      <section className="hero-gradient">
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="badge badge-primary" style={{ marginBottom: '20px', background: 'rgba(255, 255, 255, 0.15)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            ✨ AI & Data Science College Project
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#ffffff', marginBottom: '20px', letterSpacing: '-1px' }}>
            Plan Smarter. Travel Better.
          </h1>

          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', maxWidth: '720px', margin: '0 auto 36px', lineHeight: '1.7' }}>
            Harness the power of machine learning and intelligent algorithms to curate personalized itineraries, optimize travel routes, adapt to real-time weather, and manage your budget effortlessly.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/plan" className="btn btn-primary btn-lg" style={{ background: '#ffffff', color: '#1e3a8a', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
              <Sparkles size={18} color="#2563eb" />
              Plan My Trip
            </Link>
            <Link to="/explore" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>
              <Compass size={18} />
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0 60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '10px' }}>Core Capabilities</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '14px' }}>Engineered for Intelligent Exploration</h2>
            <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
              Combining content-based filtering, geospatial algorithms, and statistical analysis into a unified travel platform.
            </p>
          </div>

          <div className="grid-3">
            {featureList.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="card" style={{ padding: '32px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: `${feat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <Icon size={26} color={feat.color} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{feat.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0 80px', background: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '8px' }}>Popular Getaways</span>
              <h2 style={{ fontSize: '2rem' }}>Featured Destinations</h2>
            </div>
            <Link to="/explore" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              View All 8 Destinations <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-4">
            {destinations.map((dest) => (
              <div key={dest.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={dest.image_url}
                    alt={dest.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    Avg ₹{dest.avg_daily_budget}/day
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <MapPin size={14} color="#2563eb" />
                    <span>{dest.state}, {dest.country}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{dest.name}</h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {dest.description}
                  </p>
                  <Link
                    to="/plan"
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    Plan Trip Here
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '60px 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div className="card" style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            padding: '50px 40px',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '14px' }}>
              Ready to Design Your Personalized Itinerary?
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#dbeafe', maxWidth: '640px', margin: '0 auto 28px' }}>
              Input your destination, duration, budget, and travel preferences to generate ML-ranked attractions and optimal schedules.
            </p>
            <Link to="/plan" className="btn btn-primary btn-lg" style={{ background: '#ffffff', color: '#1e40af' }}>
              <Sparkles size={18} />
              Launch Trip Planner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
