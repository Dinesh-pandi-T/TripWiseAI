import requests

query = """[out:json][timeout:20];
(
  node(around:15000,11.4102,76.6950)["tourism"];
  way(around:15000,11.4102,76.6950)["tourism"];
  node(around:15000,11.4102,76.6950)["historic"];
  node(around:15000,11.4102,76.6950)["leisure"="park"];
);
out center 25;
"""

headers = {'User-Agent': 'SmartTripPlanner/1.0 (Educational College Project)'}

mirrors = [
    "https://overpass.osm.ch/api/interpreter",
    "https://overpass-api.de/api/interpreter"
]

for m in mirrors:
    try:
        print(f"Querying {m}...")
        r = requests.post(m, data={'data': query}, headers=headers, timeout=20)
        print("Status:", r.status_code)
        if r.status_code == 200:
            data = r.json()
            elements = data.get("elements", [])
            print(f"Total elements retrieved: {len(elements)}")
            named = [e for e in elements if "name" in e.get("tags", {})]
            print(f"Named elements: {len(named)}")
            for el in named[:8]:
                tags = el.get("tags", {})
                lat = el.get("lat") or el.get("center", {}).get("lat")
                lon = el.get("lon") or el.get("center", {}).get("lon")
                print(f" - {tags.get('name')} | Type: {tags.get('tourism') or tags.get('historic') or tags.get('leisure')} | Lat: {lat}, Lon: {lon}")
            break
        else:
            print("Response:", r.text[:200])
    except Exception as e:
        print("Error:", e)
