import json
from app import app

def test_endpoints():
    client = app.test_client()

    print("--- 1. Testing /api/health ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("Health response:", res.get_json())

    print("\n--- 2. Testing /api/destinations ---")
    res = client.get("/api/destinations")
    assert res.status_code == 200
    dests = res.get_json()
    assert len(dests) >= 8
    print(f"Loaded {len(dests)} destinations. Example:", dests[0]["name"])

    print("\n--- 3. Testing /api/destinations/Ooty ---")
    res = client.get("/api/destinations/Ooty")
    assert res.status_code == 200
    data = res.get_json()
    assert "attractions" in data and len(data["attractions"]) > 0
    print(f"Ooty attractions count: {len(data['attractions'])}, hotels: {len(data['hotels'])}")

    print("\n--- 4. Testing POST /api/recommendations ---")
    payload = {
        "destination": "Ooty",
        "budget": 15000,
        "days": 3,
        "travelers": 2,
        "interests": ["Nature", "Adventure", "Photography"]
    }
    res = client.post("/api/recommendations", json=payload)
    assert res.status_code == 200
    rec_data = res.get_json()
    assert len(rec_data["recommended_attractions"]) > 0
    print(f"Recommended {len(rec_data['recommended_attractions'])} attractions. Top:",
          rec_data["recommended_attractions"][0]["name"],
          f"Score: {rec_data['recommended_attractions'][0]['recommendation_score']}%")

    print("\n--- 5. Testing POST /api/itinerary ---")
    itin_payload = {
        "destination": "Ooty",
        "attractions": rec_data["recommended_attractions"][:6],
        "days": 3,
        "available_hours_per_day": 9
    }
    res = client.post("/api/itinerary", json=itin_payload)
    assert res.status_code == 200
    itin_data = res.get_json()
    assert len(itin_data["days"]) == 3
    print(f"Generated {len(itin_data['days'])} days itinerary. Total travel: {itin_data['total_travel_distance_km']} km")

    print("\n--- 6. Testing POST /api/budget ---")
    budget_payload = {
        "destination": "Ooty",
        "budget": 15000,
        "days": 3,
        "travelers": 2,
        "selected_attractions": rec_data["recommended_attractions"][:6]
    }
    res = client.post("/api/budget", json=budget_payload)
    assert res.status_code == 200
    budget_data = res.get_json()
    print("Budget Status:", budget_data["budget_status"], f"Total: INR {budget_data['total_estimated_cost']}")

    print("\n--- 7. Testing GET /api/weather/Ooty ---")
    res = client.get("/api/weather/Ooty")
    assert res.status_code == 200
    weather = res.get_json()
    print(f"Weather for {weather['destination']}: {weather['temperature']}°C, {weather['condition']}")

    print("\n--- 8. Testing GET /api/analytics ---")
    res = client.get("/api/analytics")
    assert res.status_code == 200
    analytics = res.get_json()
    print("Analytics Summary:", analytics["summary"])

    print("\n--- 9. Testing POST /api/itineraries/save ---")
    save_payload = {
        "title": "College Trip to Ooty",
        "destination": "Ooty",
        "budget": 15000,
        "travelers": 2,
        "days": 3,
        "interests": ["Nature", "Adventure"],
        "itinerary_data": itin_data,
        "total_cost": budget_data["total_estimated_cost"]
    }
    res = client.post("/api/itineraries/save", json=save_payload)
    assert res.status_code == 200
    print("Save Itinerary result:", res.get_json())

    print("\n--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_endpoints()
