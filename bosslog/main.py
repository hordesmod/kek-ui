import os
import time
import requests


SUPABASE_URL = 'https://ptdogrzpmpokrdetnznv.supabase.co/rest/v1/'
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


RATE_LIMIT = 0.2

bosslog = []
player = []
seen_players = set()

def supabase_api(endpoint, header=None, data=None):
    url = SUPABASE_URL + endpoint
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    if header:
        headers.update(header)
        
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        if response.status_code == 204 or not response.text:
            return {"status": "success", "message": "No content returned"}
            
        return response.json()
        
    except requests.exceptions.RequestException as e:
        error_msg = response.text if 'response' in locals() else e
        print(f"DB fail: {error_msg}")
        exit()

def hordes_api(kill_id, class_id=None):
    url = "https://hordes.io/api/pve/getbosskillplayerlogs"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "killid": kill_id,
        "sort": "dps"
    }
    if class_id is not None:
        payload["classid"] = class_id
    try:
        response = session.post(url, headers=headers, json=payload, timeout=5)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Network error for ID {kill_id}: {e}")
        return None
    return response.json()

def parse_boss_logs(data_list):
    _bosslog = []
    _player = []
    
    for item in data_list:
        _pid = item['playerid']
        _bosslog.append({
            'id': item['id'],
            'playerid': item['playerid'],
            'killid': item['killid'],
            'dps': item['dps'],
            'hps': item['hps'],
            'mps': item['mps'],
            'gs': item['gs'],
            'duration': item['duration'],
            'deaths': item['deaths'],
            'time': item['time'].replace('T', ' ')[:19],
        })
        if _pid not in seen_players:
            _player.append({
                'id': item['playerid'],
                'name': item['name'],
                'faction': item['faction'],
                'class': item['class']
            })
            seen_players.add(_pid)
    return _bosslog, _player

def deep_scan(kill_id):
    print(f"!!! Limit reached for {kill_id}, deep-scanning classes...")
    all_class_data = []
    for class_id in range(4):
        time.sleep(RATE_LIMIT)
        class_data = hordes_api(kill_id, class_id)
        if class_data:
            all_class_data.extend(class_data)
            print(f"ID: {kill_id} | Class {class_id}: {len(class_data)}")
    return all_class_data


session = requests.Session()

res = supabase_api('rpc/bosslog_last_killid')
current_id = res['last_killid']

print(f"Last killid: {current_id}")

retry_count = 0

while True:
    start_time = time.time()
    raw_json = hordes_api(current_id)
    
    if not raw_json:
        retry_count += 1
        print(f"KillID: {current_id} - Empty ({retry_count}/2)")
        
        if retry_count > 1:
            print("Two empty IDs in a row. Stopping.")
            break
            
        current_id += 1
        time.sleep(1.0)
        continue

    retry_count = 0

    if len(raw_json) == 100:
        final_data = deep_scan(current_id)
    else:
        final_data = raw_json

    _bosslog, _player = parse_boss_logs(final_data)
    
    bosslog.extend(_bosslog)
    player.extend(_player)
    
    print(f"{current_id} {len(bosslog)} logs")
    print(f"{current_id} {len(player)} players")

    current_id += 1
    
    elapsed = time.time() - start_time
    time.sleep(max(0, RATE_LIMIT - elapsed))

supabase_api("player", header={"Prefer": "resolution=merge-duplicates"}, data=player)
supabase_api("bosslog", header={"Prefer": "resolution=merge-duplicates"}, data=bosslog)
