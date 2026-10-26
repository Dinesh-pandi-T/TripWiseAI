import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, DollarSign, Route,
  Trash2, RefreshCw, BookmarkCheck, ArrowRight,
  Utensils, Hotel, Sparkles, Check
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import MapView from '../components/MapView';
import { generateItinerary, calculateBudget, saveItinerary } from '../services/api';

const Itinerary = () => {
  const navigate = useNavigate();
  const { tripPlan, updateTripPlan } = useTrip();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const {
    destination,
    budget,
    days,
    travelers,
    selectedAttractions = [],
    itinerary,
    weather
  } = tripPlan;

  // Auto-generate itinerary if not already generated
  useEffect(() => {
    if (!itinerary && selectedAttractions.length > 0) {
      handleRegenerate();
    }
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const [itinResult, budgetResult] = await Promise.all([
        generateItinerary({
          destination,
          attractions: selectedAttractions,
          days,
          available_hours_per_day: 9.0
        }),
        calculateBudget({
          destination,
          budget,
          days,
          travelers,
          selected_attractions: selectedAttractions
        })
      ]);

      updateTripPlan({
        itinerary: itinResult,
        budgetSummary: budgetResult
      });
    } catch (err) {
      console.error('Failed to regenerate itinerary:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRemoveAttraction = (attractionId) => {
    const updatedAttractions = selectedAttractions.filter((a) => a.id !== attractionId);
    updateTripPlan({ selectedAttractions: updatedAttractions });

    // Re-run itinerary with updated attractions
    generateItinerary({
      destination,
      attractions: updatedAttractions,
      days,
      available_hours_per_day: 9.0
    }).then((newItin) => {
      updateTripPlan({ itinerary: newItin });
    });
  };

  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      await saveItinerary({
        title: `${destination} ${days}-Day Vacation Plan`,
        destination,
        budget,
        travelers,
        days,
        interests: tripPlan.interests,
        itinerary_data: itinerary,
        total_cost: tripPlan.budgetSummary?.total_estimated_cost || 0
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving itinerary to SQLite:', err);
      alert('Failed to save itinerary to database.');
    } finally {
      setSaving(false);
    }
  };

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="page-wrapper" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <Calendar size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>No Itinerary Generated Yet</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Please select attractions from the recommendation list to construct your day-by-day itinerary.
          </p>
          <Link to="/recommendations" className="btn btn-primary">
            View Recommendations
          </Link>
        </div>
      </div>
    );
  }

  const currentDay = itinerary.days[activeDayIndex] || itinerary.days[0];

  // Extract restaurants and attractions for MapView
  const mapAttractions = currentDay.attractions || [];
  const mapRestaurants = currentDay.slots
    .filter((s) => s.type === 'restaurant' && s.latitude)
    .map((s) => ({ name: s.title, cuisine: s.details, rating: s.rating, latitude: s.latitude, longitude: s.longitude }));

  return (
    <div className="page-wrapper" style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="container">
        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-primary">
                Smart Day-by-Day Itinerary
              </span>
              <span className="badge badge-success">
                {itinerary.total_travel_distance_km} km Total Travel
              </span>
              <span className="badge badge-purple">
                ~{itinerary.total_travel_time_mins} mins Transit Time
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', color: '#0f172a' }}>
              {destination} Travel Schedule
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '4px' }}>
              Timed slots optimized for travel efficiency, dining comfort, and attraction duration.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="btn btn-outline btn-sm"
              title="Re-optimize order and timetable"
            >
              <RefreshCw size={15} className={regenerating ? 'animate-spin' : ''} />
              Regenerate
            </button>

            <button
              onClick={handleSaveToDatabase}
              disabled={saving}
              className="btn btn-outline btn-sm"
              style={{
                borderColor: saveSuccess ? '#10b981' : 'var(--border)',
                color: saveSuccess ? '#10b981' : 'inherit'
              }}
            >
              {saveSuccess ? (
                <>
                  <Check size={16} /> Saved to Database!
                </>
              ) : (
                <>
                  <BookmarkCheck size={16} /> Save Itinerary
                </>
              )}
            </button>

            <Link to="/budget" className="btn btn-primary btn-sm">
              <DollarSign size={16} />
              View Budget Breakdown
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Day Selection Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '6px'
        }}>
          {itinerary.days.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDayIndex(idx)}
              className={`btn ${activeDayIndex === idx ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.95rem' }}
            >
              <Calendar size={16} />
              Day {d.day}
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                ({d.attractions?.length || 0} spots • {d.day_distance_km}km)
              </span>
            </button>
          ))}
        </div>

        {/* Main Content Layout: Timeline on Left, Map on Right */}
        <div className="grid-2" style={{ alignItems: 'start', gap: '30px' }}>
          {/* Day Timeline Column */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#0f172a' }}>
                  {currentDay.date_label} Timetable
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  Transit: ~{currentDay.day_travel_time_mins} mins • Distance: {currentDay.day_distance_km} km
                </div>
              </div>

              <span className="badge badge-primary">
                {currentDay.slots?.length || 0} Scheduled Stops
              </span>
            </div>

            {/* Timeline Item List */}
            <div className="timeline">
              {currentDay.slots && currentDay.slots.map((slot, sIdx) => {
                let iconColor = '#2563eb';
                let IconComponent = Clock;
                let bgBadge = '#eff6ff';

                if (slot.type === 'restaurant') {
                  iconColor = '#10b981';
                  IconComponent = Utensils;
                  bgBadge = '#ecfdf5';
                } else if (slot.type === 'hotel') {
                  iconColor = '#f59e0b';
                  IconComponent = Hotel;
                  bgBadge = '#fffbeb';
                }

                return (
                  <div key={sIdx} className="timeline-item">
                    <div className="timeline-dot" style={{ borderColor: iconColor }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: iconColor }} />
                    </div>

                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: bgBadge,
                            color: iconColor,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            marginBottom: '6px'
                          }}>
                            <Clock size={12} />
                            {slot.time}
                          </div>

                          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '4px' }}>
                            {slot.title}
                          </h4>

                          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
                            {slot.details}
                          </p>
                        </div>

                        {/* Slot Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {slot.type === 'attraction' && (
                            <button
                              onClick={() => handleRemoveAttraction(slot.attraction_id)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#ef4444', padding: '4px 8px' }}
                              title="Remove from itinerary"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Extra Meta for Attraction */}
                      {slot.type === 'attraction' && (
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          marginTop: '10px',
                          paddingTop: '8px',
                          borderTop: '1px solid #f1f5f9',
                          fontSize: '0.78rem',
                          color: '#475569'
                        }}>
                          <span>Category: <strong>{slot.category}</strong></span>
                          <span>Rating: <strong>{slot.rating} ★</strong></span>
                          <span>Entry: <strong>{slot.price === 0 ? 'Free' : `₹${slot.price}`}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Map Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Route size={20} color="var(--primary)" />
                  Day {currentDay.day} Route Visualization
                </h3>
                <span className="badge badge-primary">
                  Leaflet Map
                </span>
              </div>

              {/* Map Component */}
              <MapView
                attractions={mapAttractions}
                hotel={itinerary.hotel}
                restaurants={mapRestaurants}
                polyline={currentDay.route_polyline || []}
              />
            </div>

            {/* Hotel Summary Card */}
            {itinerary.hotel && (
              <div className="card" style={{ padding: '20px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: '#f59e0b',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '10px'
                  }}>
                    <Hotel size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
                      RECOMMENDED BASE HOTEL
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#78350f' }}>
                      {itinerary.hotel.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#92400e', marginTop: '2px' }}>
                      ₹{itinerary.hotel.price_per_night} / night • Rating: {itinerary.hotel.rating} ★
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
