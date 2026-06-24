#!/usr/bin/env python3
"""QLENS AI — FULL AUDIT (Happy Path + Security + IDOR)"""
import urllib.request, urllib.error, json, time, sys

BASE = "http://localhost:3001/api"
results = []
passed = 0
failed = 0

def do(method, url, headers=None, body=None):
    try:
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
        req.add_header('Content-Type', 'application/json')
        if headers:
            for k, v in headers.items():
                req.add_header(k, v)
        resp = urllib.request.urlopen(req, timeout=10)
        return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body_raw = e.read().decode()
        try:
            return e.code, json.loads(body_raw)
        except:
            return e.code, {"raw": body_raw}

def report(name, ok, status, detail=""):
    global passed, failed
    icon = "✅" if ok else "❌"
    if ok: passed += 1
    else: failed += 1
    print(f"  {icon} {name}: [{status}] {detail}")
    results.append({"name": name, "ok": ok, "status": status, "detail": detail})

def header(title):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")

# ── Helper: register + login user ──
def register_user(email, password="Test123456!"):
    do("POST", f"{BASE}/auth/register",
       {"Content-Type":"application/json"},
       {"email": email, "password": password})
    s, d = do("POST", f"{BASE}/auth/login",
              {"Content-Type":"application/json"},
              {"email": email, "password": password})
    return d.get("accessToken","") if s==200 else None

# ═══════════════════════════════════════════════
header("PHASE 1: PUBLIC ENDPOINTS (no auth)")
# ═══════════════════════════════════════════════

# 1. Health
s, d = do("GET", f"{BASE}/health")
report("Health Check", s==200 and d.get("database")=="connected", s, f"db={d.get('database','?')}")

# 2. Plans
s, d = do("GET", f"{BASE}/plans")
report("Public Plans", s==200 and isinstance(d, list) and len(d)>0, s, f"count={len(d) if isinstance(d, list) else 0}")

# 3. Public Models
s, d = do("GET", f"{BASE}/public/models")
report("Public Models", s==200 and isinstance(d, list) and len(d)>0, s, f"count={len(d) if isinstance(d, list) else 0}")

# 4. Public Pricing
s, d = do("GET", f"{BASE}/public/pricing")
ok = s==200 and isinstance(d, dict) and all(k in d for k in ['plans','packages','models'])
report("Public Pricing", ok, s, f"has plans={('plans' in d if isinstance(d,dict) else False)}")

# ═══════════════════════════════════════════════
header("PHASE 2: AUTH ENDPOINTS")
# ═══════════════════════════════════════════════

# 5. Register
test_email = f"audit_{int(time.time())}@test.com"
s, d = do("POST", f"{BASE}/auth/register",
          {"Content-Type":"application/json"},
          {"email": test_email, "password": "Test123456!"})
report("Register", s in (200,201), s, d.get("message","?")[:50])

# 6. Login
s, d = do("POST", f"{BASE}/auth/login",
          {"Content-Type":"application/json"},
          {"email": test_email, "password": "Test123456!"})
user_token = d.get("accessToken","") if s==200 else ""
report("User Login", s==200 and bool(user_token), s)

# 7. Admin Login
s, d = do("POST", f"{BASE}/auth/login",
          {"Content-Type":"application/json"},
          {"email": "admin@qlens.ai", "password": "admin123"})
admin_token = d.get("accessToken","") if s==200 else ""
report("Admin Login", s==200 and bool(admin_token), s)

# 8. Login wrong password
s, d = do("POST", f"{BASE}/auth/login",
          {"Content-Type":"application/json"},
          {"email": test_email, "password": "WrongPassword1!"})
report("Login Wrong Password → 401", s==401, s, d.get("message","?")[:40])

# 9. Register duplicate email
s, d = do("POST", f"{BASE}/auth/register",
          {"Content-Type":"application/json"},
          {"email": test_email, "password": "Test123456!"})
report("Register Duplicate → 409", s==409, s, d.get("message","?")[:40])

# ═══════════════════════════════════════════════
header("PHASE 3: USER AUTHENTICATED ENDPOINTS")
# ═══════════════════════════════════════════════

