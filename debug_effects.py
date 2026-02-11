import urllib.request
import json
import ssl
from urllib.parse import quote

# Fix SSL context just in case (e.g. Render certificate issues)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

API_URL = 'https://game-backend-wm3t.onrender.com'

def get_data(endpoint, params):
    # Manually construct query string to preserve bracket structure
    query_parts = []
    for k, v in params:
        # We quote the value, but keep the key as is (Strapi expects filters[...])
        query_parts.append(f"{k}={quote(str(v))}")
    
    query_string = "&".join(query_parts)
    url = f"{API_URL}{endpoint}?{query_string}"
    
    print(f"Fetching: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Fail: {e}")
        return None

def check_structure():
    print("\n--- 🔍 Checking 'Flame - Tanjiro' Structure ---")
    data = get_data('/api/characters', [
        ('filters[Name][$eq]', 'Flame - Tanjiro'),
        ('populate[Star_Levels][populate][skill_descriptions][populate][skill][populate][effects][populate][Effect_Icon][fields][0]', 'url'),
        ('populate[Star_Levels][populate][skill_descriptions][populate][skill][populate][effects][populate][Effect_Icon][fields][1]', 'name'),
    ])
    
    if data and data['data']:
        char = data['data'][0]
        print(f"✅ Found Character: {char.get('Name')} (ID: {char['id']})")
        
        star_levels = char.get('Star_Levels', [])
        if not star_levels:
            print("❌ No Star Levels found.")
            return

        for i, level in enumerate(star_levels):
            print(f"\n--- Star Level {i+1} ---")
            skill_descs = level.get('skill_descriptions', [])
            if not skill_descs:
                 print("  (No skills)")
            
            for sd in skill_descs:
                skill = sd.get('skill')
                if not skill: continue
                
                print(f"🔹 Skill: {skill.get('Skill_Name')} (ID: {skill.get('id')})")
                effects = skill.get('effects', [])
                if not effects:
                    print("    (No effects linked)")
                
                for effect in effects:
                    icon = effect.get('Effect_Icon')
                    print(f"    🔸 Effect: '{effect['Effect_Name']}' (ID: {effect['id']})")
                    if icon:
                        print(f"       Icon URL: {icon['url']}")
                        print(f"       Icon Name: {icon.get('name')}")
                    else:
                        print("       Icon: ❌ NULL (No image linked)")
    else:
        print("❌ Character 'Flame - Tanjiro' not found in API.")

if __name__ == '__main__':
    check_structure()
