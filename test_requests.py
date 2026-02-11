import requests

API_URL = 'https://game-backend-wm3t.onrender.com'

try:
    print("Testing /api/characters...")
    r = requests.get(f"{API_URL}/api/characters")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("Success! Data length:", len(r.json().get('data', [])))
    else:
        print("Failed.")
        
    print("\nTesting Filters...")
    # requests handles params encoding automatically
    params = {
        'filters[Name][$eq]': 'Flame - Tanjiro',
        'populate[Star_Levels][populate][skill_descriptions][populate][skill][populate][effects][populate][Effect_Icon][fields][0]': 'url'
    }
    r = requests.get(f"{API_URL}/api/characters", params=params)
    print(f"Status: {r.status_code}")
    print(f"URL: {r.url}")
    if r.status_code == 200:
        data = r.json()
        if data['data']:
            print("Found Tanjiro!")
            # Dump structure
            print(data['data'][0]['Star_Levels'][0]['skill_descriptions'][0]['skill']['effects'])
        else:
            print("Tanjiro not found.")
except Exception as e:
    print(f"Error: {e}")