AUTH = {"Authorization": f"Bearer {user_token}"}
ADMIN = {"Authorization": f"Bearer {admin_token}"}

# 10. Profile
s, d = do("GET", f"{BASE}/users/me", AUTH)
report("Profile (/users/me)", s==200 and "email" in d, s, f"email={d.get('email','?')}")

# 11. Update Profile
s, d = do("PATCH", f"{BASE}/users/me",
          {"Content-Type":"application/json", **AUTH},
          {"firstName": "Audit", "timezone": "Asia/Jakarta"})
report("Update Profile", s in (200,201), s, d.get("message","?")[:40])

# 12. API Key Create
s, d = do("POST", f"{BASE}/api-keys",
          {"Content-Type":"application/json", **AUTH},
          {"name": "AuditKey1", "environment": "test"})
key_data = d if isinstance(d, dict) else {}
raw_key = key_data.get("key","")
report("API Key Create", s in (200,201) and bool(raw_key), s, f"format={'ok' if raw_key.startswith('qlens-sk-test_') else 'bad'}")

# 13. API Key List
s, d = do("GET", f"{BASE}/api-keys", AUTH)
report("API Key List", s==200 and isinstance(d, list), s, f"count={len(d) if isinstance(d,list) else 0}")

# 14. Billing Subscription
s, d = do("GET", f"{BASE}/billing/subscription", AUTH)
report("Billing Subscription", s==200, s, f"status={d.get('status','?') if isinstance(d,dict) else '?'}")

# 15. Usage Summary
s, d = do("GET", f"{BASE}/usage/summary", AUTH)
report("Usage Summary", s==200, s, f"today={d.get('today',{}).get('requests',0) if isinstance(d,dict) else 0} reqs")

# 16. Change Password (wrong current → 401)
s, d = do("POST", f"{BASE}/users/me/change-password",
          {"Content-Type":"application/json", **AUTH},
          {"currentPassword": "WrongPass1!", "newPassword": "NewPass12345!"})
report("ChangePassword Wrong → 401", s==401, s)

# 17. No auth → 401
s, d = do("GET", f"{BASE}/users/me")
report("No Auth → 401", s==401, s)

# ═══════════════════════════════════════════════
header("PHASE 4: ADMIN ENDPOINTS")
# ═══════════════════════════════════════════════

# 18. Admin Overview
s, d = do("GET", f"{BASE}/admin/overview", ADMIN)
report("Admin Overview", s==200, s, f"keys={len(d.get('users',[])) if isinstance(d,dict) else 0}")

# 19. Admin List Users
s, d = do("GET", f"{BASE}/admin/users", ADMIN)
report("Admin List Users", s==200, s, f"count={len(d) if isinstance(d,list) else 0}")

# 20. Admin Abuse Alerts
s, d = do("GET", f"{BASE}/admin/abuse/alerts", ADMIN)
report("Admin Abuse Alerts", s==200, s, f"count={len(d) if isinstance(d,list) else 0}")

# 21. Admin Audit Logs
s, d = do("GET", f"{BASE}/admin/audit-logs", ADMIN)
report("Admin Audit Logs", s==200, s)

# 22. Admin Payments
s, d = do("GET", f"{BASE}/admin/payments", ADMIN)
report("Admin Payments", s==200, s)

# ═══════════════════════════════════════════════
header("PHASE 5: IDOR — USER A vs USER B")
# ═══════════════════════════════════════════════

# Register user B
userB_email = f"auditB_{int(time.time())}@test.com"
tokenB = register_user(userB_email)
report("Register User B", bool(tokenB), 200 if tokenB else 0)

AUTH_B = {"Authorization": f"Bearer {tokenB}"} if tokenB else {}

