import requests
import json
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE = "http://localhost:5000/api"

def run_tests():
    print("==================================================")
    print("   ASSISTANT STREAMING & SYSTEM EDGE CASE TESTS   ")
    print("==================================================")
    
    # 1. Health & Readiness
    try:
        r_health = requests.get(f"{BASE}/health", timeout=5)
        print("1. /api/health ->", r_health.status_code, r_health.json())
        assert r_health.status_code == 200
        
        r_ready = requests.get(f"{BASE}/readiness", timeout=5)
        print("2. /api/readiness ->", r_ready.status_code, r_ready.json())
        assert r_ready.status_code == 200
        assert r_ready.json()["status"] == "ready"
    except Exception as e:
        print(f"Backend not responding on {BASE}: {e}")
        return False

    # 3. Unauthenticated request must be rejected with 401
    r_unauth = requests.post(f"{BASE}/chat-query-stream", json={"query": "test"}, timeout=5)
    print("3. Unauthenticated request -> status:", r_unauth.status_code, "body:", r_unauth.text.strip())
    assert r_unauth.status_code == 401, "Expected 401 for unauthenticated request"

    # Authenticate a test user
    import time
    ts = int(time.time())
    email = f"chat_tester_{ts}@example.com"
    pwd = "ChatPassword123!"
    requests.post(f"{BASE}/auth/signup", json={"email": email, "password": pwd, "username": f"ChatUser_{ts}"}, timeout=5)
    login_res = requests.post(f"{BASE}/auth/login", json={"email": email, "password": pwd}, timeout=5)
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 4. Empty query
    r_empty = requests.post(f"{BASE}/chat-query-stream", json={"query": ""}, headers=headers, timeout=5)
    print("4. Empty prompt response -> status:", r_empty.status_code, "body:", r_empty.text.strip())
    assert r_empty.status_code in [400, 200], f"Unexpected status {r_empty.status_code}"

    # 5. Whitespace query
    r_space = requests.post(f"{BASE}/chat-query-stream", json={"query": "     "}, headers=headers, timeout=5)
    print("5. Whitespace prompt response -> status:", r_space.status_code, "body:", r_space.text.strip())
    assert r_space.status_code in [400, 200]

    # 5. Malformed payload
    r_malformed = requests.post(f"{BASE}/chat-query-stream", data="invalid json string", headers=headers, timeout=5)
    print("5. Malformed JSON response -> status:", r_malformed.status_code, "body:", r_malformed.text.strip())
    assert r_malformed.status_code in [400, 415, 500]

    # 6. Arabic prompt streaming
    r_ar = requests.post(f"{BASE}/chat-query-stream", json={
        "query": "ما هي علامات الشامة الخطيرة؟",
        "context": {"diagnosis": "Melanoma", "confidence": 0.85},
        "lang": "ar"
    }, headers=headers, stream=True, timeout=60)
    print("6. Arabic prompt -> status:", r_ar.status_code)
    assert r_ar.status_code == 200
    chunk_ar = next(r_ar.iter_content(chunk_size=128), b"").decode("utf-8", errors="ignore")
    print("   Arabic chunk preview:", repr(chunk_ar[:80]))
    assert len(chunk_ar) > 0

    # 7. French prompt streaming
    r_fr = requests.post(f"{BASE}/chat-query-stream", json={
        "query": "Quels sont les facteurs de risque du mélanome?",
        "context": {"diagnosis": "Melanoma", "confidence": 0.85},
        "lang": "fr"
    }, headers=headers, stream=True, timeout=60)
    print("7. French prompt -> status:", r_fr.status_code)
    assert r_fr.status_code == 200
    chunk_fr = next(r_fr.iter_content(chunk_size=128), b"").decode("utf-8", errors="ignore")
    print("   French chunk preview:", repr(chunk_fr[:80]))
    assert len(chunk_fr) > 0

    # 8. Long prompt (2,000 chars)
    long_prompt = "Explain dermatology symptoms in detail. " * 50
    r_long = requests.post(f"{BASE}/chat-query-stream", json={"query": long_prompt, "lang": "en"}, headers=headers, stream=True, timeout=60)
    print("8. Long prompt -> status:", r_long.status_code)
    assert r_long.status_code == 200
    chunk_long = next(r_long.iter_content(chunk_size=128), b"").decode("utf-8", errors="ignore")
    print("   Long query chunk preview:", repr(chunk_long[:80]))
    assert len(chunk_long) > 0

    print("==================================================")
    print(" ALL ASSISTANT STREAMING & SYSTEM TESTS PASSED!   ")
    print("==================================================")
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
