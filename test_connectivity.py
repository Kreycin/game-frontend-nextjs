import requests
import json

API_URL = 'https://game-backend-wm3t.onrender.com'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
}

def check_effect(name):
    print(f"\n--- 🔍 Checking Effect: '{name}' ---")
    
    # Try multiple API variations just in case
    endpoints = [
        f"/api/effects?filters[Effect_Name][$eq]={name}&populate=Effect_Icon",
        f"/api/effects?filters[Effect_Name][$contains]={name}&populate=Effect_Icon",
    ]
    
    found = False
    for ep in endpoints:
        url = f"{API_URL}{ep}"
        try:
            r = requests.get(url, headers=HEADERS, timeout=10)
            if r.status_code == 200:
                data = r.json()
                if data.get('data'):
                    found = True
                    for item in data['data']:
                        icon = item.get('attributes', {}).get('Effect_Icon') or item.get('Effect_Icon')
                        icon_url = icon['data']['attributes']['url'] if icon and 'data' in icon else (icon['url'] if icon else '❌ NULL')
                        
                        print(f"✅ Found ID: {item['id']}")
                        print(f"   Name: {item.get('attributes', {}).get('Effect_Name') or item.get('Effect_Name')}")
                        print(f"   Icon URL: {icon_url}")
            elif r.status_code == 404:
                print(f"❌ Endpoint 404: {ep}")
            else:
                print(f"⚠️ Status {r.status_code}: {ep}")
        except Exception as e:
           print(f"💥 Error: {e}")

    if not found:
        print("❌ No effect found matching query.")

if __name__ == "__main__":
    check_effect("Cinder")
    check_effect("Final Cinder")
