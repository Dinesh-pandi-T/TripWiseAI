import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTEBOOKS_DIR = os.path.join(BASE_DIR, "notebooks")
os.makedirs(NOTEBOOKS_DIR, exist_ok=True)

def make_notebook(cells):
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3 (ipykernel)",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {"name": "ipython", "version": 3},
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.11.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }

def code_cell(source_lines):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in source_lines]
    }

def md_cell(source_lines):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in source_lines]
    }

# -----------------------------------------------------------
# 1. EDA NOTEBOOK
# -----------------------------------------------------------
eda_cells = [
    md_cell([
        "# Smart Trip Planning and Recommendation System - EDA & Preprocessing",
        "### College Data Science Project",
        "This notebook covers:",
        "1. **Loading CSV Datasets** via Pandas (`destinations`, `attractions`, `hotels`, `restaurants`, `transport`)",
        "2. **Data Cleaning**: Missing value handling, duplicate checks, data type casting",
        "3. **Feature Engineering**: Text tokenization, composite tags, word counts, and min-max normalization",
        "4. **Exploratory Data Analysis (EDA) Visualizations**:",
        "   - Attraction Rating Distribution",
        "   - Entry Ticket Price Distribution",
        "   - Destination Popularity Ranking",
        "   - Attraction Categories Distribution",
        "   - Average Rating by Destination"
    ]),
    code_cell([
        "import os",
        "import re",
        "import pandas as pd",
        "import numpy as np",
        "import matplotlib.pyplot as plt",
        "import seaborn as sns",
        "",
        "# Styling configurations",
        "sns.set_theme(style='whitegrid')",
        "plt.rcParams['figure.figsize'] = (10, 5)",
        "DATA_DIR = '../data'",
        "print('Libraries successfully imported.')"
    ]),
    md_cell(["## 1. Load Datasets Using Pandas"]),
    code_cell([
        "destinations = pd.read_csv(os.path.join(DATA_DIR, 'destinations.csv'))",
        "attractions = pd.read_csv(os.path.join(DATA_DIR, 'attractions.csv'))",
        "hotels = pd.read_csv(os.path.join(DATA_DIR, 'hotels.csv'))",
        "restaurants = pd.read_csv(os.path.join(DATA_DIR, 'restaurants.csv'))",
        "transport = pd.read_csv(os.path.join(DATA_DIR, 'transport.csv'))",
        "",
        "print(f'Destinations shape: {destinations.shape}')",
        "print(f'Attractions shape:  {attractions.shape}')",
        "print(f'Hotels shape:       {hotels.shape}')",
        "print(f'Restaurants shape:  {restaurants.shape}')",
        "print(f'Transport shape:    {transport.shape}')",
        "attractions.head(3)"
    ]),
    md_cell(["## 2. Data Cleaning: Missing Values, Duplicates & Type Correction"]),
    code_cell([
        "# Missing Values Check",
        "print('--- Missing Values in Attractions ---')",
        "print(attractions.isnull().sum())",
        "",
        "# Fill any potential missing values",
        "attractions['description'] = attractions['description'].fillna('Popular tourist attraction')",
        "attractions['tags'] = attractions['tags'].fillna('travel, sightseeing')",
        "attractions['price'] = attractions['price'].fillna(0.0)",
        "attractions['rating'] = attractions['rating'].fillna(attractions['rating'].median())",
        "",
        "# Duplicate Rows Removal",
        "dups = attractions.duplicated().sum()",
        "print(f'Duplicate rows detected: {dups}')",
        "if dups > 0:",
        "    attractions.drop_duplicates(inplace=True)",
        "",
        "# Data Type Corrections",
        "attractions['id'] = attractions['id'].astype(int)",
        "attractions['rating'] = attractions['rating'].astype(float)",
        "attractions['price'] = attractions['price'].astype(float)",
        "attractions['duration'] = attractions['duration'].astype(float)",
        "attractions['popularity'] = attractions['popularity'].astype(int)",
        "attractions['latitude'] = attractions['latitude'].astype(float)",
        "attractions['longitude'] = attractions['longitude'].astype(float)",
        "attractions.dtypes"
    ]),
    md_cell(["## 3. Feature Engineering & Normalization"]),
    code_cell([
        "def clean_text(text):",
        "    if not isinstance(text, str): return ''",
        "    text = re.sub(r'[^a-zA-Z0-9\\s]', ' ', text.lower())",
        "    return re.sub(r'\\s+', ' ', text).strip()",
        "",
        "# Combine category, tags, and description with weighted repetition",
        "attractions['combined_features'] = attractions.apply(",
        "    lambda r: clean_text(f\"{r['category']} {r['category']} {r['tags']} {r['tags']} {r['description']} {r['indoor_outdoor']}\"),",
        "    axis=1",
        ")",
        "",
        "attractions['desc_word_count'] = attractions['description'].apply(lambda x: len(str(x).split()))",
        "attractions['is_free'] = (attractions['price'] == 0).astype(int)",
        "",
        "# Min-Max Normalization of Rating and Popularity to [0, 1]",
        "attractions['norm_rating'] = ((attractions['rating'] - 3.5) / (5.0 - 3.5)).clip(0, 1)",
        "attractions['norm_popularity'] = ((attractions['popularity'] - 50) / (100 - 50)).clip(0, 1)",
        "",
        "attractions[['name', 'category', 'desc_word_count', 'norm_rating', 'norm_popularity', 'combined_features']].head(3)"
    ]),
    md_cell(["## 4. EDA Visualization 1: Rating Distribution"]),
    code_cell([
        "plt.figure(figsize=(9, 5))",
        "sns.histplot(attractions['rating'], kde=True, color='#2563eb', bins=8, edgecolor='black', alpha=0.75)",
        "plt.title(f'Attraction Rating Distribution (Mean: {attractions[\"rating\"].mean():.2f} Stars)', fontsize=14, fontweight='bold', pad=12)",
        "plt.xlabel('Rating (1.0 to 5.0)', fontsize=11)",
        "plt.ylabel('Count of Attractions', fontsize=11)",
        "plt.axvline(attractions['rating'].mean(), color='#dc2626', linestyle='--', linewidth=2, label=f'Mean: {attractions[\"rating\"].mean():.2f}')",
        "plt.legend()",
        "plt.tight_layout()",
        "plt.show()"
    ]),
    md_cell(["## 5. EDA Visualization 2: Entry Ticket Price Distribution"]),
    code_cell([
        "plt.figure(figsize=(10, 5))",
        "sns.histplot(attractions['price'], kde=False, color='#10b981', bins=12, edgecolor='black', alpha=0.75)",
        "plt.title(f'Attraction Ticket Price Distribution in INR (Free: {attractions[\"is_free\"].sum()} Attractions)', fontsize=14, fontweight='bold', pad=12)",
        "plt.xlabel('Ticket Price (INR)', fontsize=11)",
        "plt.ylabel('Frequency', fontsize=11)",
        "plt.tight_layout()",
        "plt.show()"
    ]),
    md_cell(["## 6. EDA Visualization 3: Destination Popularity Ranking"]),
    code_cell([
        "plt.figure(figsize=(10, 5))",
        "dest_pop = attractions.groupby('destination')['popularity'].mean().sort_values(ascending=False)",
        "palette = sns.color_palette('Blues_r', len(dest_pop))",
        "bars = plt.bar(dest_pop.index, dest_pop.values, color=palette, edgecolor='black', alpha=0.85)",
        "plt.title('Destination Popularity Ranking (Average Attraction Popularity)', fontsize=14, fontweight='bold', pad=12)",
        "plt.xlabel('Destination', fontsize=11)",
        "plt.ylabel('Mean Popularity Score (0-100)', fontsize=11)",
        "plt.ylim(70, 100)",
        "for bar in bars:",
        "    y = bar.get_height()",
        "    plt.text(bar.get_x() + bar.get_width()/2.0, y + 0.6, f'{y:.1f}', ha='center', fontweight='bold', fontsize=9)",
        "plt.tight_layout()",
        "plt.show()"
    ]),
    md_cell(["## 7. EDA Visualization 4: Attractions by Category Breakdown"]),
    code_cell([
        "plt.figure(figsize=(11, 5))",
        "cat_counts = attractions['category'].value_counts()",
        "sns.barplot(x=cat_counts.index, y=cat_counts.values, hue=cat_counts.index, palette='viridis', edgecolor='black', alpha=0.85, legend=False)",
        "plt.title(f'Attractions by Category Breakdown (Total: {len(attractions)})', fontsize=14, fontweight='bold', pad=12)",
        "plt.xlabel('Category', fontsize=11)",
        "plt.ylabel('Number of Attractions', fontsize=11)",
        "plt.xticks(rotation=35, ha='right')",
        "for i, v in enumerate(cat_counts.values):",
        "    plt.text(i, v + 0.2, str(v), ha='center', fontweight='bold', fontsize=10)",
        "plt.tight_layout()",
        "plt.show()"
    ]),
    md_cell(["## 8. EDA Visualization 5: Average Rating by Destination"]),
    code_cell([
        "plt.figure(figsize=(10, 5))",
        "avg_rating = attractions.groupby('destination')['rating'].mean().sort_values(ascending=False)",
        "sns.barplot(x=avg_rating.index, y=avg_rating.values, hue=avg_rating.index, palette='magma', edgecolor='black', alpha=0.85, legend=False)",
        "plt.title('Average Attraction Rating by Destination', fontsize=14, fontweight='bold', pad=12)",
        "plt.xlabel('Destination', fontsize=11)",
        "plt.ylabel('Average Rating (Stars)', fontsize=11)",
        "plt.ylim(4.0, 5.0)",
        "for i, v in enumerate(avg_rating.values):",
        "    plt.text(i, v + 0.02, f'{v:.2f}', ha='center', fontweight='bold', fontsize=9)",
        "plt.tight_layout()",
        "plt.show()"
    ])
]

