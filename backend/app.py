import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from database.database import init_db, get_db_connection
from services.recommendation import recommendation_engine
from services.itinerary import generate_itinerary
from services.budget import calculate_budget
from services.route import optimize_route_nearest_neighbor
from services.weather import get_weather_for_destination
from services.analytics import get_travel_analytics
from services.osm import fetch_osm_attractions

app = Flask(__name__)
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "*"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

with app.app_context():
    init_db()

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Smart Trip Planning & Recommendation API",
        "version": "1.0.0"
    })

@app.route("/api/destinations", methods=["GET"])
def get_destinations():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM destinations ORDER BY name ASC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route("/api/destinations/<destination>", methods=["GET"])
def get_destination_details(destination):
    conn = get_db_connection()
    dest = conn.execute("SELECT * FROM destinations WHERE LOWER(name) = ?", (destination.lower(),)).fetchone()
    if not dest:
        conn.close()
        return jsonify({"error": "Destination not found"}), 404

    attractions = conn.execute("SELECT * FROM attractions WHERE LOWER(destination) = ?", (destination.lower(),)).fetchall()
    hotels = conn.execute("SELECT * FROM hotels WHERE LOWER(destination) = ?", (destination.lower(),)).fetchall()
    restaurants = conn.execute("SELECT * FROM restaurants WHERE LOWER(destination) = ?", (destination.lower(),)).fetchall()
    transport = conn.execute("SELECT * FROM transport WHERE LOWER(destination) = ?", (destination.lower(),)).fetchall()
    conn.close()

    return jsonify({
        "destination": dict(dest),
        "attractions": [dict(a) for a in attractions],
        "hotels": [dict(h) for h in hotels],
        "restaurants": [dict(r) for r in restaurants],
        "transport": [dict(t) for t in transport]
    })

@app.route("/api/attractions", methods=["GET"])
def get_attractions():
    destination = request.args.get("destination")
    category = request.args.get("category")

    if destination:
        osm_result = fetch_osm_attractions(destination)
        attractions = osm_result.get("attractions", [])

        if category:
            attractions = [
                a for a in attractions
                if category.lower() in a.get("category", "").lower()
            ]
            osm_result["attractions"] = attractions
            osm_result["count"] = len(attractions)

        return jsonify(osm_result)

    conn = get_db_connection()
    query = "SELECT * FROM attractions WHERE 1=1"
    params = []
    if category:
        query += " AND LOWER(category) = ?"
        params.append(category.lower())
    query += " ORDER BY rating DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route("/api/hotels", methods=["GET"])
