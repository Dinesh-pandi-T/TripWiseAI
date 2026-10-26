import requests

query = """[out:json][timeout:25];node["tourism"="attraction"](11.35,76.65,11.45,76.75);out 10;"""

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
}

endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.ru/cgi/interpreter",
    "https://overpass-api.de/api/interpreter"
]

for ep in endpoints:
    try:
        print(f"Testing {ep}...")
        resp = requests.post(ep, data={'data': query}, headers=headers, timeout=12)
        print("Status:", resp.status_code)
        if resp.status_code == 200:
            print("Success! Got length:", len(resp.text))
            data = resp.json()
            print("Elements:", len(data.get('elements', [])))
            for el in data.get('elements', []):
                print(" -", el.get('tags', {}).get('name'))
            break
        else:
            print("Error body:", resp.text[:150])
    except Exception as e:
        print("Exception:", e)
