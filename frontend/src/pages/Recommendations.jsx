import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, Calendar, DollarSign, ArrowRight,
  Filter, CheckCircle2, RotateCcw, AlertCircle,
  MapPin, Clock, Compass, Navigation, Layers, ChevronRight
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import AttractionCard from '../components/AttractionCard';
import WeatherCard from '../components/WeatherCard';
import MapView from '../components/MapView';

const Recommendations = () => {
  const navigate = useNavigate();
  const { tripPlan, toggleAttraction } = useTrip();

  const [filterCategory, setFilterCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'attractions', 'weather', 'itinerary', 'map', 'budget'

  const {
    destination = 'Ooty',
    destinationDetails = null,
    budget = 15000,
    days = 3,
    travelers = 2,
    interests = [],
    recommendations = [],
    selectedAttractions = [],
    itinerary = null,
    budgetSummary = null,
    weather = null
  } = tripPlan;

  const displayName = destinationDetails?.display_name || destination;

  // Filter recommendations by category
  const categories = ['All', ...new Set(recommendations.map((r) => r.category).filter(Boolean))];
  const filteredList = filterCategory === 'All'
    ? recommendations
    : recommendations.filter((r) => r.category === filterCategory);

  // Derive map points and polyline
  const mapAttractions = selectedAttractions.length > 0 ? selectedAttractions : recommendations.slice(0, 10);
  const routePolyline = mapAttractions
    .filter((a) => a.latitude && a.longitude)
    .map((a) => [a.latitude, a.longitude]);

  return (
    <div className="page-wrapper" style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="container">
        {/* Results Overview Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '32px',
          color: '#ffffff',
          marginBottom: '32px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '10px'
              }}>
                <Sparkles size={14} />
                Trip Plan Generated
              </div>

              {/* Exact format required:
                  Destination: Ooty, Tamil Nadu, India
                  Trip: 3 Days / 2 Travelers
                  Budget: ₹15,000
              */}
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Destination: {displayName}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '1.05rem', color: '#cbd5e1' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={18} color="#60a5fa" />
                  <strong>Trip:</strong> {days} {days === 1 ? 'Day' : 'Days'} / {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={18} color="#34d399" />
                  <strong>Budget:</strong> ₹{Number(budget).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/plan" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}>
                <RotateCcw size={16} />
                Plan Another
              </Link>
            </div>
          </div>

          {/* Quick Section Switcher */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'attractions', label: `Attractions (${recommendations.length})` },
              { id: 'weather', label: 'Live Weather' },
              { id: 'itinerary', label: `Itinerary (${itinerary?.days?.length || days} Days)` },
              { id: 'map', label: 'Route Map' },
              { id: 'budget', label: 'Budget Breakdown' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeTab === tab.id ? '#2563eb' : 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  transition: 'background 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. LIVE WEATHER SECTION */}
        {(activeTab === 'all' || activeTab === 'weather') && weather && (
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⛅</span> Weather Profile for {destination}
            </h2>
            <WeatherCard weather={weather} />
          </div>
        )}

        {/* 2. RECOMMENDED ATTRACTIONS SECTION */}
        {(activeTab === 'all' || activeTab === 'attractions') && (
          <div style={{ marginBottom: '44px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯</span> Recommended Real Attractions
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                  Ranked by AI using TF-IDF text similarity with your interests ({interests.join(', ') || 'General'}), rating, budget suitability, and real weather.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Category:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: '8px', fontSize: '0.8rem', padding: '4px 10px' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredList.length === 0 ? (
              <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Attractions Found for "{filterCategory}"</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Try switching back to "All" category to view all {recommendations.length} recommended locations.
                </p>
              </div>
            ) : (
              <div className="grid-3" style={{ gap: '20px' }}>
                {filteredList.map((attraction) => {
                  const isSelected = selectedAttractions.some((a) => a.id === attraction.id);
                  return (
                    <AttractionCard
                      key={attraction.id}
                      attraction={attraction}
                      isSelected={isSelected}
                      onToggleSelect={toggleAttraction}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. DAY-BY-DAY ITINERARY SECTION */}
        {(activeTab === 'all' || activeTab === 'itinerary') && (
          <div style={{ marginBottom: '44px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📅</span> Day-by-Day Itinerary
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Structured schedule optimizing travel time between real attractions in {destination}.
            </p>

            {itinerary?.days && itinerary.days.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {itinerary.days.map((dayItem) => (
                  <div
                    key={dayItem.day}
                    className="card"
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          padding: '4px 12px',
                          borderRadius: '8px'
                        }}>
                          Day {dayItem.day}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {dayItem.theme || `Exploring ${destination}`}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {dayItem.activities?.length || 0} activities scheduled
                      </span>
                    </div>

                    {/* Activities Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(dayItem.activities || []).map((act, actIdx) => (
                        <div
                          key={actIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '14px',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #edf2f7'
                          }}
                        >
                          <div style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            {act.time_slot || `${9 + actIdx * 3}:00`}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                              {act.title || act.name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                              {act.description || `${act.category || 'Sightseeing'} • Est. ${act.duration || 2} hours`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                <p style={{ color: '#64748b' }}>Itinerary timeline is ready for custom scheduling.</p>
                <Link to="/itinerary" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
                  View Full Itinerary Workspace
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 4. ROUTE MAP SECTION */}
        {(activeTab === 'all' || activeTab === 'map') && (
          <div style={{ marginBottom: '44px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗺️</span> Route Map & Geographic Layout
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              OpenStreetMap visual layout of real attraction coordinates in {destination}.
            </p>

            <div className="card" style={{ padding: '0', overflow: 'hidden', height: '420px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <MapView
                attractions={mapAttractions}
                polyline={routePolyline}
              />
            </div>
          </div>
        )}

        {/* 5. BUDGET BREAKDOWN SECTION */}
        {(activeTab === 'all' || activeTab === 'budget') && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💰</span> Budget Breakdown
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Transparent breakdown calculated for {travelers} travelers over {days} days against your ₹{Number(budget).toLocaleString()} target.
            </p>

            {budgetSummary ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', textAlign: 'center', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>🏨 Accommodation</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    ₹{Number(budgetSummary.hotel_cost || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Hotel stays</div>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>🍽️ Food & Meals</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    ₹{Number(budgetSummary.food_cost || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Daily dining</div>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>🚕 Local Transport</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    ₹{Number(budgetSummary.transport_cost || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Transit & rides</div>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>🎟️ Sightseeing Tickets</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    ₹{Number(budgetSummary.attraction_cost || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Attraction entry</div>
                </div>

                <div className="card" style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderRadius: '14px',
                  background: budgetSummary.is_within_budget ? '#f0fdf4' : '#fef2f2',
                  border: budgetSummary.is_within_budget ? '1px solid #bbf7d0' : '1px solid #fecaca'
                }}>
                  <div style={{ fontSize: '0.8rem', color: budgetSummary.is_within_budget ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                    {budgetSummary.is_within_budget ? '✓ Within Budget' : '⚠️ Exceeds Target'}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    ₹{Number(budgetSummary.total_estimated_cost || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Target: ₹{Number(budget).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                <p style={{ color: '#64748b' }}>Estimated trip budget: ₹{Number(budget).toLocaleString()}</p>
                <Link to="/budget" className="btn btn-outline btn-sm" style={{ marginTop: '10px' }}>
                  Open Detailed Budget Simulator
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
