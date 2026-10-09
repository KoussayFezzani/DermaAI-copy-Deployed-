import requests
import json
import os
import sys

BASE = "http://localhost:5000/api"

print("==================================================")
print("     DERMAAI END-TO-END AUTOMATED TEST SUITE      ")
print("==================================================")

# 1. Health check
res = requests.get(f"{BASE}/health")
assert res.status_code == 200, f"Health check failed: {res.text}"
data = res.json()
assert data["status"] == "ok" and data["database"] == "connected", f"DB not connected: {data}"
print(" [PASS] 1. Health Check & Database Connection")

# 2. Registration & Authentication
import time
uid = f"{os.getpid()}_{int(time.time())}"
test_user = f"tester_{uid}@example.com"
test_pass = "SecurePass123!"

res = requests.post(f"{BASE}/auth/signup", json={
    "email": test_user,
    "password": test_pass,
    "username": f"TestUser_{uid}"
})

assert res.status_code in [200, 201], f"Signup failed: {res.text}"
print(f" [PASS] 2. User Registration ({test_user})")

res = requests.post(f"{BASE}/auth/login", json={
    "email": test_user,
    "password": test_pass
})
assert res.status_code == 200, f"Login failed: {res.text}"
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(" [PASS] 3. User Login & JWT Issuance")

# 3. Model Inference & Grad-CAM Generation
img_path = r"frontend/public/diseases/melanoma.jpg"
assert os.path.exists(img_path), "Sample image not found"

with open(img_path, "rb") as f:
    files = {"image": ("melanoma.jpg", f, "image/jpeg")}
    data = {"body_part": "back"}
    res = requests.post(f"{BASE}/upload-diagnosis", files=files, data=data, headers=headers)

assert res.status_code == 200, f"Inference failed: {res.text}"
scan_data = res.json()
assert "diagnosis" in scan_data and "confidence" in scan_data, "Missing prediction fields"
assert scan_data.get("grad_cam_image") and scan_data["grad_cam_image"].startswith("data:image/jpeg;base64,"), "Invalid Grad-CAM"
assert scan_data.get("body_part") == "back", "Missing body part"
print(f" [PASS] 4. Inference & Grad-CAM: {scan_data['diagnosis']} ({scan_data['confidence']*100:.1f}%)")

# 4. History Storage & Retrieval
res = requests.get(f"{BASE}/history", headers=headers)
assert res.status_code == 200, f"History fetch failed: {res.text}"
history = res.json()
assert len(history) >= 1, "No history records found"
scan_id = history[0]["_id"]
print(f" [PASS] 5. Scan History Retrieval ({len(history)} record(s))")

# 5. Access Isolation (Another user cannot view private record)
res2 = requests.post(f"{BASE}/auth/signup", json={
    "email": f"other_{uid}@example.com",
    "password": test_pass,
    "username": f"OtherUser_{uid}"
})
other_token = res2.json().get("access_token")
if not other_token:
    res_l = requests.post(f"{BASE}/auth/login", json={
        "email": f"other_{uid}@example.com",
        "password": test_pass
    })
    other_token = res_l.json()["access_token"]


other_headers = {"Authorization": f"Bearer {other_token}"}
res = requests.get(f"{BASE}/history", headers=other_headers)
assert res.status_code == 200
assert len(res.json()) == 0, "Security Violation: user saw another user's records"

# Try deleting user 1's record as user 2
res = requests.delete(f"{BASE}/history/{scan_id}", headers=other_headers)
assert res.status_code == 404, f"Security Violation: user was able to access or delete foreign record: {res.status_code}"
print(" [PASS] 6. Data Isolation & Authorization Control")

# 6. Local Assistant Query & Streaming
chat_payload = {
    "query": "What are the common symptoms of melanoma?",
    "context": {"diagnosis": scan_data["diagnosis"], "confidence": scan_data["confidence"]},
    "lang": "en"
}
res = requests.post(f"{BASE}/chat-query-stream", json=chat_payload, headers=headers, stream=True)
assert res.status_code == 200, f"Assistant stream failed: {res.status_code}"
streamed_chunks = []
for chunk in res.iter_content(chunk_size=64):
    if chunk:
        streamed_chunks.append(chunk.decode("utf-8", errors="ignore"))
    if len(streamed_chunks) >= 5:
        break

full_preview = "".join(streamed_chunks)
assert len(full_preview.strip()) > 0, "No content streamed from assistant"
print(f" [PASS] 7. Local AI Assistant Streaming (Preview: {full_preview.strip()[:60]}...)")

# 7. Record Cleanup
res = requests.delete(f"{BASE}/history/{scan_id}", headers=headers)
assert res.status_code == 200, f"Scan delete failed: {res.text}"
print(" [PASS] 8. Scan Record & Upload Cleanup")

print("==================================================")
print("      ALL END-TO-END ACCEPTANCE TESTS PASSED      ")
print("==================================================")
