import requests

headers = {
    'User-Agent': 'SmartTripPlanner/1.0 (dinesh.trip.planner.project@gmail.com)',
    'Accept': 'application/json'
}

query = """[out:json][timeout:25];(node["tourism"~"attraction|viewpoint|museum|theme_park|zoo|gallery"](around:15000,11.4102,76.6950););out center 15;"""

url = "https://overpass-api.de/api/interpreter"

try:
    print("Testing with User-Agent and Accept: application/json...")
    r = requests.post(url, data={'data': query}, headers=headers, timeout=20)
    print("Status code:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        elements = data.get("elements", [])
        print(f"SUCCESS! Retrieved {len(elements)} real POIs from OpenStreetMap Overpass!")
        for el in elements[:5]:
            tags = el.get("tags", {})
            print(f" - {tags.get('name', 'Unnamed')} [{tags.get('tourism')}] at ({el.get('lat')}, {el.get('lon')})")
    else:
        print("Response:", r.text[:200])
except Exception as e:
    print("Error:", e)
