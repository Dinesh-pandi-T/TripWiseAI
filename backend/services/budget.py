import math
import pandas as pd
from database.database import get_db_connection

def calculate_budget(destination, user_budget=15000, days=3, travelers=2, selected_attractions=None, hotel_id=None, transport_type=None):
    """
    Compute itemized trip budget, compare with user target, and generate saving suggestions if exceeded.
    """
    conn = get_db_connection()
    
    # 1. Hotel Cost Calculation
    rooms_needed = math.ceil(travelers / 2)
    nights = max(1, days - 1)

    if hotel_id:
        hotel_row = conn.execute("SELECT * FROM hotels WHERE id = ?", (hotel_id,)).fetchone()
    else:
        # Default to a mid-range or budget hotel matching user budget per day
        budget_per_night = (user_budget * 0.35) / nights
        hotel_row = conn.execute(
            """SELECT * FROM hotels 
               WHERE LOWER(destination) = ? 
               ORDER BY ABS(price_per_night - ?) ASC LIMIT 1""",
            (destination.lower(), budget_per_night)
        ).fetchone()

    hotel_price_per_night = float(hotel_row["price_per_night"]) if hotel_row else 3000.0
    hotel_name = hotel_row["name"] if hotel_row else "Standard Hotel"
    hotel_total = hotel_price_per_night * nights * rooms_needed

    # 2. Food Cost Calculation
    # Fetch average restaurant cost for destination
    avg_food_row = conn.execute(
        "SELECT AVG(average_cost) as avg_cost FROM restaurants WHERE LOWER(destination) = ?",
        (destination.lower(),)
    ).fetchone()
    avg_meal_cost = float(avg_food_row["avg_cost"]) if (avg_food_row and avg_food_row["avg_cost"]) else 450.0
    food_total = avg_meal_cost * 3 * days * travelers

    # 3. Transport Cost Calculation
    if transport_type:
        trans_row = conn.execute(
            "SELECT * FROM transport WHERE LOWER(destination) = ? AND LOWER(transport_type) = ?",
            (destination.lower(), transport_type.lower())
        ).fetchone()
    else:
        trans_row = conn.execute(
            "SELECT * FROM transport WHERE LOWER(destination) = ? ORDER BY average_cost ASC LIMIT 1",
            (destination.lower(),)
        ).fetchone()

    daily_trans_cost = float(trans_row["average_cost"]) if trans_row else 800.0
    trans_name = trans_row["transport_type"] if trans_row else "Local Transport"
    transport_total = daily_trans_cost * days

    # 4. Attractions Entry Fees
    attraction_total = 0.0
    if selected_attractions:
        for att in selected_attractions:
            attraction_total += float(att.get("price", 0)) * travelers
    else:
        # Average fees for top 6 attractions
        avg_att_row = conn.execute(
            "SELECT AVG(price) as avg_p FROM attractions WHERE LOWER(destination) = ?",
            (destination.lower(),)
        ).fetchone()
        avg_price = float(avg_att_row["avg_p"]) if (avg_att_row and avg_att_row["avg_p"]) else 100.0
        attraction_total = avg_price * min(6, days * 2) * travelers

    # 5. Miscellaneous (10% buffer)
    subtotal = hotel_total + food_total + transport_total + attraction_total
    misc_total = round(subtotal * 0.10, 2)

    total_estimated_cost = round(subtotal + misc_total, 2)
    remaining_budget = round(user_budget - total_estimated_cost, 2)

    # Status & Warnings
    if remaining_budget < 0:
        budget_status = "Exceeded Budget"
        status_color = "red"
        warning = f"Estimated trip cost exceeds your budget by ₹{abs(remaining_budget):,.2f}."
    elif remaining_budget <= (user_budget * 0.15):
        budget_status = "Near Limit"
        status_color = "yellow"
        warning = f"Estimated cost is close to your limit. Remaining cushion: ₹{remaining_budget:,.2f}."
    else:
        budget_status = "Within Budget"
        status_color = "green"
        warning = None

    # Intelligent Cost-Saving Suggestions
    suggestions = []
    if remaining_budget < 0:
        # Check cheaper hotel
        cheaper_hotel = conn.execute(
            "SELECT * FROM hotels WHERE LOWER(destination) = ? AND price_per_night < ? ORDER BY price_per_night ASC LIMIT 1",
            (destination.lower(), hotel_price_per_night)
        ).fetchone()
        if cheaper_hotel:
            savings = (hotel_price_per_night - cheaper_hotel["price_per_night"]) * nights * rooms_needed
            suggestions.append({
                "category": "Hotel",
                "text": f"Switch to '{cheaper_hotel['name']}' (₹{cheaper_hotel['price_per_night']}/night) to save ₹{savings:,.2f}."
            })

        # Check cheaper transport
        cheaper_trans = conn.execute(
            "SELECT * FROM transport WHERE LOWER(destination) = ? AND average_cost < ? ORDER BY average_cost ASC LIMIT 1",
            (destination.lower(), daily_trans_cost)
        ).fetchone()
        if cheaper_trans:
            t_savings = (daily_trans_cost - cheaper_trans["average_cost"]) * days
            suggestions.append({
                "category": "Transport",
                "text": f"Use '{cheaper_trans['transport_type']}' to save ₹{t_savings:,.2f} on commuting."
            })

        # Food suggestions
        suggestions.append({
            "category": "Food",
            "text": "Explore authentic local street food and bistros to cut dining expenses by up to 30%."
        })

    conn.close()

    breakdown_list = [
        {"category": "Accommodation", "name": f"Hotel: {hotel_name}", "cost": round(hotel_total, 2), "percentage": round((hotel_total / total_estimated_cost) * 100, 1)},
        {"category": "Food & Dining", "name": f"Meals for {travelers} travelers ({days} days)", "cost": round(food_total, 2), "percentage": round((food_total / total_estimated_cost) * 100, 1)},
        {"category": "Local Transport", "name": f"{trans_name}", "cost": round(transport_total, 2), "percentage": round((transport_total / total_estimated_cost) * 100, 1)},
        {"category": "Attraction Fees", "name": "Tickets & Entry Passes", "cost": round(attraction_total, 2), "percentage": round((attraction_total / total_estimated_cost) * 100, 1)},
        {"category": "Miscellaneous", "name": "Emergency & Shopping Buffer (10%)", "cost": round(misc_total, 2), "percentage": round((misc_total / total_estimated_cost) * 100, 1)}
    ]

    return {
        "user_budget": float(user_budget),
        "total_estimated_cost": total_estimated_cost,
        "remaining_budget": remaining_budget,
        "budget_status": budget_status,
        "status_color": status_color,
        "warning": warning,
        "breakdown": breakdown_list,
        "suggestions": suggestions,
        "params": {
            "destination": destination,
            "days": days,
            "travelers": travelers,
            "nights": nights,
            "rooms_needed": rooms_needed
        }
    }
