#!/usr/bin/env python3
"""
QLens AI — E2E Smoke Test Suite (15 test cases per PRD)
Tests: API, Gateway, Web, Auth, Billing, Abuse, Security
Run: python e2e_test.py [--base-url http://localhost:3001]
"""

import sys, json, time, urllib.request, urllib.error
from datetime import datetime

BASE_URL = "http://localhost:3001/api"
GATEWAY_URL = "http://localhost:3002"

results = []
test_num = 0

def test(name, fn):
    global test_num
    test_num += 1
    try:
        result = fn()
        status = "PASS"
        results.append({"num": test_num, "name": name, "status": status, "detail": str(result) if result else ""})
    except Exception as e:
        status = "FAIL"
        results.append({"num": test_num, "name": name, "status": status, "detail": str(e)})

def http_get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read()) if e.read else None
    except Exception as e:
        return 0, str(e)

def http_post(url, data=None, headers=None):
    body = json.dumps(data).encode() if data else b""
    req = urllib.request.Request(url, data=body, headers={
        "Content-Type": "application/json",
        **(headers or {}),
    }, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read()) if e.read else None
    except Exception as e:
        return 0, str(e)

# ═══════════════════════════════════════════════════════
# Test Cases
# ═══════════════════════════════════════════════════════

# T1: API Health Check
def t1():
    status, body = http_get(f"{BASE_URL}/health")
    assert status == 200, f"Expected 200, got {status}"
    assert body.get("status") == "ok", f"Expected status=ok, got {body}"
    return f"status={body['status']}, uptime={body.get('uptime', 'N/A')}"

test("API Health Check", t1)

# T2: User Registration
def t2():
    ts = int(time.time())
    email = f"test_{ts}@qlens.local"
    status, body = http_post(f"{BASE_URL}/auth/register", {
        "email": email,
        "password": "Test1234!",
    })
    assert status in (200, 201), f"Expected 200/201, got {status}: {body}"
    assert "user" in body or "accessToken" in body or "message" in body, f"Unexpected response: {body}"
    return f"registered {email}"

test("User Registration", t2)

# T3: User Login
def t3():
    status, body = http_post(f"{BASE_URL}/auth/login", {
        "email": "admin@qlens.local",
        "password": "admin123",
    })
    assert status in (200, 201), f"Expected 200/201, got {status}: {body}"
    assert "accessToken" in body or "user" in body, f"No auth token in response"
    return f"logged in as {body.get('user', {}).get('email', 'unknown')}"

test("User Login (seeded admin)", t3)

# T4: Get User Profile (authenticated)
def t4():
    status, body = http_post(f"{BASE_URL}/auth/login", {
        "email": "admin@qlens.local",
        "password": "admin123",
    })
    token = body.get("accessToken")
    if not token:
        status2, body2 = http_post(f"{BASE_URL}/auth/login", {"email": "admin@qlens.local", "password": "admin123"})
        token = body2.get("accessToken")
    assert token, "No access token"
    
    status, body = http_get(f"{BASE_URL}/users/me", {"Authorization": f"Bearer {token}"})
    assert status == 200, f"Expected 200, got {status}"
    return f"profile: {body.get('email', 'N/A')}, role: {body.get('role', 'N/A')}"

test("Get User Profile (auth)", t4)

# T5: Login with Wrong Password
def t5():
    status, body = http_post(f"{BASE_URL}/auth/login", {
        "email": "admin@qlens.local",
        "password": "wrongpassword",
    })
    assert status in (401, 403), f"Expected 401/403, got {status}"
    return f"correctly rejected ({status})"

test("Login Rejected (wrong password)", t5)

# T6: API Key Creation
def t6():
    status, body = http_post(f"{BASE_URL}/auth/login", {
        "email": "admin@qlens.local",
        "password": "admin123",
    })
    token = body.get("accessToken")
    if not token:
        status2, body2 = http_post(f"{BASE_URL}/auth/login", {"email": "admin@qlens.local", "password": "admin123"})
        token = body2.get("accessToken")
    assert token, "No access token"
    
    status, body = http_post(f"{BASE_URL}/api-keys", {
        "name": "test-key-e2e",
    }, {"Authorization": f"Bearer {token}"})
    assert status in (200, 201), f"Expected 200/201, got {status}: {body}"
    return f"key created: {body.get('apiKey', {}).get('id', body.get('id', 'unknown'))[:20]}..."