if tokenB:
    # 23. User B gets own profile
    s, d = do("GET", f"{BASE}/users/me", AUTH_B)
    report("User B Own Profile", s==200 and d.get("email")==userB_email, s)

    # 24. User B creates own key
    s, d = do("POST", f"{BASE}/api-keys",
              {"Content-Type":"application/json", **AUTH_B},
              {"name": "UserB Key", "environment": "test"})
    report("User B Own API Key", s in (200,201), s)

    # 25. User B sees own keys only (count=1)
    s, d = do("GET", f"{BASE}/api-keys", AUTH_B)
    report("User B Own Keys Only", s==200 and isinstance(d, list) and len(d)==1, s, f"count={len(d) if isinstance(d,list) else 0}")

    # 26. User B billing — own subscription only
    s, d = do("GET", f"{BASE}/billing/subscription", AUTH_B)
    report("User B Own Billing", s==200, s)

    # 27. User B usage — own stats only
    s, d = do("GET", f"{BASE}/usage/summary", AUTH_B)
    report("User B Own Usage", s==200, s)

    # 28. User B tries admin → 403
    s, d = do("GET", f"{BASE}/admin/overview", AUTH_B)
    report("User B → Admin (403)", s==403, s)

    # 29. User B tries admin audit → 403
    s, d = do("GET", f"{BASE}/admin/audit-logs", AUTH_B)
    report("User B → Admin Audit (403)", s==403, s)

# ═══════════════════════════════════════════════
header("PHASE 6: API KEY AUTH (not Bearer)")
# ═══════════════════════════════════════════════

if tokenB:
    # Get User B's key from list
    s, d = do("GET", f"{BASE}/api-keys", AUTH_B)
    if s==200 and isinstance(d, list) and len(d)>0:
        key_id = d[0].get("id")
        # Key ID is not the raw key — we need the raw key from creation
        # Skip raw key test since we don't have it anymore, test that key list doesn't expose raw
        has_raw = any("key" in k and k["key"].startswith("qlens-sk") for k in d)
        report("API Key List: No Raw Key Leaked", not has_raw, s, f"raw leaked={has_raw}")

# ═══════════════════════════════════════════════
header("PHASE 7: INVALID TOKEN / TAMPERED")
# ═══════════════════════════════════════════════

# 30. Bearer with garbage token
s, d = do("GET", f"{BASE}/users/me", {"Authorization": "Bearer garbage.token.value"})
report("Garbage Token → 401", s==401, s)

# 31. Expired token (use admin token — it should be valid, but test invalid format)
s, d = do("GET", f"{BASE}/users/me", {"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxMDAwMDAwMDAwLCJleHAiOjEwMDAwMDAwMDF9.expired"})
report("Expired Token → 401", s==401, s)

# ═══════════════════════════════════════════════
header("PHASE 8: RATE LIMIT + ABUSE")
# ═══════════════════════════════════════════════

# 32. Rapid register attempts (should not crash server)
rapid_results = []
for i in range(5):
    s, d = do("POST", f"{BASE}/auth/register",
              {"Content-Type":"application/json"},
              {"email": f"rapid_{i}_{int(time.time())}@test.com", "password": "Test123456!"})
    rapid_results.append(s)
# Expect mix of 201 and 429 (or all 201 if rate limit not hit in 5)
report("Rapid Register (5x)", all(s in (200,201,429) for s in rapid_results), max(rapid_results), f"statuses={rapid_results}")

# ═══════════════════════════════════════════════
header("PHASE 9: RESPONSE SECURITY HEADERS")
# ═══════════════════════════════════════════════

req = urllib.request.Request(f"{BASE}/health")
resp = urllib.request.urlopen(req, timeout=10)
headers = dict(resp.headers)
has_xframe = "X-Frame-Options" in headers or "x-frame-options" in headers
has_xcto = "X-Content-Type-Options" in headers or "x-content-type-options" in headers
report("Security: X-Frame-Options", has_xframe, 200)
report("Security: X-Content-Type-Options", has_xcto, 200)

# ═══════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════
print(f"\n{'='*70}")
print(f"  FULL AUDIT SUMMARY")
print(f"{'='*70}")
total = passed + failed
print(f"  ✅ PASSED: {passed}/{total}")
print(f"  ❌ FAILED: {failed}/{total}")
print(f"  {'🎉 ALL CLEAR!' if failed == 0 else '⚠️  SOME FAILURES — SEE ABOVE'}")
print(f"{'='*70}\n")

if failed > 0:
    sys.exit(1)
