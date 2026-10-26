import requests
from datetime import datetime, timezone
import os
import sys

# Pre-defined accurate coordinates for supported destinations
KNOWN_DESTINATIONS = {
    "ooty": (11.4102, 76.6950),
    "kodaikanal": (10.2381, 77.4892),
    "madurai": (9.9252, 78.1198),
    "chennai": (13.0827, 80.2707),
    "coimbatore": (11.0168, 76.9558),
    "goa": (15.2993, 74.1240),
    "manali": (32.2432, 77.1892),
    "jaipur": (26.9124, 75.7873),
    "munnar": (10.0889, 77.0595),
    "varanasi": (25.3176, 82.9739),
    "udaipur": (24.5854, 73.7125),
    "agra": (27.1767, 78.0081),
}

OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
    "https://overpass.openstreetmap.fr/api/interpreter",
]

HEADERS = {
    "User-Agent": "SmartTripPlanner/1.0 (contact: student@ds-project.edu)",
    "Accept": "application/json"
}


_destination_resolution_cache = {}


def resolve_destination(destination: str):
    """
    Dynamically resolve destination using legitimate geocoding.
    Returns:
      {
        "name": str,
        "latitude": float,
        "longitude": float,
        "display_name": str
      }
      or None if destination cannot be found.
    """
    if not destination or not str(destination).strip():
        return None

    clean_query = str(destination).strip()
    key = clean_query.lower()

    if key in _destination_resolution_cache:
        return _destination_resolution_cache[key]

    # 1. Check known destinations dictionary for fast exact match
    if key in KNOWN_DESTINATIONS:
        lat, lon = KNOWN_DESTINATIONS[key]
        display_map = {
            "ooty": "Ooty, The Nilgiris, Tamil Nadu, India",
            "kodaikanal": "Kodaikanal, Dindigul, Tamil Nadu, India",
            "madurai": "Madurai, Tamil Nadu, India",
            "chennai": "Chennai, Tamil Nadu, India",
            "coimbatore": "Coimbatore, Tamil Nadu, India",
            "goa": "Goa, India",
            "manali": "Manali, Kullu, Himachal Pradesh, India",
            "jaipur": "Jaipur, Rajasthan, India",
            "munnar": "Munnar, Idukki, Kerala, India",
            "varanasi": "Varanasi, Uttar Pradesh, India",
            "udaipur": "Udaipur, Rajasthan, India",
            "agra": "Agra, Uttar Pradesh, India"
        }
        res = {
            "name": clean_query.title(),
            "latitude": lat,
            "longitude": lon,
            "display_name": display_map.get(key, f"{clean_query.title()}, India")
        }
        _destination_resolution_cache[key] = res
        return res

    # 2. Check database
    try:
        from database.database import get_db_connection
        conn = get_db_connection()
        row = conn.execute(
            "SELECT name, state, country, latitude, longitude FROM destinations WHERE LOWER(name) = ?",
            (key,)
        ).fetchone()
        conn.close()
        if row and row["latitude"] and row["longitude"]:
            res = {
                "name": row["name"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "display_name": f"{row['name']}, {row['state']}, {row['country']}"
            }
            _destination_resolution_cache[key] = res
            return res
    except Exception as e:
        print(f"[OSM] DB lookup error: {e}")

    # 3. Dynamic OSM Nominatim Geocoding (works for ANY destination worldwide, e.g. Yercaud)
    try:
        geo_url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": clean_query,
            "format": "json",
            "limit": 1,
            "addressdetails": 1
        }
        resp = requests.get(geo_url, params=params, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            results = resp.json()
            if results and len(results) > 0:
                first = results[0]
                place_name = first.get("name")
                if not place_name:
                    address_obj = first.get("address", {})
                    place_name = (
                        address_obj.get("city") or
                        address_obj.get("town") or
                        address_obj.get("village") or
                        address_obj.get("county") or
                        clean_query.title()
                    )
                res = {
                    "name": place_name,
                    "latitude": float(first["lat"]),
                    "longitude": float(first["lon"]),
                    "display_name": first.get("display_name", f"{place_name}")
                }
                _destination_resolution_cache[key] = res
                return res
    except Exception as e:
        print(f"[OSM] Nominatim geocoding error: {e}")

    return None


def autocomplete_destinations(query: str, limit: int = 5):
    """
    Return real geocoded suggestions from Nominatim and known destinations for typeahead input.
    """
    if not query or len(query.strip()) < 2:
        return []

    clean_q = query.strip().lower()
    suggestions = []
    seen = set()

    display_map = {
        "ooty": "Ooty, The Nilgiris, Tamil Nadu, India",
        "kodaikanal": "Kodaikanal, Dindigul, Tamil Nadu, India",
        "madurai": "Madurai, Tamil Nadu, India",
        "chennai": "Chennai, Tamil Nadu, India",
        "coimbatore": "Coimbatore, Tamil Nadu, India",
        "goa": "Goa, India",
        "manali": "Manali, Kullu, Himachal Pradesh, India",
        "jaipur": "Jaipur, Rajasthan, India",
        "munnar": "Munnar, Idukki, Kerala, India",
        "varanasi": "Varanasi, Uttar Pradesh, India",
        "udaipur": "Udaipur, Rajasthan, India",
        "agra": "Agra, Uttar Pradesh, India"
    }

    # Match known destinations first
    for k, (lat, lon) in KNOWN_DESTINATIONS.items():
        if clean_q in k or k.startswith(clean_q):
            d_name = display_map.get(k, f"{k.title()}, India")
            if d_name not in seen:
                seen.add(d_name)
                suggestions.append({
                    "name": k.title(),
                    "display_name": d_name,
                    "latitude": lat,
                    "longitude": lon
                })

    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": clean_q,
            "format": "json",
            "limit": limit,
            "addressdetails": 1
        }
        resp = requests.get(url, params=params, headers=HEADERS, timeout=6)
        if resp.status_code == 200:
            items = resp.json()
            for it in items:
                d_name = it.get("display_name", "")
                if d_name in seen:
                    continue
                seen.add(d_name)
                name = it.get("name") or d_name.split(",")[0].strip()
                suggestions.append({
                    "name": name,
                    "display_name": d_name,
                    "latitude": float(it["lat"]),
                    "longitude": float(it["lon"])
                })
                if len(suggestions) >= limit:
                    break
            return suggestions[:limit]
    except Exception as e:
        print(f"[OSM] Autocomplete error: {e}")

    return suggestions[:limit]


