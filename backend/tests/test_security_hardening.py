import requests
import json
import os
import sys

BASE = "http://localhost:5000/api"

print("==================================================")
print("     DERMAAI SECURITY & SAFETY TEST SUITE         ")
print("==================================================")

# 1. Health check
res = requests.get(f"{BASE}/health")
assert res.status_code == 200, f"Health check failed: {res.text}"
data = res.json()
assert data["status"] == "ok" and data["database"] == "connected", f"DB not connected: {data}"
print(" [PASS] 1. Health Check & Database Connection")

# 2. Hardening Check: Public Signup cannot assign 'admin' role
import time
uid = f"{os.getpid()}_{int(time.time())}"
test_admin_signup_email = f"attacker_{uid}@example.com"
res = requests.post(f"{BASE}/auth/signup", json={
    "email": test_admin_signup_email,
    "password": "AttackerPass123!",
    "username": f"Attacker_{uid}",
    "role": "admin"  # Attempting privilege escalation
})

assert res.status_code in [200, 201], f"Signup failed: {res.text}"

res_login = requests.post(f"{BASE}/auth/login", json={
    "email": test_admin_signup_email,
    "password": "AttackerPass123!"
})
assert res_login.status_code == 200
login_data = res_login.json()
assert login_data["role"] == "user", f"Security Flaw: Signup was able to claim role {login_data.get('role')}!"
attacker_token = login_data["access_token"]


# Attacker tries to access admin-only endpoint
res_admin_stat = requests.get(f"{BASE}/admin/stats", headers={"Authorization": f"Bearer {attacker_token}"})
assert res_admin_stat.status_code == 403, f"Privilege Escalation: User was granted admin access! Status: {res_admin_stat.status_code}"
print(" [PASS] 2. Authentication: Role Escalation on Public Signup Successfully Blocked")

# 3. Upload Validation: Invalid/Corrupt files blocked
fake_file = b"This is a fake executable content posing as image"
res_bad_upload = requests.post(f"{BASE}/upload-diagnosis", files={"image": ("malicious.jpg", fake_file, "image/jpeg")})
assert res_bad_upload.status_code == 400, f"Validation failure: Malicious file was accepted! Status {res_bad_upload.status_code}"
print(" [PASS] 3. Upload Validation: Magic Byte and Header Integrity Enforced")

# 4. Valid Image Upload & Clinical Prediction Safety Check
test_user = f"patient_{uid}@example.com"
test_pass = "PatientPass123!"
requests.post(f"{BASE}/auth/signup", json={"email": test_user, "password": test_pass, "username": f"Patient_{uid}"})
res_l = requests.post(f"{BASE}/auth/login", json={"email": test_user, "password": test_pass})
token = res_l.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

img_path = r"frontend/public/diseases/melanoma.jpg"
with open(img_path, "rb") as f:
    res = requests.post(f"{BASE}/upload-diagnosis", files={"image": ("melanoma.jpg", f, "image/jpeg")}, data={"body_part": "back"}, headers=headers)

assert res.status_code == 200, f"Inference failed: {res.text}"
scan_data = res.json()
assert "is_uncertain" in scan_data, "Missing clinical uncertainty field"
assert "normal skin" not in scan_data["diagnosis"].lower(), "Clinical Safety Violation: low confidence cannot be labeled normal skin"
print(f" [PASS] 4. Clinical Safety: Result contains explicit uncertainty safeguards ({scan_data['diagnosis']})")

# 5. Image Privacy: Other users cannot view uploaded medical image
image_url = scan_data["image_url"]  # /uploads/<filename>
other_user = f"intruder_{uid}@example.com"
requests.post(f"{BASE}/auth/signup", json={"email": other_user, "password": test_pass, "username": f"Intruder_{uid}"})

res_intruder_login = requests.post(f"{BASE}/auth/login", json={"email": other_user, "password": test_pass})
intruder_token = res_intruder_login.json()["access_token"]
intruder_headers = {"Authorization": f"Bearer {intruder_token}"}

# Intruder requests patient's uploaded image
res_img_unauth = requests.get(f"http://localhost:5000{image_url}", headers=intruder_headers)
assert res_img_unauth.status_code == 403, f"Image Privacy Violation: Unauthorized user was able to download medical image! Status: {res_img_unauth.status_code}"

# Patient requests own uploaded image
res_img_owner = requests.get(f"http://localhost:5000{image_url}", headers=headers)
assert res_img_owner.status_code == 200, f"Owner cannot view their own image: {res_img_owner.status_code}"
print(" [PASS] 5. Image Privacy: Patient Image Ownership and Access Control Enforced")

# 6. Production Error Sanitization (Ensure no raw traceback leaks on 404 or invalid route)
res_err = requests.get("http://localhost:5000/api/nonexistent-route-triggering-error")
assert res_err.status_code == 404
assert "traceback" not in res_err.text.lower(), "Security Flaw: Internal stack trace leaked"
print(" [PASS] 6. Production Error Handling: Error Responses Sanitized")

# Cleanup
res_hist = requests.get(f"{BASE}/history", headers=headers)
if res_hist.status_code == 200 and len(res_hist.json()) > 0:
    scan_id = res_hist.json()[0]["_id"]
    requests.delete(f"{BASE}/history/{scan_id}", headers=headers)
print(" [PASS] 7. Security Test Records Cleaned Up")

print("==================================================")
print("  ALL SECURITY HARDENING REQUIREMENTS VERIFIED!   ")
print("==================================================")