# -----------------------------------------------------------
# 2. RECOMMENDATION MODEL NOTEBOOK
# -----------------------------------------------------------
rec_cells = [
    md_cell([
        "# Content-Based Recommendation System & Profile Evaluation",
        "### Smart Trip Planning System",
        "This notebook implements and benchmarks the machine learning engine:",
        "1. **TF-IDF Vectorization** (`stop_words='english'`, `ngram_range=(1, 2)`)",
        "2. **Cosine Similarity Matrix** between query vector and attraction feature vectors",
        "3. **Multi-Factor Weighted Scoring Equation** incorporating:",
        "   - Interest Match (Content similarity + category direct match)",
        "   - Normalized Rating",
        "   - Budget Suitability",
        "   - Popularity Index",
        "   - Geodesic Distance from Destination Center",
        "4. **Joblib Serialization** to save `recommendation_model.pkl`",
        "5. **Real Testing Across 5 Distinct User Profiles** with calculated Precision@3 benchmark"
    ]),
    code_cell([
        "import os",
        "import re",
        "import math",
        "import joblib",
        "import pandas as pd",
        "import numpy as np",
        "from sklearn.feature_extraction.text import TfidfVectorizer",
        "from sklearn.metrics.pairwise import cosine_similarity",
        "import matplotlib.pyplot as plt",
        "import seaborn as sns",
        "",
        "DATA_DIR = '../data'",
        "MODELS_DIR = '../models'",
        "attractions = pd.read_csv(os.path.join(DATA_DIR, 'attractions.csv'))",
        "print(f'Loaded attractions: {attractions.shape}')"
    ]),
    md_cell(["## 1. Feature Preprocessing & TF-IDF Vectorization"]),
    code_cell([
        "def clean_text(text):",
        "    if not isinstance(text, str): return ''",
        "    text = re.sub(r'[^a-zA-Z0-9\\s]', ' ', text.lower())",
        "    return re.sub(r'\\s+', ' ', text).strip()",
        "",
        "attractions['combined_features'] = attractions.apply(",
        "    lambda r: clean_text(f\"{r['category']} {r['category']} {r['tags']} {r['tags']} {r['description']} {r['indoor_outdoor']}\"),",
        "    axis=1",
        ")",
        "",
        "# Fit TF-IDF Vectorizer with unigrams and bigrams",
        "vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))",
        "tfidf_matrix = vectorizer.fit_transform(attractions['combined_features'])",
        "",
        "print(f'TF-IDF Feature Space Dimensions: {tfidf_matrix.shape}')",
        "print('Sample learned vocabulary tokens:', list(vectorizer.vocabulary_.keys())[:15])"
    ]),
    md_cell(["## 2. Train & Save Model Artifacts with Joblib"]),
    code_cell([
        "os.makedirs(MODELS_DIR, exist_ok=True)",
        "model_data = {",
        "    'vectorizer': vectorizer,",
        "    'tfidf_matrix': tfidf_matrix,",
        "    'attractions_df': attractions",
        "}",
        "joblib_path = os.path.join(MODELS_DIR, 'recommendation_model.pkl')",
        "joblib.dump(model_data, joblib_path)",
        "print(f'Model artifact successfully saved to: {joblib_path}')",
        "",
        "# Verify loading",
        "loaded_data = joblib.load(joblib_path)",
        "assert loaded_data['tfidf_matrix'].shape == tfidf_matrix.shape",
        "print('Verified: Saved model loads cleanly from disk.')"
    ]),
    md_cell(["## 3. Weighted Recommendation Scoring Function"]),
    code_cell([
        "def haversine(lat1, lon1, lat2, lon2):",
        "    R = 6371.0",
        "    dlat = math.radians(lat2 - lat1)",
        "    dlon = math.radians(lon2 - lon1)",
        "    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2",
        "    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))",
        "    return round(R * c, 2)",
        "",
        "def recommend_attractions(destination, interests, budget=15000, days=3, travelers=2, top_k=5):",
        "    df = attractions[attractions['destination'].str.lower() == destination.lower()].copy().reset_index(drop=True)",
        "    if df.empty: return pd.DataFrame()",
        "    ",
        "    dest_center_lat = df['latitude'].mean()",
        "    dest_center_lon = df['longitude'].mean()",
        "    ",
        "    # User query vector",
        "    query_text = ' '.join(interests) + ' ' + ' '.join([f'{i} {i}' for i in interests])",
        "    query_vec = vectorizer.transform([clean_text(query_text)])",
        "    cand_mat = vectorizer.transform(df['combined_features'])",
        "    sim_scores = cosine_similarity(query_vec, cand_mat).flatten()",
        "    ",
        "    est_attr_budget = max(400.0, (budget * 0.20) / max(1, days * 3 * travelers))",
        "    user_ints_lower = [i.lower() for i in interests]",
        "    ",
        "    results = []",
        "    for idx, row in df.iterrows():",
        "        # 1. Interest Match (TF-IDF Similarity + Category Match)",
        "        c_sim = float(sim_scores[idx])",
        "        cat_match = 1.0 if row['category'].lower() in user_ints_lower else 0.2",
        "        interest_score = 0.6 * c_sim + 0.4 * cat_match",
        "        ",
        "        # 2. Rating Factor",
        "        r_score = max(0.0, min(1.0, (row['rating'] - 3.5) / 1.5))",
        "        ",
        "        # 3. Budget Suitability",
        "        price = float(row['price'])",
        "        b_score = 1.0 if price == 0 else max(0.2, 1.0 - min(1.0, price / (est_attr_budget * 2)))",
        "        ",
        "        # 4. Popularity",
        "        pop_score = max(0.0, min(1.0, (row['popularity'] - 50) / 50))",
        "        ",
        "        # 5. Distance Factor",
        "        dist_km = haversine(dest_center_lat, dest_center_lon, row['latitude'], row['longitude'])",
        "        dist_score = max(0.2, 1.0 - min(1.0, dist_km / 30.0))",
        "        ",
        "        # Final Weighted Score",
        "        final_score = (",
        "            0.40 * interest_score +",
        "            0.20 * r_score +",
        "            0.15 * b_score +",
        "            0.15 * pop_score +",
        "            0.10 * dist_score",
        "        )",
        "        ",
        "        results.append({",
        "            'Name': row['name'],",
        "            'Category': row['category'],",
        "            'Rating': row['rating'],",
        "            'Price': row['price'],",
        "            'Distance_km': dist_km,",
        "            'Interest_Match_%': round(interest_score * 100, 1),",
        "            'Score_%': round(final_score * 100, 1)",
        "        })",
        "    ",
        "    res_df = pd.DataFrame(results)",
        "    return res_df.sort_values(by='Score_%', ascending=False).reset_index(drop=True).head(top_k)"
    ]),
    md_cell(["## 4. Model Evaluation with 5 Distinct User Profiles"]),
    code_cell([
        "test_profiles = [",
        "    {'Profile': 'Profile 1: Adventure & Nature Couple', 'Destination': 'Ooty', 'Interests': ['Nature', 'Adventure', 'Photography'], 'Budget': 15000, 'Days': 3, 'Travelers': 2},",
        "    {'Profile': 'Profile 2: Beach & Culture Group', 'Destination': 'Goa', 'Interests': ['Beach', 'Culture', 'Historical'], 'Budget': 25000, 'Days': 4, 'Travelers': 3},",
        "    {'Profile': 'Profile 3: Royal Heritage Solo Traveler', 'Destination': 'Jaipur', 'Interests': ['Historical', 'Museum', 'Photography'], 'Budget': 18000, 'Days': 3, 'Travelers': 1},",
        "    {'Profile': 'Profile 4: Spiritual Pilgrim', 'Destination': 'Varanasi', 'Interests': ['Temple', 'Culture'], 'Budget': 10000, 'Days': 2, 'Travelers': 2},",
        "    {'Profile': 'Profile 5: Snow & Trekking Explorer', 'Destination': 'Manali', 'Interests': ['Adventure', 'Nature'], 'Budget': 20000, 'Days': 4, 'Travelers': 2}",
        "]",
        "",
        "summary_rows = []",
        "for p in test_profiles:",
        "    recs = recommend_attractions(p['Destination'], p['Interests'], p['Budget'], p['Days'], p['Travelers'], top_k=3)",
        "    user_ints_lower = set([i.lower() for i in p['Interests']])",
        "    rel_count = sum(recs['Category'].str.lower().isin(user_ints_lower))",
        "    p_at_3 = rel_count / len(recs) if len(recs) > 0 else 0.0",
        "    ",
        "    top_pick = recs.iloc[0]['Name'] if len(recs) > 0 else 'N/A'",
        "    top_score = recs.iloc[0]['Score_%'] if len(recs) > 0 else 0.0",
        "    ",
        "    summary_rows.append({",
        "        'Profile': p['Profile'],",
        "        'Destination': p['Destination'],",
        "        'Interests': ', '.join(p['Interests']),",
        "        'Top Pick': top_pick,",
        "        'Top Score (%)': top_score,",
        "        'Precision@3': round(p_at_3, 2)",
        "    })",
        "",
        "summary_benchmark = pd.DataFrame(summary_rows)",
        "summary_benchmark"
    ]),
    md_cell(["## 5. Visualizing Benchmark Comparison Across Profiles"]),
    code_cell([
        "plt.figure(figsize=(10, 5))",
        "palette = sns.color_palette('crest', len(summary_benchmark))",
        "bars = plt.bar(summary_benchmark['Destination'], summary_benchmark['Top Score (%)'], color=palette, edgecolor='black')",
        "plt.title('Top Recommendation Score by Destination Profile', fontsize=14, fontweight='bold', pad=12)",
        "plt.xlabel('Destination & User Context', fontsize=11)",
        "plt.ylabel('Top Attraction Score (%)', fontsize=11)",
        "plt.ylim(50, 100)",
        "for bar in bars:",
        "    y = bar.get_height()",
        "    plt.text(bar.get_x() + bar.get_width()/2.0, y + 1.0, f'{y:.1f}%', ha='center', fontweight='bold', fontsize=10)",
        "plt.tight_layout()",
        "plt.show()"
    ])
]

# Write out valid .ipynb JSON files
with open(os.path.join(NOTEBOOKS_DIR, "eda.ipynb"), "w", encoding="utf-8") as f:
    json.dump(make_notebook(eda_cells), f, indent=2)

with open(os.path.join(NOTEBOOKS_DIR, "recommendation_model.ipynb"), "w", encoding="utf-8") as f:
    json.dump(make_notebook(rec_cells), f, indent=2)

print("[Notebooks] Successfully regenerated eda.ipynb and recommendation_model.ipynb with complete Data Science specifications.")
