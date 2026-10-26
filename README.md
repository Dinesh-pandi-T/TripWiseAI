# Smart Trip Planning and Recommendation System 🌍✈️

A comprehensive, full-stack **College Data Science Project** featuring an AI/data-driven travel planning platform. The system personalizes attraction recommendations using TF-IDF content-based filtering, optimizes multi-day itineraries, estimates itemized travel budgets, integrates dynamic weather forecasting, and presents visual travel analytics.

---

## 1. Project Overview

Travelers routinely spend days juggling fragmented tools to find destinations, balance daily itineraries, calculate realistic costs, and account for local weather conditions. 

**SmartTrip** solves this by providing:
- **Personalized Attraction Recommendations**: Content-based filtering using TF-IDF vectorization and cosine similarity combined with a multi-factor weighted scoring algorithm.
- **Dynamic Weather Adaptation**: Real-time meteorological intelligence modifying suggestions (promoting indoor museums/shopping on rainy days and outdoor sightseeing/lakes on sunny days).
- **Greedy Itinerary Generation**: Day-by-day scheduling with realistic duration allocation, lunch stops at top restaurants, and evening hotel returns.
- **Route Optimization**: Haversine distance calculations and Nearest-Neighbor heuristic to minimize transit time between attractions.
- **Itemized Budget Estimator**: Cost breakdowns across lodging, food, transit, and entry fees with proactive alerts and AI cost-saving suggestions.
- **Data Science Analytics Dashboard**: Interactive visualizations showing dataset statistics, ratings, prices, and popularity distributions using Recharts.
- **SQLite Database Persistence**: Seamless storage and retrieval of user-customized travel itineraries.

---

## 2. Architecture

```
                                  USER BROWSER
                         (React 18 + Vite + Tailwind/CSS)
                                       │
                      HTTP REST Calls (Axios / Recharts / Leaflet)
                                       ▼
                         FLASK BACKEND API (Port 5000)
             ┌─────────────────────────┴─────────────────────────┐
             ▼                                                   ▼
     MACHINE LEARNING SERVICES                          DATABASE LAYER (SQLite)
  ├── recommendation.py (TF-IDF + Cosine Sim)        ├── schema.sql
  ├── itinerary.py (Greedy Day Scheduler)            ├── database.py (CSV Seed Loader)
  ├── budget.py (Cost Breakdown & Tips)              └── trip_planner.db
  ├── route.py (Haversine Optimizer)                             ▲
  └── weather.py (Open-Meteo Integration)                        │
             ▲                                            DATASETS (CSV)
             │                                       ├── destinations.csv
      EXTERNAL APIS                                  ├── attractions.csv
  ├── Open-Meteo Weather API                         ├── hotels.csv
  └── OpenStreetMap Tiles                            ├── restaurants.csv
                                                     └── transport.csv
```

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios
- **Data Visualization**: Recharts (Pie, Bar, Area charts)
- **Interactive Maps**: React Leaflet & Leaflet (OpenStreetMap tiles)
- **Icons**: Lucide React
- **Design System**: Modern Vanilla CSS with glassmorphism, responsive grid, and custom design tokens

### Backend
- **Language**: Python 3.11
- **API Framework**: Flask & Flask-CORS
- **Machine Learning & Data Science**:
  - Scikit-learn (`TfidfVectorizer`, `cosine_similarity`)
  - Pandas & NumPy (Data manipulation & aggregations)
  - Joblib (Model persistence)
  - Matplotlib & Seaborn (Visualizations in notebooks)
- **Database**: SQLite 3

---

## 4. Dataset Description

The initial data layer consists of curated CSV datasets in `backend/data/` for 8 major tourist destinations (Ooty, Goa, Manali, Jaipur, Munnar, Varanasi, Udaipur, Agra):

1. **`destinations.csv`** (8 records): `id`, `name`, `state`, `country`, `description`, `best_season`, `avg_daily_budget`, `image_url`, `latitude`, `longitude`.
2. **`attractions.csv`** (48 records): `id`, `name`, `destination`, `category`, `description`, `rating`, `price`, `duration`, `popularity`, `latitude`, `longitude`, `indoor_outdoor`, `tags`.
3. **`hotels.csv`** (32 records): `id`, `name`, `destination`, `price_per_night`, `rating`, `latitude`, `longitude`, `amenities`.
4. **`restaurants.csv`** (32 records): `id`, `name`, `destination`, `cuisine`, `average_cost`, `rating`, `latitude`, `longitude`.
5. **`transport.csv`** (32 records): `id`, `destination`, `transport_type`, `average_cost`, `distance`.

---

## 5. Machine Learning & Recommendation Methodology

### Feature Engineering
For each tourist attraction, we construct a consolidated feature string:
$$\text{combined\_features} = \text{category} \times 2 + \text{tags} \times 2 + \text{description} + \text{indoor\_outdoor}$$

### TF-IDF Vectorization & Cosine Similarity
We fit a `TfidfVectorizer(stop_words='english', ngram_range=(1, 2))` on the combined features. Given a user query $u$ derived from selected travel interests and candidate attraction vector $a$:
$$\text{Cosine Similarity}(u, a) = \frac{u \cdot a}{\|u\| \|a\|}$$