def get_destination_coords(destination_name: str):
    """Resolve coordinates for destination using resolve_destination."""
    resolved = resolve_destination(destination_name)
    if resolved:
        return resolved["latitude"], resolved["longitude"]
    return None


# In-memory cache for live Overpass responses to respect rate limits and speed up user UI
_osm_cache = {}
CACHE_TTL_SECONDS = 600


def fetch_osm_attractions(destination_name: str, radius_meters: int = 15000, limit: int = 25):
    """
    Query Overpass API for real-world attractions around destination coordinates.
    Returns:
      dict: {
        "destination": destination_name,
        "updated_at": timestamp_str,
        "count": int,
        "attractions": list of attraction dicts
      }
    """
    cache_key = destination_name.strip().lower()
    now_ts = datetime.now(timezone.utc).timestamp()

    if cache_key in _osm_cache:
        cached_entry = _osm_cache[cache_key]
        if now_ts - cached_entry["timestamp"] < CACHE_TTL_SECONDS:
            print(f"[OSM] Serving cached live data for {destination_name}")
            return cached_entry["data"]

    resolved = resolve_destination(destination_name)
    if not resolved:
        print(f"[OSM] Could not resolve coordinates for '{destination_name}'")
        return {
            "destination": destination_name,
            "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "count": 0,
            "attractions": []
        }

    lat = resolved["latitude"]
    lon = resolved["longitude"]
    display_name = resolved.get("display_name", destination_name)

    query = f"""[out:json][timeout:25];
(
  node(around:{radius_meters},{lat},{lon})["tourism"~"attraction|viewpoint|museum|theme_park|zoo|gallery|artwork"];
  way(around:{radius_meters},{lat},{lon})["tourism"~"attraction|viewpoint|museum|theme_park|zoo|gallery|artwork"];
  node(around:{radius_meters},{lat},{lon})["historic"~"monument|castle|memorial|ruins|heritage"];
  way(around:{radius_meters},{lat},{lon})["historic"~"monument|castle|memorial|ruins|heritage"];
);
out center {limit};
"""

    import time

    elements = []
    last_error = None

    for mirror in OVERPASS_MIRRORS:
        try:
            print(f"[OSM] Querying Overpass mirror: {mirror} for {destination_name} ({lat}, {lon})...")
            response = requests.post(
                mirror,
                data={"data": query},
                headers=HEADERS,
                timeout=20
            )
            if response.status_code == 429:
                print(f"[OSM] Mirror {mirror} rate-limited (429). Waiting 1.5s before retry...")
                time.sleep(1.5)
                response = requests.post(
                    mirror,
                    data={"data": query},
                    headers=HEADERS,
                    timeout=20
                )

            if response.status_code == 200:
                data = response.json()
                elements = data.get("elements", [])
                print(f"[OSM] Successfully received {len(elements)} raw elements from {mirror}")
                if elements:
                    break
            else:
                print(f"[OSM] Mirror {mirror} returned status {response.status_code}")
        except Exception as e:
            last_error = e
            print(f"[OSM] Mirror {mirror} failed: {e}")

    # Fallback to OpenStreetMap Nominatim if Overpass is busy or returned 0
    if not elements:
        try:
            print(f"[OSM] Querying OpenStreetMap Nominatim fallback for {destination_name}...")
            nom_url = f"https://nominatim.openstreetmap.org/search?q=attractions+in+{destination_name}&format=json&limit={limit}"
            nom_resp = requests.get(nom_url, headers=HEADERS, timeout=10)
            if nom_resp.status_code == 200:
                nom_items = nom_resp.json()
                print(f"[OSM] Nominatim returned {len(nom_items)} items for {destination_name}")
                for item in nom_items:
                    elements.append({
                        "id": item.get("osm_id", item.get("place_id")),
                        "type": item.get("osm_type", "node"),
                        "lat": float(item.get("lat")),
                        "lon": float(item.get("lon")),
                        "tags": {
                            "name": item.get("display_name", "").split(",")[0],
                            "tourism": item.get("type") or "attraction",
                            "addr:full": ", ".join(item.get("display_name", "").split(",")[1:4]).strip()
                        }
                    })
        except Exception as nom_err:
            print(f"[OSM] Nominatim fallback error: {nom_err}")

    # Process and sanitize elements
    attractions = []
    seen_names = set()

    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name") or tags.get("name:en")
        if not name or not name.strip():
            continue  # Skip unnamed nodes

        clean_name = name.strip()
        norm_key = clean_name.lower()
        if norm_key in seen_names:
            continue
        seen_names.add(norm_key)

        # Determine category
        raw_cat = tags.get("tourism") or tags.get("historic") or tags.get("leisure") or "Attraction"
        category = raw_cat.replace("_", " ").title()

        # Latitude / Longitude
        poi_lat = el.get("lat") or el.get("center", {}).get("lat")
        poi_lon = el.get("lon") or el.get("center", {}).get("lon")

        # Address construction from OSM tags
        address = tags.get("addr:full")
        if not address:
            addr_parts = [
                tags.get("addr:housenumber"),
                tags.get("addr:street"),
                tags.get("addr:suburb"),
                tags.get("addr:city") or destination_name,
                tags.get("addr:postcode")
            ]
            valid_parts = [p for p in addr_parts if p]
            address = ", ".join(valid_parts) if valid_parts else None

        # Opening hours
        opening_hours = tags.get("opening_hours")

        # Fee
        fee = tags.get("fee") or tags.get("charge")

        # Website
        website = tags.get("website") or tags.get("contact:website") or tags.get("url")

        attractions.append({
            "id": f"osm_{el.get('type', 'node')}_{el.get('id')}",
            "name": clean_name,
            "category": category,
            "latitude": poi_lat,
            "longitude": poi_lon,
            "address": address,
            "opening_hours": opening_hours,
            "fee": fee,
            "website": website,
            "source": "OpenStreetMap",
            "destination": destination_name
        })

    updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    result = {
        "destination": destination_name,
        "updated_at": updated_at,
        "count": len(attractions),
        "attractions": attractions
    }

    if attractions:
        _osm_cache[cache_key] = {
            "timestamp": now_ts,
            "data": result
        }

    return result
