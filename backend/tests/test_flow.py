import requests
import os

BASE_URL = "http://localhost:5000/api"
AUTH_URL = "http://localhost:5000/api/auth"

def get_token():
    response = requests.post(f"{AUTH_URL}/login", json={
        "email": "testuser@example.com",
        "password": "password123"
    })
    if response.status_code == 200:
        return response.json()['access_token']
    return None

def test_upload(token):
    print("Testing Image Upload (Mock)...")
    
    # Create a dummy image if not exists
    dummy_img_path = "test_image.jpg"
    if not os.path.exists(dummy_img_path):
        with open(dummy_img_path, "wb") as f:
            f.write(os.urandom(1024)) # Random bytes
            
    with open(dummy_img_path, "rb") as f:
        files = {'image': f}
        # Note: Upload endpoint might not require auth yet based on code review, 
        # but usually it should. Checking routes.py... it doesn't seem to have @jwt_required.
        # We will try without headers first.
        response = requests.post(f"{BASE_URL}/upload-diagnosis", files=files)
        
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Upload Successful")
        data = response.json()
        print(f"Diagnosis: {data.get('diagnosis')}")
        print(f"Confidence: {data.get('confidence')}")
        return True
    else:
        print(f"Upload Failed: {response.text}")
        return False

if __name__ == "__main__":
    # Ensure user exists first (run test_auth.py or assume it ran)
    token = get_token()
    if test_upload(token):
        print("Flow Test PASSED")
    else:
        print("Flow Test FAILED")