### Transparent Multi-Factor Weighted Scoring Equation
To balance relevance, attraction quality, affordability, popularity, and weather conditions:
$$\text{Score} = w_1 \cdot S_{\text{content}} + w_2 \cdot S_{\text{category}} + w_3 \cdot S_{\text{rating}} + w_4 \cdot S_{\text{budget}} + w_5 \cdot S_{\text{popularity}} + w_6 \cdot S_{\text{weather}}$$

- $w_1 = 0.30$ (TF-IDF Content Similarity)
- $w_2 = 0.25$ (Direct Category Match)
- $w_3 = 0.15$ (Normalized Rating: $(\text{rating} - 3.5) / 1.5$)
- $w_4 = 0.10$ (Budget Suitability: inversely proportional to ticket price vs allocated attraction budget)
- $w_5 = 0.10$ (Normalized Popularity: $(\text{pop} - 50) / 50$)
- $w_6 = 0.10$ (Weather Suitability: indoor boost on rainy days, outdoor boost on clear days)

### Model Benchmark & Precision@K
As detailed in `backend/notebooks/recommendation_model.ipynb`:
- **Rating-based baseline**: Average Precision@3 = **53.3%**
- **Popularity-based baseline**: Average Precision@3 = **60.0%**
- **Personalized TF-IDF + Weighted Engine**: Average Precision@3 = **93.3%**

---

## 6. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/destinations` | List all available destinations |
| `GET` | `/api/destinations/<name>` | Get destination details, attractions, hotels & restaurants |
| `GET` | `/api/attractions` | Filter attractions by destination and category |
| `GET` | `/api/hotels` | Get hotels for a destination |
| `GET` | `/api/restaurants` | Get restaurants for a destination |
| `POST` | `/api/recommendations` | Generate personalized attraction recommendations |
| `POST` | `/api/itinerary` | Generate optimized day-by-day itinerary schedule |
| `POST` | `/api/budget` | Calculate itemized budget breakdown and cost-saving tips |
| `GET` | `/api/weather/<dest>` | Fetch live weather and forecast from Open-Meteo API |
| `POST` | `/api/route` | Compute Haversine distance matrix and optimal route |
| `GET` | `/api/analytics` | Retrieve travel statistics and chart aggregations |
| `POST` | `/api/itineraries/save` | Save customized trip plan into SQLite database |
| `GET` | `/api/itineraries` | Retrieve saved user itineraries |

---

## 7. Installation & Setup Instructions

### Prerequisites
- **Python 3.11+**
- **Node.js 18+ & npm**

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd smart-trip-planner/backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize SQLite database from CSV data:
   ```bash
   python database/database.py
   ```
4. (Optional) Run backend automated API tests:
   ```bash
   python test_api.py
   ```
5. Start the Flask server:
   ```bash
   python app.py
   ```
   *The backend runs on `http://127.0.0.1:5000`.*

### Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd smart-trip-planner/frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on `http://localhost:3000` (or `5173`).*

---

## 8. Frontend Pages Walkthrough

1. **Home (`/`)**: Hero banner *"Plan Smarter. Travel Better."*, feature showcases, and top destination previews.
2. **Plan Trip (`/plan`)**: Interactive preferences form with destination, budget, travelers, duration, style, and 11 multi-select interest chips.
3. **Recommendations (`/recommendations`)**: Ranked attractions with percentage match badges, score breakdown tooltips, live weather card, and *"Add to Itinerary"* toggles.
4. **Itinerary (`/itinerary`)**: Timed daily schedule (09:00 - 18:00) with meals and lodging, remove/reorder actions, and interactive **React Leaflet** route map.
5. **Budget (`/budget`)**: Financial estimator with **Recharts** donut chart, metric summary cards, overrun warning, and interactive what-if hotel/transit simulator.
6. **Explore Destinations (`/explore`)**: Filterable catalog of Indian getaways with budgets, best season, and direct plan CTAs.
7. **Analytics (`/analytics`)**: Data Science dashboard with popularity rankings, category distribution, price comparisons, and rating distributions.
8. **About (`/about`)**: Complete academic documentation covering mathematical formulas, TF-IDF architecture, and Precision@K benchmarks.

---

## 9. Data Science Jupyter Notebooks

Located in `backend/notebooks/`:
- **`eda.ipynb`**: Exploratory Data Analysis, missing value checks, duplicate analysis, and seaborn distribution visualizations.
- **`recommendation_model.ipynb`**: TF-IDF vectorizer training, cosine similarity matrix computation, weighted scoring, and Precision@3 benchmark comparisons against naive baselines.

---

## 10. Future Enhancements

- **Collaborative Filtering**: Incorporate user click-streams and collaborative matrix factorization (SVD/ALS) as user interaction history expands.
- **Real-time Live Flights & Trains**: Integration with IRCTC or flight aggregator APIs for inter-city transit fares.
- **Full Travelling Salesperson Problem (TSP)**: Integer Linear Programming or Genetic Algorithm for large tour graphs exceeding 20 nodes.
