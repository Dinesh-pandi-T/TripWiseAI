import os
import re
import math
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
NOTEBOOKS_DIR = os.path.join(BASE_DIR, "notebooks")
VIZ_DIR = os.path.join(NOTEBOOKS_DIR, "visualizations")
MODELS_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(VIZ_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. LOAD CSV DATASETS & DATA CLEANING
# -------------------------------------------------------------
print("=" * 60)
print("PHASE 1: LOADING & CLEANING DATASETS")
print("=" * 60)

dest_path = os.path.join(DATA_DIR, "destinations.csv")
att_path = os.path.join(DATA_DIR, "attractions.csv")
hotels_path = os.path.join(DATA_DIR, "hotels.csv")
rest_path = os.path.join(DATA_DIR, "restaurants.csv")
trans_path = os.path.join(DATA_DIR, "transport.csv")

destinations = pd.read_csv(dest_path)
attractions = pd.read_csv(att_path)
hotels = pd.read_csv(hotels_path)
restaurants = pd.read_csv(rest_path)
transport = pd.read_csv(trans_path)

print(f"Loaded destinations: {destinations.shape}")
print(f"Loaded attractions: {attractions.shape}")
print(f"Loaded hotels: {hotels.shape}")
print(f"Loaded restaurants: {restaurants.shape}")
print(f"Loaded transport: {transport.shape}")

# A. Missing value handling
print("\n--- Missing Value Inspection ---")
for name, df in [("Destinations", destinations), ("Attractions", attractions), 
                 ("Hotels", hotels), ("Restaurants", restaurants), ("Transport", transport)]:
    null_counts = df.isnull().sum()
    total_nulls = null_counts.sum()
    print(f"{name}: {total_nulls} missing values")
    if total_nulls > 0:
        print(null_counts[null_counts > 0])

# Impute / clean missing values if any
attractions['description'] = attractions['description'].fillna('Popular tourist attraction')
attractions['tags'] = attractions['tags'].fillna('travel, sightseeing')
attractions['price'] = attractions['price'].fillna(0.0)
attractions['rating'] = attractions['rating'].fillna(attractions['rating'].median())
attractions['popularity'] = attractions['popularity'].fillna(attractions['popularity'].median())

# B. Duplicate Removal
print("\n--- Duplicate Rows Inspection ---")
for name, df in [("Destinations", destinations), ("Attractions", attractions), 
                 ("Hotels", hotels), ("Restaurants", restaurants), ("Transport", transport)]:
    dups = df.duplicated().sum()
    print(f"{name} duplicates: {dups}")
    if dups > 0:
        df.drop_duplicates(inplace=True)

# C. Data Type Correction
print("\n--- Data Type Correction ---")
attractions['id'] = attractions['id'].astype(int)
attractions['rating'] = attractions['rating'].astype(float)
attractions['price'] = attractions['price'].astype(float)
attractions['duration'] = attractions['duration'].astype(float)
attractions['popularity'] = attractions['popularity'].astype(int)
attractions['latitude'] = attractions['latitude'].astype(float)
attractions['longitude'] = attractions['longitude'].astype(float)
attractions['destination'] = attractions['destination'].astype(str).str.strip()
attractions['category'] = attractions['category'].astype(str).str.strip()

destinations['avg_daily_budget'] = destinations['avg_daily_budget'].astype(float)
destinations['latitude'] = destinations['latitude'].astype(float)
destinations['longitude'] = destinations['longitude'].astype(float)

hotels['price_per_night'] = hotels['price_per_night'].astype(float)
hotels['rating'] = hotels['rating'].astype(float)

restaurants['average_cost'] = restaurants['average_cost'].astype(float)
restaurants['rating'] = restaurants['rating'].astype(float)

transport['average_cost'] = transport['average_cost'].astype(float)
transport['distance'] = transport['distance'].astype(float)

# D. Feature Engineering
print("\n--- Feature Engineering ---")
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def create_combined_features(row):
    cat = str(row['category'])
    tags = str(row['tags'])
    desc = str(row['description'])
    io = str(row.get('indoor_outdoor', 'outdoor'))
    return clean_text(f"{cat} {cat} {tags} {tags} {desc} {io}")

attractions['clean_description'] = attractions['description'].apply(clean_text)
attractions['combined_features'] = attractions.apply(create_combined_features, axis=1)
attractions['desc_word_count'] = attractions['description'].apply(lambda x: len(str(x).split()))
attractions['is_free'] = (attractions['price'] == 0).astype(int)

# Normalization utilities
def min_max_normalize(series, min_v=None, max_v=None):
    s_min = series.min() if min_v is None else min_v
    s_max = series.max() if max_v is None else max_v
    if s_max == s_min:
        return series.apply(lambda x: 1.0)
    return (series - s_min) / (s_max - s_min)

attractions['norm_rating'] = min_max_normalize(attractions['rating'], 3.5, 5.0).clip(0, 1)
attractions['norm_popularity'] = min_max_normalize(attractions['popularity'], 50, 100).clip(0, 1)

print("Engineered columns:", ['clean_description', 'combined_features', 'desc_word_count', 'is_free', 'norm_rating', 'norm_popularity'])
print("Clean dataset summary:")
print(attractions[['name', 'category', 'rating', 'price', 'popularity', 'norm_rating']].head(3))

# -------------------------------------------------------------
# 2. EXPLORATORY DATA ANALYSIS (EDA) & VISUALIZATIONS
# -------------------------------------------------------------
print("\n" + "=" * 60)
print("PHASE 2: GENERATING EDA VISUALIZATIONS")
print("=" * 60)

sns.set_theme(style="whitegrid")
plt.rcParams['font.sans-serif'] = 'Arial'

# 1. Rating Distribution
plt.figure(figsize=(9, 5))
sns.histplot(attractions['rating'], kde=True, color='#2563eb', bins=8, edgecolor='black', alpha=0.7)
plt.title('Attraction Rating Distribution (Mean: {:.2f} Stars)'.format(attractions['rating'].mean()), fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Rating (1.0 to 5.0)', fontsize=11)
plt.ylabel('Count of Attractions', fontsize=11)
plt.axvline(attractions['rating'].mean(), color='#dc2626', linestyle='--', linewidth=2, label=f'Mean: {attractions["rating"].mean():.2f}')
plt.legend()
plt.tight_layout()
rating_dist_path = os.path.join(VIZ_DIR, "rating_distribution.png")
plt.savefig(rating_dist_path, dpi=300)
plt.close()
print(f"Saved: {rating_dist_path}")

# 2. Price Distribution
plt.figure(figsize=(10, 5))
sns.histplot(attractions['price'], kde=False, color='#10b981', bins=12, edgecolor='black', alpha=0.75)
plt.title('Attraction Entry Price Distribution in INR (Free: {} attractions)'.format(attractions['is_free'].sum()), fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Ticket Price (INR)', fontsize=11)
plt.ylabel('Frequency', fontsize=11)
plt.tight_layout()
price_dist_path = os.path.join(VIZ_DIR, "price_distribution.png")
plt.savefig(price_dist_path, dpi=300)
plt.close()
print(f"Saved: {price_dist_path}")

# 3. Destination Popularity
plt.figure(figsize=(10, 5))
dest_pop = attractions.groupby('destination')['popularity'].mean().sort_values(ascending=False)
palette = sns.color_palette("Blues_r", len(dest_pop))
bars = plt.bar(dest_pop.index, dest_pop.values, color=palette, edgecolor='black', alpha=0.85)
plt.title('Destination Popularity Ranking (Average Attraction Popularity)', fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Destination', fontsize=11)
plt.ylabel('Mean Popularity Score (0-100)', fontsize=11)
plt.ylim(70, 100)
for bar in bars:
    y = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2.0, y + 0.6, f'{y:.1f}', ha='center', fontweight='bold', fontsize=9)
plt.tight_layout()
dest_pop_path = os.path.join(VIZ_DIR, "destination_popularity.png")
plt.savefig(dest_pop_path, dpi=300)
plt.close()
print(f"Saved: {dest_pop_path}")

# 4. Attraction Categories
plt.figure(figsize=(11, 5))
cat_counts = attractions['category'].value_counts()
sns.barplot(x=cat_counts.index, y=cat_counts.values, hue=cat_counts.index, palette='viridis', edgecolor='black', alpha=0.85, legend=False)
plt.title('Attractions by Category Breakdown (Total: {})'.format(len(attractions)), fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Category', fontsize=11)
plt.ylabel('Number of Attractions', fontsize=11)
plt.xticks(rotation=35, ha='right')
for i, v in enumerate(cat_counts.values):
    plt.text(i, v + 0.2, str(v), ha='center', fontweight='bold', fontsize=10)
plt.tight_layout()
cat_path = os.path.join(VIZ_DIR, "attraction_categories.png")
plt.savefig(cat_path, dpi=300)
plt.close()
print(f"Saved: {cat_path}")

# 5. Average Rating by Destination
plt.figure(figsize=(10, 5))
avg_rating = attractions.groupby('destination')['rating'].mean().sort_values(ascending=False)
sns.barplot(x=avg_rating.index, y=avg_rating.values, hue=avg_rating.index, palette='magma', edgecolor='black', alpha=0.85, legend=False)
plt.title('Average Attraction Rating by Destination', fontsize=14, fontweight='bold', pad=12)
plt.xlabel('Destination', fontsize=11)
plt.ylabel('Average Rating (Stars)', fontsize=11)
plt.ylim(4.0, 5.0)
for i, v in enumerate(avg_rating.values):
    plt.text(i, v + 0.02, f'{v:.2f}', ha='center', fontweight='bold', fontsize=9)
plt.tight_layout()
avg_rating_path = os.path.join(VIZ_DIR, "avg_rating_by_destination.png")
plt.savefig(avg_rating_path, dpi=300)
plt.close()
print(f"Saved: {avg_rating_path}")

# -------------------------------------------------------------
# 3. CONTENT-BASED RECOMMENDATION SYSTEM (TF-IDF + COSINE SIM)
# -------------------------------------------------------------
print("\n" + "=" * 60)
print("PHASE 3: TRAINING TF-IDF VECTORIZER & WEIGHTED RECOMMENDER")
print("=" * 60)

vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
tfidf_matrix = vectorizer.fit_transform(attractions['combined_features'])

print(f"TF-IDF Feature Space Dimensions: {tfidf_matrix.shape}")
print("Sample TF-IDF Features:", list(vectorizer.vocabulary_.keys())[:20])

# Save Model with Joblib
model_artifact = {
    "vectorizer": vectorizer,
    "tfidf_matrix": tfidf_matrix,
    "attractions_df": attractions
}
model_path = os.path.join(MODELS_DIR, "recommendation_model.pkl")
joblib.dump(model_artifact, model_path)
print(f"Successfully trained and saved recommendation model to {model_path}")

# Haversine distance formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

# Transparent Weighted Scoring Function
def get_content_recommendations(user_profile, top_k=5):
    """
    Computes real, non-fabricated content-based recommendations considering:
    1. Interest match (TF-IDF Cosine Similarity + Category Match)
    2. Rating (Normalized Star Rating)
    3. Budget suitability (Price vs Allocated Budget)
    4. Popularity (Normalized Popularity)
    5. Distance (Geodesic distance from destination center)
    """
    dest = user_profile['destination']
    interests = user_profile['interests']
    budget = user_profile['budget']
    days = user_profile['days']
    travelers = user_profile['travelers']

    # Filter attractions by destination
    df = attractions[attractions['destination'].str.lower() == dest.lower()].copy().reset_index(drop=True)
    if df.empty:
        return pd.DataFrame()

    dest_center_lat = df['latitude'].mean()
    dest_center_lon = df['longitude'].mean()

    # Construct user query vector
    query_text = " ".join(interests) + " " + " ".join([f"{i} {i}" for i in interests])
    query_vec = vectorizer.transform([clean_text(query_text)])

    # Compute TF-IDF Cosine Similarity
    cand_matrix = vectorizer.transform(df['combined_features'])
    sim_scores = cosine_similarity(query_vec, cand_matrix).flatten()

    # Per-attraction budget threshold
    est_attr_budget = max(400.0, (budget * 0.20) / max(1, days * 3 * travelers))

    results = []
    user_ints_lower = [i.lower() for i in interests]

    for idx, row in df.iterrows():
        # 1. Interest Match: Content Sim [0, 1] + Category Direct Match [0, 1]
        c_sim = float(sim_scores[idx])
        cat_match = 1.0 if row['category'].lower() in user_ints_lower else 0.2
        interest_score = (0.6 * c_sim) + (0.4 * cat_match)

        # 2. Rating Score [0, 1]
        r_score = float(row['norm_rating'])

        # 3. Budget Suitability [0, 1]
        price = float(row['price'])
        if price == 0:
            b_score = 1.0
        else:
            b_score = max(0.2, 1.0 - min(1.0, price / (est_attr_budget * 2)))

        # 4. Popularity [0, 1]
        pop_score = float(row['norm_popularity'])

        # 5. Distance Factor [0, 1] (Closer to destination center scores higher)
        dist_km = haversine(dest_center_lat, dest_center_lon, row['latitude'], row['longitude'])
        dist_score = max(0.2, 1.0 - min(1.0, dist_km / 30.0))

        # Composite Weighted Score
        # Weights: Interest (0.40), Rating (0.20), Budget (0.15), Popularity (0.15), Distance (0.10)
        final_score = (
            0.40 * interest_score +
            0.20 * r_score +
            0.15 * b_score +
            0.15 * pop_score +
            0.10 * dist_score
        )

        results.append({
            "id": row['id'],
            "name": row['name'],
            "destination": row['destination'],
            "category": row['category'],
            "rating": row['rating'],
            "price": row['price'],
            "popularity": row['popularity'],
            "distance_km": dist_km,
            "interest_match_pct": round(interest_score * 100, 1),
            "rating_norm_pct": round(r_score * 100, 1),
            "budget_suit_pct": round(b_score * 100, 1),
            "popularity_norm_pct": round(pop_score * 100, 1),
            "distance_factor_pct": round(dist_score * 100, 1),
            "final_recommendation_score": round(final_score * 100, 1)
        })

    res_df = pd.DataFrame(results)
    res_df = res_df.sort_values(by="final_recommendation_score", ascending=False).reset_index(drop=True)
    return res_df.head(top_k)

# -------------------------------------------------------------
# 4. TESTING WITH 5 DISTINCT USER PROFILES
# -------------------------------------------------------------
print("\n" + "=" * 60)
print("PHASE 4: TESTING RECOMMENDATION SYSTEM WITH 5 DISTINCT PROFILES")
print("=" * 60)

test_profiles = [
    {
        "id": "Profile 1",
        "name": "Adventure & Nature Couple",
        "destination": "Ooty",
        "interests": ["Nature", "Adventure", "Photography"],
        "budget": 15000,
        "days": 3,
        "travelers": 2
    },
    {
        "id": "Profile 2",
        "name": "Beach & Culture Group",
        "destination": "Goa",
        "interests": ["Beach", "Culture", "Historical"],
        "budget": 25000,
        "days": 4,
        "travelers": 3
    },
    {
        "id": "Profile 3",
        "name": "Royal Heritage Solo Traveler",
        "destination": "Jaipur",
        "interests": ["Historical", "Museum", "Photography"],
        "budget": 18000,
        "days": 3,
        "travelers": 1
    },
    {
        "id": "Profile 4",
        "name": "Spiritual Pilgrim",
        "destination": "Varanasi",
        "interests": ["Temple", "Culture"],
        "budget": 10000,
        "days": 2,
        "travelers": 2
    },
    {
        "id": "Profile 5",
        "name": "Snow & Trekking Explorer",
        "destination": "Manali",
        "interests": ["Adventure", "Nature"],
        "budget": 20000,
        "days": 4,
        "travelers": 2
    }
]

profile_results = []

for p in test_profiles:
    print(f"\n>>> Running Recommendation for {p['id']}: {p['name']} ({p['destination']})")
    print(f"    Interests: {p['interests']} | Budget: INR {p['budget']:,} | {p['days']} Days, {p['travelers']} Travelers")
    
    recs = get_content_recommendations(p, top_k=3)
    
    # Calculate Precision@3 (fraction of top 3 attractions relevant to user's explicit interests)
    user_int_set = set([i.lower() for i in p['interests']])
    relevant_count = 0
    for _, row in recs.iterrows():
        # Check if category matches or description/tags contains interest
        cat_match = row['category'].lower() in user_int_set
        if cat_match:
            relevant_count += 1
            
    p_at_3 = relevant_count / len(recs) if len(recs) > 0 else 0.0

    print(f"    Ranked Top 3 Recommendations (Precision@3 = {p_at_3:.2f}):")
    for rank, (_, row) in enumerate(recs.iterrows(), 1):
        print(f"      #{rank}: {row['name']} [{row['category']}] - Score: {row['final_recommendation_score']}% "
              f"(Rating: {row['rating']}*, Fee: INR {row['price']}, Dist: {row['distance_km']}km)")

    profile_results.append({
        "Profile": p['id'] + ": " + p['name'],
        "Destination": p['destination'],
        "Interests": ", ".join(p['interests']),
        "Top_Pick": recs.iloc[0]['name'] if len(recs) > 0 else "N/A",
        "Top_Score": recs.iloc[0]['final_recommendation_score'] if len(recs) > 0 else 0.0,
        "Precision@3": round(p_at_3, 2)
    })

summary_df = pd.DataFrame(profile_results)
print("\n" + "=" * 60)
print("TEST SUMMARY BENCHMARK ACROSS 5 PROFILES:")
print("=" * 60)
print(summary_df.to_string(index=False))

# -------------------------------------------------------------
# 5. RE-GENERATE NOTEBOOKS WITH RICH REAL EXECUTIONS & PLOTS
# -------------------------------------------------------------
print("\n" + "=" * 60)
print("PHASE 5: UPDATING JUPYTER NOTEBOOKS WITH ACTUAL DATA")
print("=" * 60)

# Import notebook generator
import notebooks.generate_notebooks

print("\nData Science pipeline successfully executed!")