def get_hotels():
    destination = request.args.get("destination")
    conn = get_db_connection()
    if destination:
        rows = conn.execute("SELECT * FROM hotels WHERE LOWER(destination) = ? ORDER BY rating DESC", (destination.lower(),)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM hotels ORDER BY rating DESC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route("/api/restaurants", methods=["GET"])
def get_restaurants():
    destination = request.args.get("destination")
    conn = get_db_connection()
    if destination:
        rows = conn.execute("SELECT * FROM restaurants WHERE LOWER(destination) = ? ORDER BY rating DESC", (destination.lower(),)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM restaurants ORDER BY rating DESC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

from services.osm import fetch_osm_attractions, resolve_destination, autocomplete_destinations

@app.route("/api/destinations/resolve", methods=["GET"])
def resolve_destination_endpoint():
    q = request.args.get("q") or request.args.get("destination")
    if not q or not q.strip():
        return jsonify({"resolved": False, "error": "Destination parameter is required."}), 400

    resolved = resolve_destination(q)
    if not resolved:
        return jsonify({
            "resolved": False,
            "error": "Destination not found. Please enter a valid city or destination."
        }), 404

    return jsonify({
        "resolved": True,
        "destination": resolved
    })

@app.route("/api/destinations/autocomplete", methods=["GET"])
def autocomplete_destinations_endpoint():
    q = request.args.get("q", "")
    suggestions = autocomplete_destinations(q, limit=5)
    return jsonify(suggestions)

@app.route("/api/recommendations", methods=["POST"])
def get_recommendations():
    """
    POST /api/recommendations
    {
      "destination": "Ooty",
      "budget": 15000,
      "days": 3,
      "travelers": 2,
      "interests": ["Nature", "Adventure", "Photography"]
    }
    """
    data = request.get_json() or {}
    destination = data.get("destination", "Ooty")
    budget = float(data.get("budget", 15000))
    days = int(data.get("days", 3))
    travelers = int(data.get("travelers", 2))
    interests = data.get("interests", ["Nature", "Adventure"])

    # Resolve destination coordinates & display name dynamically
    resolved = resolve_destination(destination)
    if not resolved:
        return jsonify({"error": "Destination not found. Please enter a valid city or destination."}), 404

    dest_meta = {
        "name": resolved["name"],
        "display_name": resolved.get("display_name", resolved["name"]),
        "latitude": resolved["latitude"],
        "longitude": resolved["longitude"]
    }

    weather_info = get_weather_for_destination(resolved["name"])
    weather_cond = weather_info.get("condition", "Sunny")

    recommended_attractions = recommendation_engine.recommend(
        destination=resolved["name"],
        budget=budget,
        days=days,
        travelers=travelers,
        interests=interests,
        weather_condition=weather_cond
    )

    return jsonify({
        "destination": dest_meta,
        "weather": weather_info,
        "input_parameters": {
            "budget": budget,
            "days": days,
            "travelers": travelers,
            "interests": interests
        },
        "total_recommended": len(recommended_attractions),
        "recommended_attractions": recommended_attractions
    })

@app.route("/api/itinerary", methods=["POST"])
def create_itinerary():
    """
    POST /api/itinerary
    {
      "destination": "Ooty",
      "attractions": [...],
      "days": 3,
      "available_hours_per_day": 9
    }
    """
    data = request.get_json() or {}
    destination = data.get("destination", "Ooty")
    attractions = data.get("attractions", [])
    days = int(data.get("days", 3))
    hours = float(data.get("available_hours_per_day", 9.0))

    itinerary_result = generate_itinerary(
        destination=destination,
        selected_attractions=attractions,
        days=days,
        available_hours_per_day=hours
    )
    return jsonify(itinerary_result)

@app.route("/api/budget", methods=["POST"])
def get_budget():
    """
    POST /api/budget
    {
      "destination": "Ooty",
      "budget": 15000,
      "days": 3,
      "travelers": 2,
      "selected_attractions": [...],
      "hotel_id": 2,
      "transport_type": "Auto Rickshaw"
    }
    """
    data = request.get_json() or {}
    destination = data.get("destination", "Ooty")
    budget = float(data.get("budget", 15000))
    days = int(data.get("days", 3))
    travelers = int(data.get("travelers", 2))
    selected_attractions = data.get("selected_attractions", [])
    hotel_id = data.get("hotel_id")
    transport_type = data.get("transport_type")

    budget_result = calculate_budget(
        destination=destination,
        user_budget=budget,
        days=days,
        travelers=travelers,
        selected_attractions=selected_attractions,
        hotel_id=hotel_id,
        transport_type=transport_type
    )
    return jsonify(budget_result)

@app.route("/api/weather/<destination>", methods=["GET"])
def get_weather(destination):
    weather_data = get_weather_for_destination(destination)
    return jsonify(weather_data)

@app.route("/api/route", methods=["POST"])
def optimize_route():
    """
    POST /api/route
    {
      "attractions": [ {"latitude": ..., "longitude": ...}, ... ],
      "start_point": {"latitude": ..., "longitude": ...}
    }
    """
    data = request.get_json() or {}
    attractions = data.get("attractions", [])
    start_point = data.get("start_point")
    route_result = optimize_route_nearest_neighbor(attractions, start_point=start_point)
    return jsonify(route_result)

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    analytics_data = get_travel_analytics()
    return jsonify(analytics_data)

@app.route("/api/itineraries/save", methods=["POST"])
def save_itinerary():
    """Save user-customized itinerary into SQLite database."""
    data = request.get_json() or {}
    title = data.get("title", "My Smart Trip")
    destination = data.get("destination", "Ooty")
    budget = float(data.get("budget", 0))
    travelers = int(data.get("travelers", 1))
    days = int(data.get("days", 1))
    interests = json.dumps(data.get("interests", []))
    itinerary_data = json.dumps(data.get("itinerary_data", {}))
    total_cost = float(data.get("total_cost", 0))

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO itineraries (title, destination, budget, travelers, days, interests, itinerary_data, total_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (title, destination, budget, travelers, days, interests, itinerary_data, total_cost))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({"success": True, "itinerary_id": new_id, "message": "Itinerary saved successfully!"})

@app.route("/api/itineraries", methods=["GET"])
def list_saved_itineraries():
    """Retrieve saved itineraries from SQLite."""
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM itineraries ORDER BY created_at DESC LIMIT 20").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["interests"] = json.loads(d["interests"])
            d["itinerary_data"] = json.loads(d["itinerary_data"])
        except Exception:
            pass
        result.append(d)
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting Flask Server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
