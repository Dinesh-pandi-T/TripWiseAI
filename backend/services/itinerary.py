import os
import math
import pandas as pd
from services.route import optimize_route_nearest_neighbor
from database.database import get_db_connection

def generate_itinerary(destination, selected_attractions, days=3, available_hours_per_day=9.0):
    """
    Generate a practical, time-budgeted day-by-day itinerary.
    Inputs:
      destination: string
      selected_attractions: list of attraction dicts (or loaded from DB if empty)
      days: int
      available_hours_per_day: float (default 9 hrs from 09:00 to 18:00)
    """
    conn = get_db_connection()
    
    # If no attractions provided, pick top attractions for this destination
    if not selected_attractions:
        att_df = pd.read_sql_query(
            "SELECT * FROM attractions WHERE LOWER(destination) = ? ORDER BY rating DESC, popularity DESC",
            conn, params=(destination.lower(),)
        )
        selected_attractions = att_df.to_dict(orient="records")

    # Fetch top hotels and restaurants for this destination
    hotels_df = pd.read_sql_query(
        "SELECT * FROM hotels WHERE LOWER(destination) = ? ORDER BY rating DESC LIMIT 3",
        conn, params=(destination.lower(),)
    )
    top_hotels = hotels_df.to_dict(orient="records")

    rest_df = pd.read_sql_query(
        "SELECT * FROM restaurants WHERE LOWER(destination) = ? ORDER BY rating DESC LIMIT 6",
        conn, params=(destination.lower(),)
    )
    top_restaurants = rest_df.to_dict(orient="records")
    conn.close()

    if not selected_attractions:
        return {"days": [], "total_attractions": 0, "total_travel_time_mins": 0}

    # First optimize overall route ordering
    route_result = optimize_route_nearest_neighbor(selected_attractions)
    ordered_pool = list(route_result["ordered_attractions"])

    # Distribute attractions across days
    # Target 2 to 3 attractions per day
    num_attractions = len(ordered_pool)
    per_day_target = max(1, math.ceil(num_attractions / days))

    itinerary_days = []
    pool_idx = 0
    total_trip_travel_mins = 0

    chosen_hotel = top_hotels[0] if top_hotels else {
        "name": f"Comfort Stay {destination}",
        "price_per_night": 3500,
        "rating": 4.5,
        "latitude": ordered_pool[0]["latitude"] if ordered_pool else 0.0,
        "longitude": ordered_pool[0]["longitude"] if ordered_pool else 0.0
    }

    for day_num in range(1, days + 1):
        day_attractions = []
        accumulated_hours = 0.0

        # Greedily allocate attractions up to per_day_target or available hours
        while pool_idx < num_attractions and len(day_attractions) < per_day_target:
            candidate = ordered_pool[pool_idx]
            dur = float(candidate.get("duration", 2.0))
            if accumulated_hours + dur <= available_hours_per_day or len(day_attractions) == 0:
                day_attractions.append(candidate)
                accumulated_hours += dur
                pool_idx += 1
            else:
                break

        # Optimize route for this specific day
        day_route = optimize_route_nearest_neighbor(day_attractions, start_point=chosen_hotel)
        ordered_day_attractions = day_route["ordered_attractions"]
        day_travel_mins = day_route["estimated_travel_time_mins"]
        total_trip_travel_mins += day_travel_mins

        # Build timetable slots starting at 09:00 AM
        current_time_minutes = 9 * 60  # 09:00 AM
        schedule_slots = []

        lunch_assigned = False
        rest_idx = (day_num - 1) % len(top_restaurants) if top_restaurants else 0
        lunch_spot = top_restaurants[rest_idx] if top_restaurants else {
            "name": f"Local Cuisine Delight {destination}",
            "cuisine": "Regional Specialties",
            "average_cost": 400,
            "rating": 4.5,
            "latitude": ordered_day_attractions[0]["latitude"] if ordered_day_attractions else 0.0,
            "longitude": ordered_day_attractions[0]["longitude"] if ordered_day_attractions else 0.0
        }

        for i, att in enumerate(ordered_day_attractions):
            # Check if it's lunch time (~12:30 to 14:00) and lunch has not been inserted
            if current_time_minutes >= (12 * 60 + 30) and not lunch_assigned:
                lunch_start_str = f"{current_time_minutes // 60:02d}:{current_time_minutes % 60:02d}"
                current_time_minutes += 60  # 1 hour lunch
                lunch_end_str = f"{current_time_minutes // 60:02d}:{current_time_minutes % 60:02d}"
                schedule_slots.append({
                    "type": "restaurant",
                    "time": f"{lunch_start_str} - {lunch_end_str}",
                    "title": f"Lunch at {lunch_spot['name']}",
                    "details": f"Cuisine: {lunch_spot.get('cuisine', 'Local')}, Avg Cost: ₹{lunch_spot.get('average_cost', 400)}",
                    "rating": lunch_spot.get("rating", 4.5),
                    "latitude": lunch_spot.get("latitude"),
                    "longitude": lunch_spot.get("longitude")
                })
                lunch_assigned = True

            start_str = f"{current_time_minutes // 60:02d}:{current_time_minutes % 60:02d}"
            dur_mins = int(float(att.get("duration", 2.0)) * 60)
            current_time_minutes += dur_mins
            end_str = f"{current_time_minutes // 60:02d}:{current_time_minutes % 60:02d}"

            schedule_slots.append({
                "type": "attraction",
                "time": f"{start_str} - {end_str}",
                "attraction_id": att["id"],
                "title": att["name"],
                "category": att["category"],
                "duration": att.get("duration", 2.0),
                "price": att.get("price", 0),
                "rating": att.get("rating", 4.5),
                "recommendation_score": att.get("recommendation_score", 85),
                "latitude": att["latitude"],
                "longitude": att["longitude"],
                "details": att.get("description", "")
            })

            # Add short buffer/travel between attractions
            current_time_minutes += 30

        # If lunch wasn't inserted yet and there were slots, insert now
        if not lunch_assigned and len(schedule_slots) > 1:
            schedule_slots.insert(1, {
                "type": "restaurant",
                "time": "13:00 - 14:00",
                "title": f"Lunch at {lunch_spot['name']}",
                "details": f"Cuisine: {lunch_spot.get('cuisine', 'Local')}, Avg Cost: ₹{lunch_spot.get('average_cost', 400)}",
                "rating": lunch_spot.get("rating", 4.5),
                "latitude": lunch_spot.get("latitude"),
                "longitude": lunch_spot.get("longitude")
            })

        # Evening Hotel Check-in / Relaxation
        evening_str = f"{max(18, current_time_minutes // 60):02d}:00"
        schedule_slots.append({
            "type": "hotel",
            "time": f"{evening_str} onwards",
            "title": f"Return & Rest at {chosen_hotel['name']}",
            "details": f"Amenities: {chosen_hotel.get('amenities', 'Wifi, Pool')}, Rating: {chosen_hotel.get('rating', 4.5)} ★",
            "price_per_night": chosen_hotel.get("price_per_night", 3500),
            "latitude": chosen_hotel.get("latitude"),
            "longitude": chosen_hotel.get("longitude")
        })

        itinerary_days.append({
            "day": day_num,
            "date_label": f"Day {day_num}",
            "slots": schedule_slots,
            "attractions": ordered_day_attractions,
            "day_distance_km": day_route["total_distance_km"],
            "day_travel_time_mins": day_travel_mins,
            "route_polyline": day_route["route_polyline"]
        })

    return {
        "destination": destination,
        "days": itinerary_days,
        "hotel": chosen_hotel,
        "total_attractions": len(selected_attractions),
        "total_travel_distance_km": round(sum(d["day_distance_km"] for d in itinerary_days), 2),
        "total_travel_time_mins": total_trip_travel_mins
    }
