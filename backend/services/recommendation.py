import os
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.database import get_db_connection
from utils.preprocessing import create_combined_features, clean_text, haversine_distance, min_max_scale

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "recommendation_model.pkl")

class RecommendationEngine:
    def __init__(self):
        self.vectorizer = None
        self.tfidf_matrix = None
        self.attractions_df = None
        self.load_or_train()

    def train(self):
        """Fit TF-IDF Vectorizer on attractions dataset and save serialized artifacts."""
        conn = get_db_connection()
        self.attractions_df = pd.read_sql_query("SELECT * FROM attractions", conn)
        conn.close()

        if self.attractions_df.empty:
            print("[RecommendationEngine] No attractions found in DB!")
            return

        self.attractions_df["combined_features"] = self.attractions_df.apply(create_combined_features, axis=1)

        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.tfidf_matrix = self.vectorizer.fit_transform(self.attractions_df["combined_features"])

        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        model_data = {
            "vectorizer": self.vectorizer,
            "tfidf_matrix": self.tfidf_matrix,
            "attractions_df": self.attractions_df
        }
        joblib.dump(model_data, MODEL_PATH)
        print(f"[RecommendationEngine] Model successfully trained on {len(self.attractions_df)} attractions and saved.")

    def load_or_train(self):
        """Load trained model from disk or train if not present."""
        if os.path.exists(MODEL_PATH):
            try:
                data = joblib.load(MODEL_PATH)
                self.vectorizer = data["vectorizer"]
                self.tfidf_matrix = data["tfidf_matrix"]
                self.attractions_df = data["attractions_df"]
                print("[RecommendationEngine] Loaded saved TF-IDF recommendation model.")
                return
            except Exception as e:
                print(f"[RecommendationEngine] Error loading model: {e}. Retraining...")
        self.train()

    def recommend(self, destination, budget=10000, days=3, travelers=2, interests=None, weather_condition="Sunny"):
        """
        Generate personalized attraction recommendations using TF-IDF cosine similarity
        combined with multi-factor weighted scoring for real-world OpenStreetMap attractions.
        """
        if self.vectorizer is None or self.attractions_df is None:
            self.load_or_train()

        interests = interests or []

        # 1. Fetch real-world live attractions via OpenStreetMap / Overpass API
        osm_candidates = []
        try:
            from services.osm import fetch_osm_attractions
            osm_res = fetch_osm_attractions(destination)
            osm_candidates = osm_res.get("attractions", [])
        except Exception as e:
            print(f"[RecommendationEngine] Error fetching OSM attractions: {e}")

        if osm_candidates:
            # Build dynamic candidate DataFrame from live OpenStreetMap data
            records = []
            for i, att in enumerate(osm_candidates):
                cat = att.get("category", "Attraction")
                addr = att.get("address") or ""
                records.append({
                    "id": i + 1,
                    "osm_id": att.get("id"),
                    "name": att.get("name"),
                    "destination": destination,
                    "category": cat,
                    "description": f"Real-world {cat.lower()} in {destination}. {addr}".strip(),
                    "rating": 4.6,
                    "price": 0.0 if not att.get("fee") or att.get("fee") == "no" else 150.0,
                    "duration": 2.0,
                    "popularity": 85,
                    "latitude": float(att.get("latitude") or 0.0),
                    "longitude": float(att.get("longitude") or 0.0),
                    "indoor_outdoor": "indoor" if cat in ["Museum", "Artwork", "Gallery"] else "outdoor",
                    "tags": f"{cat} {destination}",
                    "address": att.get("address"),
                    "opening_hours": att.get("opening_hours"),
                    "fee": att.get("fee"),
                    "website": att.get("website"),
                    "source": "OpenStreetMap"
                })
            df = pd.DataFrame(records)
        else:
            # Fallback to database attractions if OSM returned empty
            df = self.attractions_df.copy()
            if destination and destination.lower() != "all":
                df = df[df["destination"].str.lower() == destination.lower()].copy()

        if df.empty:
            return []

        # Get destination center point for relative distance calculation
        dest_center_lat = df["latitude"].mean()
        dest_center_lon = df["longitude"].mean()

        # Build user profile query string
        user_query_text = " ".join(interests) + " " + " ".join([f"{i} {i}" for i in interests])
        cleaned_user_query = clean_text(user_query_text)
        
        # Calculate TF-IDF Cosine Similarity
        if cleaned_user_query:
            user_vec = self.vectorizer.transform([cleaned_user_query])
            candidate_texts = [
                clean_text(f"{row['category']} {row['name']} {row.get('description', '')} {row.get('tags', '')}")
                for _, row in df.iterrows()
            ]
            candidate_vectors = self.vectorizer.transform(candidate_texts)
            content_sim = cosine_similarity(user_vec, candidate_vectors).flatten()
        else:
            content_sim = np.full(len(df), 0.5)

        # Budget allocation per attraction estimate
        est_attraction_budget = max(500, (budget * 0.20) / max(1, days * 3 * travelers))

        recommendations = []
        is_rainy = any(w in weather_condition.lower() for w in ["rain", "storm", "drizzle", "shower"])

        weights = {
            "content": 0.30,
            "category": 0.25,
            "rating": 0.15,
            "budget": 0.10,
            "popularity": 0.10,
            "weather": 0.10
        }

        user_interests_lower = [i.lower() for i in interests]

        for idx, (_, row) in enumerate(df.iterrows()):
            # 1. Content Similarity Score [0, 1]
            c_score = float(content_sim[idx])

            # 2. Category Direct Match Score [0, 1]
            cat_score = 1.0 if row["category"].lower() in user_interests_lower else 0.2

            # 3. Rating Score [0, 1] (ratings range typically 4.0 - 5.0)
            r_val = float(row.get("rating", 4.0))
            r_score = min_max_scale(r_val, 3.5, 5.0)

            # 4. Budget Suitability Score [0, 1]
            price = float(row.get("price", 0))
            if price == 0:
                b_score = 1.0
            else:
                b_score = max(0.2, 1.0 - min(1.0, price / (est_attraction_budget * 2)))

            # 5. Popularity Score [0, 1]
            pop_val = float(row.get("popularity", 75))
            pop_score = min_max_scale(pop_val, 50, 100)

            # 6. Weather Suitability Score [0, 1]
            indoor_outdoor = str(row.get("indoor_outdoor", "outdoor")).lower()
            if is_rainy:
                w_score = 1.0 if indoor_outdoor == "indoor" else 0.4
            else:
                w_score = 0.9 if indoor_outdoor == "outdoor" else 0.7

            # 7. Distance from Destination Center
            dist_km = haversine_distance(dest_center_lat, dest_center_lon, row["latitude"], row["longitude"])

            # Composite Transparent Weighted Score
            total_score = (
                weights["content"] * c_score +
                weights["category"] * cat_score +
                weights["rating"] * r_score +
                weights["budget"] * b_score +
                weights["popularity"] * pop_score +
                weights["weather"] * w_score
            )
            score_pct = round(total_score * 100, 1)

            rec_item = {
                "id": int(row["id"]),
                "name": str(row["name"]),
                "destination": str(row["destination"]),
                "category": str(row["category"]),
                "description": str(row["description"]),
                "rating": r_val,
                "price": price,
                "duration": float(row.get("duration", 2.0)),
                "popularity": int(pop_val),
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "indoor_outdoor": indoor_outdoor,
                "tags": str(row.get("tags", "")),
                "address": None if pd.isna(row.get("address")) else str(row.get("address")),
                "opening_hours": None if pd.isna(row.get("opening_hours")) else str(row.get("opening_hours")),
                "fee": None if pd.isna(row.get("fee")) else str(row.get("fee")),
                "website": None if pd.isna(row.get("website")) else str(row.get("website")),
                "source": str(row.get("source", "OpenStreetMap")),
                "distance": dist_km,
                "recommendation_score": score_pct,
                "score_breakdown": {
                    "content_similarity": round(c_score * 100, 1),
                    "category_match": round(cat_score * 100, 1),
                    "rating_factor": round(r_score * 100, 1),
                    "budget_suitability": round(b_score * 100, 1),
                    "popularity_factor": round(pop_score * 100, 1),
                    "weather_fit": round(w_score * 100, 1)
                }
            }
            recommendations.append(rec_item)

        # Sort by recommendation score descending
        recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)
        return recommendations

# Global singleton
recommendation_engine = RecommendationEngine()
