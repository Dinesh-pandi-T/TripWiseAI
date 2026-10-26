import pandas as pd
from database.database import get_db_connection

def get_travel_analytics():
    """
    Compute comprehensive Data Science metrics and chart aggregations from the datasets.
    """
    conn = get_db_connection()
    dest_df = pd.read_sql_query("SELECT * FROM destinations", conn)
    att_df = pd.read_sql_query("SELECT * FROM attractions", conn)
    hotel_df = pd.read_sql_query("SELECT * FROM hotels", conn)
    rest_df = pd.read_sql_query("SELECT * FROM restaurants", conn)
    conn.close()

    # 1. Most Popular Destinations & Overall Stats
    dest_stats = []
    for _, d in dest_df.iterrows():
        d_name = d["name"]
        d_atts = att_df[att_df["destination"].str.lower() == d_name.lower()]
        avg_pop = round(d_atts["popularity"].mean(), 1) if not d_atts.empty else 75.0
        avg_rating = round(d_atts["rating"].mean(), 2) if not d_atts.empty else 4.5
        dest_stats.append({
            "name": d_name,
            "popularity": avg_pop,
            "attraction_count": len(d_atts),
            "avg_daily_budget": float(d["avg_daily_budget"]),
            "avg_rating": avg_rating
        })
    dest_stats.sort(key=lambda x: x["popularity"], reverse=True)

    # 2. Average Ratings Across Categories
    cat_group = att_df.groupby("category").agg(
        count=("id", "count"),
        avg_rating=("rating", "mean"),
        avg_price=("price", "mean"),
        avg_popularity=("popularity", "mean")
    ).reset_index()

    category_distribution = []
    total_atts = len(att_df)
    for _, row in cat_group.iterrows():
        category_distribution.append({
            "category": row["category"],
            "count": int(row["count"]),
            "percentage": round((row["count"] / total_atts) * 100, 1),
            "avg_rating": round(row["avg_rating"], 2),
            "avg_price": round(row["avg_price"], 1),
            "avg_popularity": round(row["avg_popularity"], 1)
        })
    category_distribution.sort(key=lambda x: x["count"], reverse=True)

    # 3. Average Price by Destination (Attractions vs Hotels vs Restaurants)
    price_by_dest = []
    for _, d in dest_df.iterrows():
        d_name = d["name"]
        d_atts = att_df[att_df["destination"].str.lower() == d_name.lower()]
        d_hotels = hotel_df[hotel_df["destination"].str.lower() == d_name.lower()]
        d_rests = rest_df[rest_df["destination"].str.lower() == d_name.lower()]

        avg_att_price = round(d_atts["price"].mean(), 1) if not d_atts.empty else 0.0
        avg_hotel_price = round(d_hotels["price_per_night"].mean(), 1) if not d_hotels.empty else 0.0
        avg_food_price = round(d_rests["average_cost"].mean(), 1) if not d_rests.empty else 0.0

        price_by_dest.append({
            "destination": d_name,
            "avg_attraction_fee": avg_att_price,
            "avg_hotel_night": avg_hotel_price,
            "avg_meal_cost": avg_food_price,
            "avg_daily_budget": float(d["avg_daily_budget"])
        })

    # 4. Rating Distribution Bins
    rating_bins = [
        {"range": "4.0 - 4.2", "count": int(((att_df["rating"] >= 4.0) & (att_df["rating"] < 4.3)).sum())},
        {"range": "4.3 - 4.5", "count": int(((att_df["rating"] >= 4.3) & (att_df["rating"] < 4.6)).sum())},
        {"range": "4.6 - 4.7", "count": int(((att_df["rating"] >= 4.6) & (att_df["rating"] < 4.8)).sum())},
        {"range": "4.8 - 5.0", "count": int((att_df["rating"] >= 4.8).sum())}
    ]

    # 5. Recommendation Score Distribution (simulated across queries)
    score_bins = [
        {"range": "50 - 60%", "count": 4},
        {"range": "60 - 70%", "count": 12},
        {"range": "70 - 80%", "count": 18},
        {"range": "80 - 90%", "count": 10},
        {"range": "90 - 100%", "count": 4}
    ]

    # 6. Summary KPI metrics
    summary = {
        "total_destinations": len(dest_df),
        "total_attractions": len(att_df),
        "total_hotels": len(hotel_df),
        "total_restaurants": len(rest_df),
        "average_attraction_rating": round(att_df["rating"].mean(), 2),
        "average_attraction_price": round(att_df["price"].mean(), 2),
        "free_attractions_count": int((att_df["price"] == 0).sum())
    }

    return {
        "summary": summary,
        "popular_destinations": dest_stats,
        "category_distribution": category_distribution,
        "price_by_destination": price_by_dest,
        "rating_distribution": rating_bins,
        "score_distribution": score_bins
    }
