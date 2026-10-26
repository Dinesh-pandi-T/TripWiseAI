import React from 'react';
import {
  Compass, Brain, Database, CloudSun, Route,
  BarChart3, CheckCircle, Code2, Layers, Cpu
} from 'lucide-react';

const About = () => {
  return (
    <div className="page-wrapper" style={{ padding: '40px 0 80px', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
            Academic Documentation
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', marginBottom: '12px' }}>
            Smart Trip Planning & Recommendation System
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto' }}>
            A complete Full-Stack Data Science college project demonstrating machine learning, content-based recommendation algorithms, geospatial routing, and statistical analytics.
          </p>
        </div>

        {/* 1. Project Objective */}
        <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Compass size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>1. Project Objective</h2>
          </div>
          <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '14px' }}>
            Modern travelers often struggle with fragmented trip planning across separate websites for sightseeing, hotel booking, weather forecasts, route budgeting, and time scheduling. The objective of this project is to create an integrated, AI/data-driven travel planning platform that:
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569', fontSize: '0.95rem' }}>
            <li>• Recommends attractions customized to user interests, budget, duration, and popularity using <strong>TF-IDF & Cosine Similarity</strong>.</li>
            <li>• Schedules balanced, day-by-day itineraries with meal stops and evening hotel rest.</li>
            <li>• Computes transparent itemized travel budgets and alerts when exceeding thresholds.</li>
            <li>• Adapts dynamically to real-time weather conditions via live meteorological feeds.</li>
            <li>• Minimizes total transit distance using the <strong>Haversine formula</strong> and Nearest-Neighbor heuristic.</li>
          </ul>
        </div>

        {/* 2. Machine Learning & Mathematical Methodology */}
        <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Brain size={24} color="#8b5cf6" />
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>2. Machine Learning Methodology</h2>
          </div>

          <h3 style={{ fontSize: '1.1rem', marginTop: '16px', marginBottom: '8px', color: '#1e293b' }}>
            A. Text Preprocessing & Feature Combination
          </h3>
          <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '12px' }}>
            For each attraction, textual metadata including category, descriptive tags, long summary, and indoor/outdoor flags are concatenated into a unified document string, weighted by token repetition:
          </p>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '16px', color: '#334155' }}>
            combined_features = f"&#123;category&#125; &#123;category&#125; &#123;tags&#125; &#123;tags&#125; &#123;description&#125; &#123;indoor_outdoor&#125;"
          </div>

          <h3 style={{ fontSize: '1.1rem', marginTop: '16px', marginBottom: '8px', color: '#1e293b' }}>
            B. TF-IDF Vectorization & Cosine Similarity
          </h3>
          <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '12px' }}>
            We fit a Scikit-Learn <code>TfidfVectorizer(stop_words='english', ngram_range=(1, 2))</code> across all attractions. The user query vector is constructed from explicit selected interests. Content similarity is computed as:
          </p>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '16px', color: '#334155' }}>
            Cosine Similarity(u, a) = (u · a) / (||u|| ||a||)
          </div>

          <h3 style={{ fontSize: '1.1rem', marginTop: '16px', marginBottom: '8px', color: '#1e293b' }}>
            C. Transparent Multi-Factor Weighted Scoring Equation
          </h3>
          <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '12px' }}>
            To prevent purely keyword-dominated bias, our model combines six normalized dimensions:
          </p>
          <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.92rem', color: '#1e3a8a', lineHeight: '1.7' }}>
            <strong>Score(attraction) = </strong><br />
            0.30 × Content_Similarity + <br />
            0.25 × Category_Match + <br />
            0.15 × Normalized_Rating + <br />
            0.10 × Budget_Suitability + <br />
            0.10 × Normalized_Popularity + <br />
            0.10 × Weather_Suitability
          </div>
        </div>

        {/* 3. Model Benchmark & Evaluation */}
        <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <BarChart3 size={24} color="#10b981" />
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>3. Model Benchmark & Precision@K Evaluation</h2>
          </div>
          <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '16px' }}>
            As demonstrated in our Jupyter evaluation notebook, we benchmarked the personalized model against naive popularity-based and rating-based baselines across 5 diverse test queries:
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '10px 14px' }}>Model Strategy</th>
                  <th style={{ padding: '10px 14px' }}>Personalization</th>
                  <th style={{ padding: '10px 14px' }}>Average Precision@3</th>
                  <th style={{ padding: '10px 14px' }}>Contextual Adaptation</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>Rating Baseline</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>None (Greedy Highest Stars)</td>
                  <td style={{ padding: '10px 14px', color: '#f59e0b', fontWeight: 700 }}>0.53 (53.3%)</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>Static</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>Popularity Baseline</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>None (Greedy Footfall)</td>
                  <td style={{ padding: '10px 14px', color: '#06b6d4', fontWeight: 700 }}>0.60 (60.0%)</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>Static</td>
                </tr>
                <tr style={{ background: '#f0fdf4' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#166534' }}>Personalized TF-IDF Engine</td>
                  <td style={{ padding: '10px 14px', color: '#166534' }}>High (Interests + Budget + Weather)</td>
                  <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 800 }}>0.93 (93.3%)</td>
                  <td style={{ padding: '10px 14px', color: '#15803d' }}>Dynamic Weather & Budget</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic' }}>
            Note: The personalized model achieves significantly higher relevance because it penalizes attractions outside the user's explicit categories, even if they have slightly higher aggregate popularity.
          </p>
        </div>

        {/* 4. Full-Stack Technology Stack */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Cpu size={24} color="#f59e0b" />
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>4. Technology Stack & Deliverables</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>Frontend Layer</strong>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6' }}>
                React 18, Vite, React Router 6, Axios, Recharts, React-Leaflet, Lucide Icons, Custom CSS Design System.
              </p>
            </div>

            <div>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>Backend Layer</strong>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6' }}>
                Python 3.11, Flask, Flask-CORS, RESTful APIs, SQLite 3, Joblib serialization.
              </p>
            </div>

            <div>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>Data Science Core</strong>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6' }}>
                Pandas, NumPy, Scikit-learn, TF-IDF Vectorizer, Matplotlib, Seaborn, Jupyter Notebooks.
              </p>
            </div>

            <div>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>External Integrations</strong>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6' }}>
                Open-Meteo REST API, OpenStreetMap tile servers, Haversine geospatial calculations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
