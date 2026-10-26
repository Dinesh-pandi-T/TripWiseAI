import requests

urls = [
    "https://nominatim.openstreetmap.org/search?q=tourist+attraction+in+Ooty&format=json&limit=10",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
    "https://overpass-api.de/api/status"
]

headers = {'User-Agent': 'SmartTripPlannerApp/1.0 (contact: student@ds-project.edu)'}

for u in urls:
    try:
        print("Checking:", u)
        if "nominatim" in u:
            r = requests.get(u, headers=headers, timeout=8)
            print("Nominatim status:", r.status_code)
            if r.status_code == 200:
                print("Nominatim results count:", len(r.json()))
                for p in r.json()[:3]:
                    print(" -", p.get("display_name")[:60], p.get("lat"), p.get("lon"))
        elif "status" in u:
            r = requests.get(u, headers=headers, timeout=8)
            print("Status endpoint:", r.status_code, r.text[:100])
        else:
            q = '[out:json][timeout:10];node["tourism"](around:10000,11.41,76.69);out 5;'
            r = requests.post(u, data={'data': q}, headers=headers, timeout=8)
            print("Overpass mirror status:", r.status_code)
            if r.status_code == 200:
                print("Results count:", len(r.json().get('elements', [])))
    except Exception as e:
        print("Error on", u, e)
