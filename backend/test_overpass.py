import requests

query = """[out:json][timeout:25];(node["tourism"~"attraction|viewpoint|museum|theme_park|zoo|gallery"](around:15000,11.4102,76.6950););out center 15;"""

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*'
}

mirrors = [
    ("https://overpass-api.de/api/interpreter", "POST_BODY"),
    ("https://overpass-api.de/api/interpreter", "GET"),
    ("https://overpass.openstreetmap.ru/api/interpreter", "GET"),
    ("https://maps.mail.ru/osm/tools/overpass/api/interpreter", "GET"),
]

for url, method in mirrors:
    try:
        print(f"Testing {url} via {method}...")
        if method == "GET":
            r = requests.get(url, params={"data": query}, headers=headers, timeout=15)
        elif method == "POST_BODY":
            r = requests.post(url, data=query.encode('utf-8'), headers={'Content-Type': 'text/plain', **headers}, timeout=15)
        print("Status:", r.status_code)
        if r.status_code == 200:
            data = r.json()
            elements = data.get("elements", [])
            print(f"Success! Fetched {len(elements)} elements from {url}")
            for el in elements[:3]:
                print(" -", el.get("tags", {}).get("name", "Unnamed"), el.get("lat"), el.get("lon"))
            break
        else:
            print("Response:", r.text[:200])
    except Exception as e:
        print(f"Failed {url}: {e}")
