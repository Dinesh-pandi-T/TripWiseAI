import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Users, DollarSign,
  Sparkles, Check, AlertCircle, CheckCircle2,
  Loader2, ArrowRight
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import {
  resolveDestination,
  autocompleteDestinations,
  getRecommendations,
  getWeather,
  generateItinerary,
  calculateBudget
} from '../services/api';

const interestOptions = [
  { name: 'Nature', emoji: '🌿' },
  { name: 'Adventure', emoji: '🧗‍♂️' },
  { name: 'Beach', emoji: '🏖️' },
  { name: 'Historical', emoji: '🏛️' },
  { name: 'Culture', emoji: '🎭' },
  { name: 'Food', emoji: '🍜' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Wildlife', emoji: '🐅' },
  { name: 'Photography', emoji: '📸' },
  { name: 'Temple', emoji: '🛕' },
  { name: 'Museum', emoji: '🏺' },
  { name: 'Nightlife', emoji: '🌃' },
];

const PLANNING_STAGES = [
  { key: 'resolve', label: 'Finding destination...' },
  { key: 'attractions', label: 'Fetching real attractions...' },
  { key: 'weather', label: 'Checking weather...' },
  { key: 'recommendations', label: 'Generating recommendations...' },
  { key: 'itinerary', label: 'Building itinerary...' },
  { key: 'route', label: 'Calculating route...' },
  { key: 'budget', label: 'Calculating budget...' },
];

const PlanTrip = () => {
  const navigate = useNavigate();
  const { tripPlan, updateTripPlan } = useTrip();

  const [destinationInput, setDestinationInput] = useState(tripPlan.destination || '');
  const [selectedDestinationMeta, setSelectedDestinationMeta] = useState(tripPlan.destinationDetails || null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  const [budget, setBudget] = useState(tripPlan.budget || 15000);
  const [travelers, setTravelers] = useState(tripPlan.travelers || 2);
  const [days, setDays] = useState(tripPlan.days || 3);
  const [selectedInterests, setSelectedInterests] = useState(
    tripPlan.interests || ['Nature', 'Adventure', 'Photography']
  );

  const [loading, setLoading] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [error, setError] = useState(null);

  const autocompleteTimeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete search
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestinationInput(value);
    setSelectedDestinationMeta(null);
    setError(null);

    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingSuggestions(true);
    autocompleteTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await autocompleteDestinations(value.trim());
        setSuggestions(results || []);
        setShowSuggestions((results || []).length > 0);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (item) => {
    setDestinationInput(item.name);
    setSelectedDestinationMeta(item);
    setShowSuggestions(false);
  };

  const toggleInterest = (interestName) => {
    if (selectedInterests.includes(interestName)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interestName));
      }
    } else {
      setSelectedInterests([...selectedInterests, interestName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate destination
    if (!destinationInput || !destinationInput.trim()) {
      setError('Please enter a destination.');
      return;
    }

    // 2. Validate budget
    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 1000) {
      setError('Please enter a valid budget of at least ₹1,000.');
      return;
    }

    // 3. Validate travelers
    const numTravelers = Number(travelers);
    if (isNaN(numTravelers) || numTravelers < 1) {
      setError('Please enter at least 1 traveler.');
      return;
    }

    // 4. Validate days
    const numDays = Number(days);
    if (isNaN(numDays) || numDays < 1) {
      setError('Please enter at least 1 day.');
      return;
    }

    // 5. Validate interests
    if (selectedInterests.length === 0) {
      setError('Please select at least one travel interest.');
      return;
    }

    setError(null);
    setLoading(true);
    setCurrentStageIdx(0); // Stage 0: Finding destination...

    try {
      // Stage 1: Resolve destination dynamically via Geocoding
      let destMeta = selectedDestinationMeta;
      try {
        const resolveRes = await resolveDestination(destinationInput.trim());
        if (resolveRes && resolveRes.resolved && resolveRes.destination) {
          destMeta = resolveRes.destination;
        } else {
          throw new Error('Destination not found.');
        }
      } catch (err) {
        setLoading(false);
        setError('Destination not found. Please enter a valid city or destination.');
        return;
      }

      const targetDestinationName = destMeta.name || destinationInput.trim();

      // Stage 2: Fetching real attractions & checking weather
      setCurrentStageIdx(1); // Fetching real attractions...
      await new Promise((r) => setTimeout(r, 400));

      setCurrentStageIdx(2); // Checking weather...
      const weatherData = await getWeather(targetDestinationName).catch(() => null);

      // Stage 3 & 4: Generating recommendations
      setCurrentStageIdx(3); // Generating recommendations...
      const recPayload = {
        destination: targetDestinationName,
        budget: numBudget,
        days: numDays,
        travelers: numTravelers,
        interests: selectedInterests,
      };
      const recData = await getRecommendations(recPayload);
      const recommendedList = recData.recommended_attractions || [];
      const topSelected = recommendedList.slice(0, Math.min(8, numDays * 3));

      // Stage 5 & 6: Building itinerary & calculating route
      setCurrentStageIdx(4); // Building itinerary...
      await new Promise((r) => setTimeout(r, 350));
      setCurrentStageIdx(5); // Calculating route...
      const itinResult = await generateItinerary({
        destination: targetDestinationName,
        attractions: topSelected,
        days: numDays,
        available_hours_per_day: 9.0
      }).catch(() => ({ days: [], total_attractions: topSelected.length }));

      // Stage 7: Calculating budget
      setCurrentStageIdx(6); // Calculating budget...
      const budgetResult = await calculateBudget({
        destination: targetDestinationName,
        budget: numBudget,
        days: numDays,
        travelers: numTravelers,
        selected_attractions: topSelected
      }).catch(() => null);

      await new Promise((r) => setTimeout(r, 350));

      // Save complete plan to context
      updateTripPlan({
        destination: targetDestinationName,
        destinationDetails: destMeta,
        budget: numBudget,
        days: numDays,
        travelers: numTravelers,
        interests: selectedInterests,
        recommendations: recommendedList,
        selectedAttractions: topSelected,
        itinerary: itinResult,
        budgetSummary: budgetResult,
        weather: weatherData || recData.weather,
      });

      // Redirect to results page
      navigate('/recommendations');
    } catch (err) {
      console.error('Trip planning workflow error:', err);
      setError('Unable to complete trip planning. Please check backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
            Interactive AI Planner
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Plan Your Perfect Trip
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto' }}>
            Enter any city or destination worldwide. Our AI will dynamically geocode your location, fetch real-world attractions, check live weather, and design your trip.
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '36px', boxShadow: 'var(--shadow-lg)', borderRadius: '20px' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.92rem',
              border: '1px solid #fecaca'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. Dynamic Free-Text Destination Input */}
            <div className="form-group" ref={wrapperRef} style={{ position: 'relative', marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                Where do you want to go?
              </label>

              <div style={{ position: 'relative' }}>
                <Search
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter a city or destination (e.g. Ooty, Yercaud, Kodaikanal, Munnar)..."
                  value={destinationInput}
                  onChange={handleDestinationChange}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  autoComplete="off"
                  required
                  style={{
                    paddingLeft: '44px',
                    paddingRight: isSearchingSuggestions ? '44px' : '16px',
                    height: '52px',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                />
                {isSearchingSuggestions && (
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                    <Loader2 size={16} className="animate-spin" color="#2563eb" />
                  </div>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  marginTop: '6px',
                  overflow: 'hidden'
                }}>
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(s)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <MapPin size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{s.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {s.display_name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Budget Input */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                  Budget
                </label>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Budget will be estimated based on your selected trip.
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="1000"
                  max="500000"
                  step="500"
                  className="form-input"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  style={{ paddingLeft: '34px', height: '48px', fontSize: '0.95rem', borderRadius: '10px' }}
                />
              </div>
            </div>

            {/* 3. Travelers & Duration Row */}
            <div className="grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                  Travelers
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="form-input"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  required
                  style={{ height: '48px', borderRadius: '10px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#1e293b' }}>
                  Trip Duration
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    className="form-input"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    required
                    style={{ height: '48px', borderRadius: '10px' }}
                  />
                  <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.85rem' }}>
                    {days === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Travel Interests Multi-Select */}
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label" style={{ marginBottom: '12px', fontWeight: 700, color: '#1e293b' }}>
                What are you interested in?
              </label>

              <div className="pill-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {interestOptions.map((item) => {
                  const active = selectedInterests.includes(item.name);
                  return (
                    <div
                      key={item.name}
                      onClick={() => toggleInterest(item.name)}
                      className={`pill-item ${active ? 'active' : ''}`}
                      style={{
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        border: active ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        background: active ? '#eff6ff' : '#ffffff',
                        color: active ? '#1d4ed8' : '#334155',
                        fontWeight: active ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.88rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                      {active && <Check size={14} color="#2563eb" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '12px',
                fontSize: '1.05rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} />
              PLAN MY TRIP
            </button>
          </form>
        </div>
      </div>

      {/* Multi-Stage Interactive Planning Progress Modal */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            borderRadius: '20px',
            background: '#ffffff',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: '#eff6ff',
                color: '#2563eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                Crafting Your Trip to {destinationInput}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                Connecting to live APIs & machine learning models
              </p>
            </div>

            {/* Progress Checklist Stages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {PLANNING_STAGES.map((stage, idx) => {
                const isDone = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div
                    key={stage.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isCurrent ? '#f0fdf4' : (isDone ? '#f8fafc' : 'transparent'),
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} color="#16a34a" />
                    ) : isCurrent ? (
                      <Loader2 size={18} className="animate-spin" color="#2563eb" />
                    ) : (
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                    )}
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isDone ? '#15803d' : (isCurrent ? '#1d4ed8' : '#94a3b8')
                    }}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
              Please wait while live OpenStreetMap & Open-Meteo data is synchronized...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanTrip;
