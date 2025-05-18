import requests
import json

# Token ve endpoint
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzQ3NTcyMDE1LCJleHAiOjE3NDc1NzU2MTV9.q24lQTbv5LDQW5n_2494RXmwcGQhd9KLUqOWGUUZFHI"
url = "http://localhost:5000/api/alert/ai-integration"

# Modelin beklediği şekil: [128][63]
dummy_data = [[-55.0 for _ in range(63)] for _ in range(128)]

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

payload = {
    "data": dummy_data
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print("Status:", response.status_code)
try:
    print("Response:", response.json())
except Exception as e:
    print("Raw Response:", response.text)
