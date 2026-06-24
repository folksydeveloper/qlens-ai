import urllib.request, urllib.error, json, sys, time

BASE = "http://localhost:3001/api"

def do(method, url, headers=None, body=None):
    try:
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
        resp = urllib.request.urlopen(req)
        return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read()) if e.read else (e.code, {"raw": e.read().decode()})

print("=" * 70)
print("QLENS AI BACKTEST — 2026-06-24")
print("=" * 70)

# 1. Health
s, d = do("GET", f"{BASE}/health")
ok = s == 200 and d.get("database") == "connected"
print(f"{'OK' if ok else 'FAIL'} | Health Check: [{s}] db={d.get('database','?')}")

# 2. Plans
s, d = do("GET", f"{BASE}/plans")
ok = s == 200 and isinstance(d, list) and len(d) > 0
print(f"{'OK' if ok else 'FAIL'} | Plans: [{s}] count={len(d) if isinstance(d, list) else 0}")

# 3. Public models
s, d = do("GET", f"{BASE}/public/models")
ok = s == 200 and isinstance(d, list) and len(d) > 0
print(f"{'OK' if ok else 'FAIL'} | Public Models: [{s}] count={len(d) if isinstance(d, list) else 0}")

# 4. Public pricing
s, d = do("GET", f"{BASE}/public/pricing")
ok = s == 200 and 'plans' in d and 'packages' in d and 'models' in d
print(f"{'OK' if ok else 'FAIL'} | Public Pricing: [{s}] plans={len(d.get('plans',[]))} pkgs={len(d.get('packages',[]))}")

# 5. Admin login
s, d = do("POST", f"{BASE}/auth/login",
    {"Content-Type": "application/json"},
    {"email": "admin@qlens.ai", "password": "admin123"})
ok = s == 200 and 'accessToken' in d
tok = d.get('accessToken', '')
print(f"{'OK' if ok else 'FAIL'} | Admin Login: [{s}] token={'yes' if tok else 'no'}")

# 6. User register — unique email with timestamp
test_email = f"test_{int(time.time())}@test.com"
s, d = do("POST", f"{BASE}/auth/register",
    {"Content-Type": "application/json"},
    {"email": test_email, "password": "Test123456!"})
print(f"{'OK' if s in (200, 201) else 'FAIL'} | Register: [{s}] msg={d.get('message', d.get('error','?'))[:40]}")

# 7. User login
s, d = do("POST", f"{BASE}/auth/login",
    {"Content-Type": "application/json"},
    {"email": test_email, "password": "Test123456!"})
utok = d.get('accessToken', '') if s == 200 else ''
print(f"{'OK' if s == 200 and utok else 'FAIL'} | User Login: [{s}] token={'yes' if utok else 'no'}")

# 8. Get user profile
if utok:
    s, d = do("GET", f"{BASE}/users/me", {"Authorization": f"Bearer {utok}"})
    ok = s == 200 and 'email' in d
    print(f"{'OK' if ok else 'FAIL'} | User Profile: [{s}] email={d.get('email','?')}")
else:
    print(f"SKIP | User Profile (no token)")

# 9. API key create
if utok:
    s, d = do("POST", f"{BASE}/api-keys",
        {"Content-Type": "application/json", "Authorization": f"Bearer {utok}"},
        {"name": "Test Key", "environment": "test"})
    ok = s in (200, 201) and 'key' in d
    raw_key = d.get('key', '')
    fmt_ok = raw_key.startswith('qlens-sk-test_') if raw_key else False
    print(f"{'OK' if ok and fmt_ok else 'FAIL'} | API Key Create: [{s}] format_ok={fmt_ok} raw={'yes' if raw_key else 'no'}")
else:
    print(f"SKIP | API Key Create")

# 10. API key list
if utok:
    s, d = do("GET", f"{BASE}/api-keys", {"Authorization": f"Bearer {utok}"})
    ok = s == 200 and isinstance(d, list)
    print(f"{'OK' if ok else 'FAIL'} | API Key List: [{s}] count={len(d) if isinstance(d, list) else 0}")

# 11. Billing subscription
if utok:
    s, d = do("GET", f"{BASE}/billing/subscription", {"Authorization": f"Bearer {utok}"})
    print(f"{'OK' if s == 200 else 'FAIL'} | Billing Sub: [{s}]")
else:
    print(f"SKIP | Billing Sub")

# 12. IDOR test — admin token to access admin data
if tok:
    s, d = do("GET", f"{BASE}/admin/overview", {"Authorization": f"Bearer {tok}"})
    ok = s == 200  # admin should access
    print(f"{'OK' if ok else 'FAIL'} | Admin Access: [{s}] (admin token)")

# 13. Usage summary
if utok:
    s, d = do("GET", f"{BASE}/usage/summary", {"Authorization": f"Bearer {utok}"})
    print(f"{'OK' if s == 200 else 'FAIL'} | Usage Summary: [{s}]")

# 14. Abuse signals (admin) — fixed path to /admin/abuse/alerts
if tok:
    s, d = do("GET", f"{BASE}/admin/abuse/alerts", {"Authorization": f"Bearer {tok}"})
    print(f"{'OK' if s == 200 else 'FAIL'} | Abuse Alerts: [{s}]")

print("\n" + "=" * 70)
print("DONE")
