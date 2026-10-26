import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, PieChart as PieChartIcon, AlertTriangle, CheckCircle2,
  TrendingDown, Hotel, Utensils, Car, Ticket, ShieldAlert,
  ArrowRight, RefreshCw, Sparkles
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTrip } from '../context/TripContext';
import { calculateBudget, fetchHotels } from '../services/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const Budget = () => {
  const { tripPlan, updateTripPlan } = useTrip();

  const {
    destination,
    budget,
    days,
    travelers,
    selectedAttractions = [],
    budgetSummary
  } = tripPlan;

  const [currentBudget, setCurrentBudget] = useState(budgetSummary);
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedTransport, setSelectedTransport] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load destination hotels for alternative selection
    fetchHotels(destination)
      .then((data) => setHotels(data))
      .catch((err) => console.error('Error fetching hotels:', err));

    if (!budgetSummary) {
      loadBudgetData();
    } else {
      setCurrentBudget(budgetSummary);
    }
  }, [destination]);

  const loadBudgetData = async (overrideHotel = null, overrideTrans = null) => {
    setLoading(true);
    try {
      const res = await calculateBudget({
        destination,
        budget,
        days,
        travelers,
        selected_attractions: selectedAttractions,
        hotel_id: overrideHotel || selectedHotelId || null,
        transport_type: overrideTrans || selectedTransport || null
      });
      setCurrentBudget(res);
      updateTripPlan({ budgetSummary: res });
    } catch (err) {
      console.error('Failed to calculate budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelChange = (e) => {
    const val = e.target.value;
    setSelectedHotelId(val);
    loadBudgetData(val, selectedTransport);
  };

  const handleTransportChange = (e) => {
    const val = e.target.value;
    setSelectedTransport(val);
    loadBudgetData(selectedHotelId, val);
  };

  if (!currentBudget) {
    return (
      <div className="page-wrapper" style={{ padding: '80px 0', textAlign: 'center' }}>
        <RefreshCw size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 16px' }} />
        <p>Calculating itemized travel budget...</p>
      </div>
    );
  }

  // Format data for Recharts
  const pieData = (currentBudget.breakdown || []).map((item) => ({
    name: item.category,
    value: item.cost,
    percentage: item.percentage
  }));

  const budgetUsedPct = Math.min(100, Math.round((currentBudget.total_estimated_cost / currentBudget.user_budget) * 100));

  return (
    <div className="page-wrapper" style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="container">
        {/* Header */}
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
                Financial Planning & Optimization
              </span>
              <span className={`badge ${currentBudget.remaining_budget >= 0 ? 'badge-success' : 'badge-danger'}`}>
                {currentBudget.budget_status}
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', color: '#0f172a' }}>
              Trip Budget Estimation
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '4px' }}>
              Itemized estimates for {destination} covering {days} days and {travelers} travelers.
            </p>
          </div>

          <Link to="/itinerary" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Back to Itinerary
          </Link>
        </div>

        {/* Overrun Warning Banner */}
        {currentBudget.warning && (
          <div style={{
            background: currentBudget.remaining_budget < 0 ? '#fef2f2' : '#fffbeb',
            border: currentBudget.remaining_budget < 0 ? '1px solid #fecaca' : '1px solid #fde68a',
            color: currentBudget.remaining_budget < 0 ? '#991b1b' : '#92400e',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={24} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.95rem' }}>Budget Alert:</strong> {currentBudget.warning}
            </div>
          </div>
        )}

        {/* 3 Metric Summary Cards */}
        <div className="grid-3" style={{ marginBottom: '32px' }}>
          {/* User Target Budget */}
          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #2563eb' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              User Target Budget
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
              ₹{Number(currentBudget.user_budget).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Allocated for {days} days ({travelers} travelers)
            </div>
          </div>

          {/* Total Estimated Cost */}
          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Estimated Cost
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
              ₹{Number(currentBudget.total_estimated_cost).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {budgetUsedPct}% of budget utilized
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="card" style={{
            padding: '24px',
            borderLeft: `4px solid ${currentBudget.remaining_budget >= 0 ? '#10b981' : '#ef4444'}`
          }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Remaining Cushion
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: currentBudget.remaining_budget >= 0 ? '#10b981' : '#ef4444',
              margin: '6px 0'
            }}>
              {currentBudget.remaining_budget >= 0 ? '₹' : '-₹'}
              {Math.abs(currentBudget.remaining_budget).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.82rem', color: currentBudget.remaining_budget >= 0 ? '#059669' : '#dc2626' }}>
              {currentBudget.remaining_budget >= 0 ? 'Safe margin available' : 'Budget overrun'}
            </div>
          </div>
        </div>

        {/* Interactive Charts & Adjustments */}
        <div className="grid-2" style={{ alignItems: 'start', marginBottom: '32px' }}>
          {/* Recharts Donut Chart */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChartIcon size={20} color="var(--primary)" />
                Expense Distribution
              </h3>
              <span className="badge badge-primary">Recharts</span>
            </div>

            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Cost']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dynamic Preferences / What-if Simulator */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--primary)" />
              Budget Simulator & Alternatives
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
              Switch hotels or transport modes to recalculate your total trip budget in real-time.
            </p>

            <div className="form-group">
              <label className="form-label">
                <span>Select Accommodation</span>
              </label>
              <select
                className="form-select"
                value={selectedHotelId}
                onChange={handleHotelChange}
              >
                <option value="">Recommended / Default</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — ₹{h.price_per_night}/night ({h.rating} ★)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Select Commute Mode</span>
              </label>
              <select
                className="form-select"
                value={selectedTransport}
                onChange={handleTransportChange}
              >
                <option value="">Default Transit</option>
                <option value="Local Cab / Taxi">Local Cab / Private Taxi</option>
                <option value="Auto Rickshaw">Auto Rickshaw</option>
                <option value="Rental Scooter / Bike">Rental Scooter / Bike</option>
                <option value="Public Bus">Public Bus</option>
              </select>
            </div>

            {/* AI Cost-Saving Recommendations */}
            {currentBudget.suggestions && currentBudget.suggestions.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingDown size={16} />
                  AI Cost Optimization Suggestions:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#14532d' }}>
                  {currentBudget.suggestions.map((s, idx) => (
                    <li key={idx}>• {s.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Itemized Cost Breakdown</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '12px 16px' }}>Expense Category</th>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Estimated Cost</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {(currentBudget.breakdown || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {item.category}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {item.name}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      ₹{Number(item.cost).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '14px 16px' }}>Total Projected Cost</td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>Including 10% emergency buffer</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--primary)', fontSize: '1.1rem' }}>
                    ₹{Number(currentBudget.total_estimated_cost).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;