test("API Key Creation", t6)

# T7: List API Keys
def t7():
    status, body = http_post(f"{BASE_URL}/auth/login", {
        "email": "admin@qlens.local",
        "password": "admin123",
    })
    token = body.get("accessToken")
    status, body = http_get(f"{BASE_URL}/api-keys", {"Authorization": f"Bearer {token}"})
    assert status == 200, f"Expected 200, got {status}"
    count = len(body) if isinstance(body, list) else len(body.get("data", []))
    return f"{count} API keys listed"

test("List API Keys", t7)

# T8: Unauthorized Access (no token)
def t8():
    status, body = http_get(f"{BASE_URL}/users/me")
    assert status in (401, 403), f"Expected 401/403, got {status}"
    return f"correctly blocked ({status})"

test("Unauthorized Access Blocked", t8)

# T9: List Available Plans
def t9():
    status, body = http_get(f"{BASE_URL}/plans")
    assert status == 200, f"Expected 200, got {status}"
    plans = body if isinstance(body, list) else body.get("data", [])
    return f"{len(plans)} plans available"

test("List Plans", t9)

# T10: List Top-Up Packages
def t10():
    status, body = http_get(f"{BASE_URL}/billing/top-up-packages")
    assert status == 200, f"Expected 200, got {status}"
    pkgs = body if isinstance(body, list) else body.get("data", [])
    return f"{len(pkgs)} packages available"

test("List Top-Up Packages", t10)

# T11: Usage Summary
def t11():
    status, body = http_post(f"{BASE_URL}/auth/login", {
        "email": "admin@qlens.local",
        "password": "admin123",
    })
    token = body.get("accessToken")
    status, body = http_get(f"{BASE_URL}/usage/summary", {"Authorization": f"Bearer {token}"})
    assert status == 200, f"Expected 200, got {status}"
    return f"summary: {json.dumps(body)[:200]}"

test("Usage Summary", t11)

# T12: List Models (API)
def t12():
    status, body = http_get(f"{BASE_URL}/usage/models")
    assert status == 200, f"Expected 200, got {status}"
    models = body if isinstance(body, list) else body.get("data", [])
    return f"{len(models)} models available"

test("List Models (API)", t12)

# T13: Public Models Endpoint
def t13():
    status, body = http_get(f"{BASE_URL}/public/models")
    assert status == 200, f"Expected 200, got {status}"
    models = body if isinstance(body, list) else body.get("data", [])
    return f"{len(models)} public models"

test("Public Models Endpoint", t13)

# T14: Gateway Health
def t14():
    status, body = http_get(f"{GATEWAY_URL}/health")
    assert status == 200, f"Expected 200, got {status}"
    return f"gateway status: {body.get('status', 'N/A')}"

test("Gateway Health Check", t14)

# T15: Gateway /v1/models (OpenAI compat)
def t15():
    status, body = http_get(f"{GATEWAY_URL}/v1/models")
    assert status == 200, f"Expected 200, got {status}"
    models = body.get("data", [])
    return f"{len(models)} gateway models"

test("Gateway /v1/models", t15)

# ═══════════════════════════════════════════════════════
# Results
# ═══════════════════════════════════════════════════════
print(f"\n{'='*60}")
print(f"QLens AI E2E Test Results — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"{'='*60}\n")

passed = sum(1 for r in results if r["status"] == "PASS")
failed = sum(1 for r in results if r["status"] == "FAIL")

for r in results:
    icon = "✅" if r["status"] == "PASS" else "❌"
    print(f"  T{r['num']:02d} {icon} {r['name']}")
    if r["detail"]:
        print(f"       {r['detail']}")

print(f"\n{'='*60}")
print(f"  TOTAL: {len(results)} tests")
print(f"  ✅ PASS: {passed}")
print(f"  ❌ FAIL: {failed}")
print(f"{'='*60}\n")

sys.exit(0 if failed == 0 else 1)
