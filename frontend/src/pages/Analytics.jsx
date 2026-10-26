import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  BarChart3, PieChart as PieIcon, Star, DollarSign,
  MapPin, Compass, Layers, Sparkles, RefreshCw
} from 'lucide-react';
import { getAnalytics } from '../services/api';

const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="page-wrapper" style={{ padding: '80px 0', textAlign: 'center' }}>
        <RefreshCw size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 16px' }} />
        <p>Loading Data Science travel analytics...</p>
      </div>
    );
  }

  const { summary, popular_destinations, category_distribution, price_by_destination, rating_distribution, score_distribution } = data;

  return (
    <div className="page-wrapper" style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
            Data Science Dashboard
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a' }}>
            Travel Intelligence & Dataset Analytics
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '4px' }}>
            Descriptive statistics and visual aggregations powering the Smart Trip recommendation models.
          </p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid-4" style={{ marginBottom: '36px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>TOTAL DESTINATIONS</span>
              <MapPin size={20} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>
              {summary.total_destinations}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
              Indexed across 6 Indian states
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>ATTRACTIONS</span>
              <Layers size={20} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>
              {summary.total_attractions}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {summary.free_attractions_count} free entry locations
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>AVG ATTRACTION RATING</span>
              <Star size={20} color="#f59e0b" fill="#f59e0b" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>
              {summary.average_attraction_rating} ★
            </div>
            <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>
              High tourist satisfaction index
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>AVG TICKET PRICE</span>
              <DollarSign size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>
              ₹{summary.average_attraction_price}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
              Budget-friendly entrance passes
            </div>
          </div>
        </div>

        {/* Charts Row 1: Popularity vs Category */}
        <div className="grid-2" style={{ marginBottom: '32px' }}>
          {/* Chart 1: Popular Destinations */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>1. Most Popular Destinations</h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Mean tourist popularity index (0-100 scale)</div>
              </div>
              <span className="badge badge-primary">Bar Chart</span>
            </div>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popular_destinations}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} />
                  <Tooltip
                    formatter={(val) => [`${val} / 100`, 'Popularity Score']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="popularity" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Distribution */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>2. Attractions by Category</h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Distribution across nature, heritage, food & more</div>
              </div>
              <span className="badge badge-primary">Donut Chart</span>
            </div>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    dataKey="count"
                    nameKey="category"
                    paddingAngle={3}
                  >
                    {category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, entry) => [`${val} attractions (${entry.payload.percentage}%)`, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Price by Destination & Rating Distribution */}
        <div className="grid-2" style={{ marginBottom: '32px' }}>
          {/* Chart 3: Price Comparison by Destination */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>3. Average Daily Budget by Destination</h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Benchmark daily expenditure per traveler (₹ INR)</div>
              </div>
              <span className="badge badge-primary">Bar Chart</span>
            </div>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={price_by_destination}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="destination" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Avg Daily Budget']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="avg_daily_budget" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Rating Distribution */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>4. Attraction Rating Distribution</h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Frequency of attractions in rating tiers</div>
              </div>
              <span className="badge badge-primary">Histogram</span>
            </div>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rating_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    formatter={(val) => [`${val} attractions`, 'Frequency']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 5: Recommendation Score Distribution */}
        <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>5. Recommendation Score Spread</h3>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Simulated match distribution across multi-factor queries</div>
            </div>
            <span className="badge badge-primary">Area Chart</span>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={score_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(val) => [`${val} items`, 'Frequency']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf633" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
