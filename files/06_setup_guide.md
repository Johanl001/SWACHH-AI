# 🚀 SWACHH-AI — Setup & Deployment Guide

> **Team Strawhats** | Sanjivani College of Engineering, Kopargaon
> **India Innovate 2026**

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Docker + Docker Compose | v24+ | For broker and cloud services |
| Python | 3.11+ | Edge AI and gateway |
| Node.js | 18+ | Citizen app and admin dashboard |
| Arduino IDE / PlatformIO | Latest | ESP32 firmware |
| Raspberry Pi OS | Bookworm (64-bit) | Pi 4 gateway |
| Google Maps API Key | — | Admin dashboard maps |
| Firebase Project | — | Auth + Realtime DB |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/team-strawhats/swachh-ai.git
cd swachh-ai
```

---

## Step 2 — Backend Services (Docker)

The MQTT broker and optional cloud bridge run in Docker containers.

### 2.1 Configure Mosquitto

Edit `mosquitto/mosquitto.conf`:

```conf
listener 1883
listener 9001
protocol websockets

allow_anonymous false
password_file /mosquitto/config/passwd

persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
```

Create MQTT credentials:

```bash
# Create password file for gateway and dashboard users
docker run --rm -v $(pwd)/mosquitto:/mosquitto eclipse-mosquitto \
  mosquitto_passwd -c /mosquitto/config/passwd gateway_user

# Add dashboard user
docker run --rm -v $(pwd)/mosquitto:/mosquitto eclipse-mosquitto \
  mosquitto_passwd /mosquitto/config/passwd dashboard_user
```

### 2.2 Start Services

```bash
docker compose up -d
```

**`docker-compose.yml` (reference):**
```yaml
version: '3.8'
services:
  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log
    restart: unless-stopped
```

### 2.3 Verify Broker

```bash
# Test publish
docker exec -it <mosquitto_container> mosquitto_pub \
  -h localhost -p 1883 -u gateway_user -P <password> \
  -t swachh/test -m "hello"

# Test subscribe (in another terminal)
docker exec -it <mosquitto_container> mosquitto_sub \
  -h localhost -p 1883 -u dashboard_user -P <password> \
  -t swachh/#
```

---

## Step 3 — Firebase Setup

### 3.1 Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project: `swachh-ai-prod` (or `swachh-ai-dev` for testing)
3. Enable **Authentication** → Sign-in Methods → Email/Password + Google
4. Enable **Realtime Database** → Start in test mode (lock down rules before production)

### 3.2 Firebase Database Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "bins": {
      ".read": "auth !== null",
      ".write": "auth.token.admin === true"
    },
    "routes": {
      ".read": "auth !== null",
      ".write": "auth.token.admin === true"
    }
  }
}
```

### 3.3 Download Config Files

- **Web (Admin Dashboard):** Download `firebaseConfig` object from Project Settings → General → Your Apps
- **Android (Citizen App):** Download `google-services.json` and place in `citizen_app/android/app/`
- **iOS (Citizen App):** Download `GoogleService-Info.plist` and place in `citizen_app/ios/`

---

## Step 4 — Edge AI Setup (Raspberry Pi 4)

### 4.1 Raspberry Pi OS Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Enable Pi Camera
sudo raspi-config
# → Interface Options → Camera → Enable
# → Reboot

# Enable Serial (for bridge ESP32)
sudo raspi-config
# → Interface Options → Serial Port → Disable login shell, Enable serial hardware
```

### 4.2 Install Python Dependencies

```bash
cd edge_ai
pip install -r requirements.txt
```

`requirements.txt`:
```
tflite-runtime==2.14.0
opencv-python-headless==4.9.0.80
paho-mqtt==1.6.1
numpy==1.26.4
RPi.GPIO==0.7.1
pyserial==3.5
```

> **Note:** `tflite-runtime` is the lightweight Pi-compatible package. On a development machine, install `tensorflow` instead.

### 4.3 Download the TFLite Model

Place your trained model file at:
```
swachh-ai/models/yolov8_waste.tflite
```

If you need to train from scratch, see [04_ml_pipeline.md](04_ml_pipeline.md).

### 4.4 Configure Environment

Create `edge_ai/.env`:
```bash
MODEL_PATH=../models/yolov8_waste.tflite
MQTT_BROKER=localhost          # or your Docker host IP
MQTT_PORT=1883
MQTT_USER=gateway_user
MQTT_PASS=your_password
CONFIDENCE_THRESHOLD=0.45
TRIGGER_DISTANCE_CM=20
TRIGGER_PIN=23
ECHO_PIN=24
```

### 4.5 Test Inference

```bash
cd edge_ai
python -c "
from inference import WasteClassifier
c = WasteClassifier('../models/yolov8_waste.tflite')
print('✅ Model loaded. Input shape:', c.input_shape)
"
```

### 4.6 Run Edge AI Service

```bash
# Foreground (development)
python main.py

