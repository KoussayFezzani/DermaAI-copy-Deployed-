import requests
import sys

BASE_URL = "http://localhost:5000/api/auth"

def test_signup(email, password):
    print(f"Testing Signup for {email}...")
    response = requests.post(f"{BASE_URL}/signup", json={
        "email": email,
        "password": password
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 201 or response.status_code == 400 # 400 if already exists

def test_login(email, password):
    print(f"Testing Login for {email}...")
    response = requests.post(f"{BASE_URL}/login", json={
        "email": email,
        "password": password
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Login Successful")
        return response.json()['access_token']
    else:
        print(f"Login Failed: {response.json()}")
        return None

if __name__ == "__main__":
    email = "testuser@example.com"
    password = "password123"
    
    if test_signup(email, password):
        token = test_login(email, password)
        if token:
            print("Auth Test PASSED")
        else:
            print("Auth Test FAILED (Login)")
    else:
        print("Auth Test FAILED (Signup)")
