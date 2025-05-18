import websocket
import json
import base64

# Sunucuya bağlan
WS_URL = "ws://localhost:5000"

def on_message(ws, message):
    msg = json.loads(message)
    print("🔁 Cevap:", msg)

def on_error(ws, error):
    print("❌ WS hata:", error)

def on_close(ws, close_status_code, close_msg):
    print("🔌 WS kapandı.")

def on_open(ws):
    print("📡 WS bağlantı açık, base64 veri gönderiliyor...")

    # scream_base64.txt içinden base64 veriyi oku
    with open("cleaned_base64.txt", "r") as f:
         base64_audio = f.read().replace("\n", "")


    payload = {
        "action": "aiIntegration",
        "data": base64_audio
    }

    ws.send(json.dumps(payload))

# Başlat
websocket.enableTrace(True)
ws = websocket.WebSocketApp(WS_URL,
                            on_open=on_open,
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)

ws.run_forever()