# Background (production — auto-restart)
nohup python main.py > logs/edge_ai.log 2>&1 &

# As a systemd service (recommended for deployment)
sudo nano /etc/systemd/system/swachh-edge.service
```

**Systemd service file:**
```ini
[Unit]
Description=SWACHH-AI Edge AI Service
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/swachh-ai/edge_ai/main.py
WorkingDirectory=/home/pi/swachh-ai/edge_ai
User=pi
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable swachh-edge
sudo systemctl start swachh-edge
sudo systemctl status swachh-edge
```

---

## Step 5 — ESP32 Firmware

### 5.1 Arduino IDE Setup

1. Open Arduino IDE
2. Go to **File → Preferences → Additional Boards Manager URLs:**
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. **Tools → Board → Boards Manager** → Install `esp32` by Espressif

### 5.2 Configure and Flash

1. Open `firmware/esp_now_slave/esp_now_slave.ino`
2. Set the values for your bin:
   ```cpp
   #define BIN_ID  1   // Unique per bin (0–255)
   uint8_t gatewayMAC[] = {0xAA, 0xBB, ...};  // Your bridge ESP32 MAC
   ```
3. Select **Board:** `ESP32 Dev Module`
4. Select **Port:** your ESP32 COM/tty port
5. Click **Upload**

### 5.3 Verify via Serial Monitor

Open Serial Monitor at 115200 baud. You should see:
```
TX OK
TX OK
[deep sleep for 30s]
TX OK
```

---

## Step 6 — Gateway Bridge

```bash
cd gateway
pip install pyserial paho-mqtt
python esp_now_bridge.py
```

Verify the Pi terminal shows:
```
ESP-NOW bridge listening on /dev/ttyUSB0
Published bin 1: 34.5%
Published bin 2: 81.2%  ← threshold crossed, always published
```

---

## Step 7 — Citizen App (React Native)

### 7.1 Install Dependencies

```bash
cd citizen_app
npm install
```

### 7.2 Configure Firebase

Ensure `google-services.json` is in `android/app/` (see Step 3.3).

Create `src/config/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "swachh-ai-prod.firebaseapp.com",
  databaseURL: "https://swachh-ai-prod-default-rtdb.firebaseio.com",
  projectId: "swachh-ai-prod",
  storageBucket: "swachh-ai-prod.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
```

### 7.3 Run on Android

```bash
# Start Metro bundler
npx react-native start

# In another terminal
npx react-native run-android
```

### 7.4 Build Release APK

```bash
cd android
./gradlew assembleRelease
# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## Step 8 — Admin Dashboard (Next.js)

### 8.1 Install Dependencies

```bash
cd admin_dashboard
npm install
```

### 8.2 Configure Environment

Create `admin_dashboard/.env.local`:
```bash
NEXT_PUBLIC_MQTT_BROKER=ws://localhost:9001
NEXT_PUBLIC_MQTT_USER=dashboard_user
NEXT_PUBLIC_MQTT_PASS=your_password
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://swachh-ai-prod-default-rtdb.firebaseio.com
```

### 8.3 Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### 8.4 Build for Production

```bash
npm run build
npm start
# or deploy to Vercel: npx vercel --prod
```

---

## Step 9 — End-to-End Verification

Run this checklist to confirm the full system is working:

```
[ ] Docker: Mosquitto broker running on ports 1883 and 9001
[ ] Firebase: Project created, Auth enabled, DB rules set
[ ] Pi: Edge AI service running (systemd status = active)
[ ] ESP32: At least one bin node flashing and sending TX OK
[ ] Gateway: Bridge script running, publishing to MQTT
[ ] Dashboard: Opens at localhost:3000, bin markers visible on map
[ ] Citizen App: Login works, GreenDashboard loads credits
[ ] End-to-end: Place object in front of Pi camera → credit appears in app
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| MQTT `Connection refused` | Broker not running / wrong port | `docker compose up -d`, check ports |
| `tflite_runtime not found` | Wrong package on dev machine | Use `tensorflow` on x86; `tflite-runtime` on Pi |
| ESP32 `ESP-NOW init failed` | WiFi mode not set | Ensure `WiFi.mode(WIFI_STA)` before init |
| App crashes on launch | `google-services.json` missing | Place in `android/app/` directory |
| Map not loading in dashboard | Missing Google Maps API key | Set in `.env.local`, enable Maps JS API |
| Serial bridge reads garbage | Wrong baud rate | Both sides must be 115200 |

---

*Team Strawhats | Sanjivani College of Engineering, Kopargaon | India Innovate 2026*
