import requests

query = """[out:json][timeout:25];
(
  node(around:15000,11.4102,76.6950)["tourism"];
  node(around:15000,11.4102,76.6950)["historic"];
);
out center 25;
"""

headers = {'User-Agent': 'SmartTripPlanner/1.0 (Educational Project; contact: test@gmail.com)'}

global_endpoints = [
    "https://overpass.openstreetmap.fr/api/interpreter",
    "https://overpass.nchc.org.tw/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
]

for url in global_endpoints:
    try:
        print(f"Testing global mirror: {url}")
        r = requests.post(url, data={'data': query}, headers=headers, timeout=15)
        print("Status:", r.status_code)
        if r.status_code == 200:
            data = r.json()
            elements = data.get("elements", [])
            print(f"Success! {url} returned {len(elements)} items.")
            named = [e for e in elements if "name" in e.get("tags", {})]
            print(f"Named items: {len(named)}")
            for el in named[:5]:
                tags = el.get("tags", {})
                lat = el.get("lat") or el.get("center", {}).get("lat")
                lon = el.get("lon") or el.get("center", {}).get("lon")
                print(" -", tags.get("name"), "| Type:", tags.get("tourism") or tags.get("historic"), f"({lat}, {lon})")
            break
        else:
            print("Response preview:", r.text[:200])
    except Exception as e:
        print("Error on", url, e)
