import os
import requests
from database.database import get_db_connection

WMO_CODE_MAP = {
    0: ("Clear Sky", "Sunny", "outdoor"),
    1: ("Mainly Clear", "Sunny", "outdoor"),
    2: ("Partly Cloudy", "Partly Cloudy", "outdoor"),
    3: ("Overcast", "Cloudy", "outdoor"),
    45: ("Foggy", "Misty", "outdoor"),
    48: ("Depositing Rime Fog", "Misty", "indoor"),
    51: ("Light Drizzle", "Rainy", "indoor"),
    53: ("Moderate Drizzle", "Rainy", "indoor"),
    55: ("Dense Drizzle", "Rainy", "indoor"),
    61: ("Slight Rain", "Rainy", "indoor"),
    63: ("Moderate Rain", "Rainy", "indoor"),
    65: ("Heavy Rain", "Rainy", "indoor"),
    71: ("Slight Snowfall", "Snowy", "outdoor"),
    73: ("Moderate Snowfall", "Snowy", "outdoor"),
    75: ("Heavy Snowfall", "Snowy", "indoor"),
    80: ("Slight Rain Showers", "Rainy", "indoor"),
    81: ("Moderate Rain Showers", "Rainy", "indoor"),
    82: ("Violent Rain Showers", "Rainy", "indoor"),
    95: ("Thunderstorm", "Stormy", "indoor")
}

DEFAULT_WEATHER = {
    "Ooty": {"temp": 17.5, "condition": "Partly Cloudy", "humidity": 72, "wind_speed": 12.0, "icon": "cloud-sun", "recommendation_hint": "Cool & misty. Great for tea gardens and viewpoints!"},
    "Goa": {"temp": 29.0, "condition": "Sunny", "humidity": 68, "wind_speed": 15.0, "icon": "sun", "recommendation_hint": "Warm beach weather. Perfect for water sports and coastal walks!"},
    "Manali": {"temp": 14.0, "condition": "Pleasant", "humidity": 60, "wind_speed": 9.5, "icon": "cloud-sun", "recommendation_hint": "Crisp mountain air. Excellent for valley treks and adventure sports!"},
    "Jaipur": {"temp": 28.5, "condition": "Sunny", "humidity": 45, "wind_speed": 11.0, "icon": "sun", "recommendation_hint": "Clear and dry. Ideal for exploring royal forts and open courtyards!"},
    "Munnar": {"temp": 19.0, "condition": "Misty", "humidity": 80, "wind_speed": 8.0, "icon": "cloud-drizzle", "recommendation_hint": "Gentle mountain mist. Ideal for national parks and tea museum visits!"},
    "Varanasi": {"temp": 27.0, "condition": "Sunny", "humidity": 55, "wind_speed": 7.0, "icon": "sun", "recommendation_hint": "Warm & dry. Outstanding for early morning boat rides and evening aarti!"},
    "Udaipur": {"temp": 26.5, "condition": "Clear Sky", "humidity": 48, "wind_speed": 10.0, "icon": "sun", "recommendation_hint": "Pleasant lake breeze. Perfect for sunset boat cruises and palace tours!"},
    "Agra": {"temp": 27.8, "condition": "Sunny", "humidity": 50, "wind_speed": 8.5, "icon": "sun", "recommendation_hint": "Clear views of the Taj Mahal and Mughal monuments!"}
}

from services.osm import resolve_destination

def get_weather_for_destination(destination_name):
    """
    Fetch live weather data from Open-Meteo or fallback safely.
    Returns:
      temperature, condition, humidity, wind_speed, forecast, recommendation_hint
    """
    resolved = resolve_destination(destination_name)
    if resolved:
        lat = float(resolved["latitude"])
        lon = float(resolved["longitude"])
        dest_title = resolved["name"]
    else:
        conn = get_db_connection()
        dest_row = conn.execute(
            "SELECT * FROM destinations WHERE LOWER(name) = ?", (destination_name.lower(),)
        ).fetchone()
        conn.close()
        lat = float(dest_row["latitude"]) if dest_row else 11.4102
        lon = float(dest_row["longitude"]) if dest_row else 76.6950
        dest_title = dest_row["name"] if dest_row else destination_name

    # Try live Open-Meteo API
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
            f"&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5"
        )
        resp = requests.get(url, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            current = data.get("current", {})
            w_code = current.get("weather_code", 0)
            desc, general_cond, preference = WMO_CODE_MAP.get(w_code, ("Clear Sky", "Sunny", "outdoor"))

            # Build 5-day forecast
            daily = data.get("daily", {})
            time_list = daily.get("time", [])
            max_temps = daily.get("temperature_2m_max", [])
            min_temps = daily.get("temperature_2m_min", [])
            codes = daily.get("weather_code", [])

            forecast = []
            for i in range(min(5, len(time_list))):
                day_code = codes[i] if i < len(codes) else 0
                day_desc, _, _ = WMO_CODE_MAP.get(day_code, ("Clear", "Sunny", "outdoor"))
                forecast.append({
                    "date": time_list[i],
                    "max_temp": round(max_temps[i], 1) if i < len(max_temps) else 25.0,
                    "min_temp": round(min_temps[i], 1) if i < len(min_temps) else 18.0,
                    "condition": day_desc
                })

            hint = (
                "Rain predicted: Prioritize indoor museums, cafes, and covered markets."
                if preference == "indoor"
                else "Clear skies: Wonderful for outdoor sightseeing, lakes, and photography!"
            )

            return {
                "destination": dest_title,
                "temperature": round(current.get("temperature_2m", 22.0), 1),
                "condition": desc,
                "general_condition": general_cond,
                "preference": preference,
                "humidity": current.get("relative_humidity_2m", 60),
                "wind_speed": round(current.get("wind_speed_10m", 10.0), 1),
                "forecast": forecast,
                "recommendation_hint": hint,
                "source": "live_api"
            }
    except Exception as e:
        print(f"[WeatherService] Live API unavailable ({e}), using fallback data.")

    # Fallback to curated realistic profile
    fb = DEFAULT_WEATHER.get(dest_title, {
        "temp": 24.0, "condition": "Pleasant", "humidity": 60, "wind_speed": 10.0,
        "icon": "sun", "recommendation_hint": "Comfortable weather for general sightseeing."
    })

    forecast = [
        {"date": "Day 1", "max_temp": fb["temp"] + 2, "min_temp": fb["temp"] - 4, "condition": fb["condition"]},
        {"date": "Day 2", "max_temp": fb["temp"] + 1, "min_temp": fb["temp"] - 3, "condition": fb["condition"]},
        {"date": "Day 3", "max_temp": fb["temp"] + 3, "min_temp": fb["temp"] - 4, "condition": fb["condition"]}
    ]

    return {
        "destination": dest_title,
        "temperature": fb["temp"],
        "condition": fb["condition"],
        "general_condition": "Sunny" if "sun" in fb["condition"].lower() else "Pleasant",
        "preference": "indoor" if "rain" in fb["condition"].lower() else "outdoor",
        "humidity": fb["humidity"],
        "wind_speed": fb["wind_speed"],
        "forecast": forecast,
        "recommendation_hint": fb["recommendation_hint"],
        "source": "fallback"
    }
