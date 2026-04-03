# 🏗️ SWACHH-AI — System Architecture & Technical Design

> **Team Strawhats** | Sanjivani College of Engineering, Kopargaon
> **India Innovate 2026**

---

## 1. Architecture Overview

SWACHH-AI follows a **three-tier edge-to-cloud architecture**: Edge Nodes → Gateway Layer → Cloud Layer, with two consumer-facing interfaces (Citizen App + Admin Dashboard) connecting to the cloud.

```
╔══════════════════════════════════════════════════════════════════╗
║                        CLOUD LAYER                              ║
║                                                                  ║
║   ┌─────────────────┐          ┌──────────────────────────────┐ ║
║   │  Firebase RTDB  │◄────────►│   Mosquitto MQTT Broker      │ ║
║   │  (User data,    │          │   Port 1883 (MQTT)           │ ║
║   │   credits,      │          │   Port 9001 (WebSocket)      │ ║
║   │   leaderboard)  │          └──────────────┬───────────────┘ ║
║   └─────────────────┘                         │                 ║
║           │                                   │                 ║
║   ┌────────┴────────┐          ┌──────────────┴───────────────┐ ║
║   │  Citizen App    │          │   Admin Dashboard            │ ║
║   │  React Native   │          │   Next.js 14 (App Router)    │ ║
║   │  Android / iOS  │          │   Google Maps + A* Routing   │ ║
║   └─────────────────┘          └──────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════╝
                          ▲ MQTT over TLS / WebSocket
╔══════════════════════════════════════════════════════════════════╗
║                    GATEWAY LAYER (Raspberry Pi 4)               ║
║                                                                  ║
║  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐ ║
║  │  Edge AI Module  │  │ ESP-NOW Bridge │  │  MQTT Publisher  │ ║
║  │  YOLOv8n TFLite  │  │ Serial RX from │  │  Paho Client     │ ║
║  │  Pi Camera Mod 3 │  │ bridge ESP32   │  │  State-change    │ ║
║  │  HC-SR04 trigger │  │ Binary→JSON    │  │  logic           │ ║
║  └─────────────────┘  └────────────────┘  └──────────────────┘ ║
╚══════════════════════════════════════════════════════════════════╝
                          ▲ ESP-NOW (2.4GHz, no router)
╔══════════════════════════════════════════════════════════════════╗
║                    EDGE NODES (ESP32 × N)                       ║
║                                                                  ║
║   [Bin Node 1]        [Bin Node 2]        [Bin Node N]          ║
║   HC-SR04             HC-SR04             HC-SR04               ║
║   Fill Level          Fill Level          Fill Level            ║
║   → Deep Sleep 30s    → Deep Sleep 30s    → Deep Sleep 30s      ║
║   → Wake → Read       → Wake → Read       → Wake → Read         ║
║   → ESP-NOW TX        → ESP-NOW TX        → ESP-NOW TX          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 2. Technology Stack

### 2.1 Hardware

| Component | Model | Purpose |
|-----------|-------|---------|
| Gateway SBC | Raspberry Pi 4 (4GB RAM) | Edge AI inference + MQTT bridge |
| Camera | Pi Camera Module 3 | Waste image capture |
| Bin MCU | ESP32 DevKit v1 | Fill-level sensing + mesh comms |
| Distance Sensor | HC-SR04 Ultrasonic | Trigger (≤20cm) + fill measurement |
| Bridge MCU | ESP32 (USB to Pi) | Relay ESP-NOW packets to Pi via Serial |

### 2.2 Software

| Layer | Technology | Version |
|-------|-----------|---------|
| Edge AI Inference | Python + TFLite Runtime | Python 3.11 |
| ML Model | YOLOv8n (Ultralytics) | v8.x |
| Model Format | TFLite INT8 | 320×320, ~3MB |
| ESP32 Firmware | Arduino C++ | ESP-IDF compatible |
| MQTT Broker | Eclipse Mosquitto | 2.x |
| MQTT Client (Pi) | Paho MQTT | 1.6.x |
| Cloud Database | Firebase Realtime DB | v10 SDK |
| Citizen App | React Native | 0.73+ |
| Admin Dashboard | Next.js | 14 (App Router) |
| Maps | Google Maps API | Maps JS + React Native Maps |
| Containerization | Docker + Compose | v24+ |

---

## 3. Data Flow — Bin Monitoring Path

```
[HC-SR04 Sensor on ESP32]
        │
        │  Reads distance every 30s (after deep sleep wake)
        ▼
[ESP32 computes fill_pct = ((max_depth - distance) / max_depth) × 100]
        │
        │  Packs binary struct: <BfffII> (21 bytes)
        │  Transmits via ESP-NOW to Bridge ESP32 MAC
        ▼
[Bridge ESP32 (USB-connected to Raspberry Pi)]
        │
        │  Forwards raw bytes over USB Serial (115200 baud)
        ▼
[esp_now_bridge.py on Raspberry Pi]
        │
        │  Unpacks struct → JSON payload
        │  {"bin_id": 3, "fill_pct": 72.4, "battery_v": 3.71, ...}
        ▼
[mqtt_client.py — State-Change Logic]
        │
        │  Publishes ONLY IF:
        │    fill_pct changed ≥ 5% since last publish, OR
        │    fill_pct crossed 80% threshold
        ▼
[MQTT Broker — topic: swachh/bin_status]
        │
        ├──► Admin Dashboard (WebSocket MQTT.js) → Updates map markers
        └──► Firebase RTDB → Persists for historical analytics
```

---

## 4. Data Flow — Waste Classification Path

```
[HC-SR04 on Raspberry Pi GPIO]
        │
        │  Polls distance every 500ms
        ▼
[sensor_trigger.py: distance ≤ 20cm?]
        │  YES
        ▼
[Pi Camera Module 3 captures frame]
        │
        ▼
[inference.py — WasteClassifier]
        │
        │  Pre-process: resize to 320×320, normalize [0,1]
        │  Run TFLite INT8 interpreter
        │  NMS → top detection (class, confidence, bbox)
        ▼
[green_credit.py — Credit Engine]
        │
        │  class → credit value (Organic:10, Paper:15, Plastic:25, Metal:30)
        │  Verification: SHA-256(user_id + timestamp + waste_type)
        ▼
[main.py publishes to MQTT]
        │
        │  topic: swachh/user_reward
        │  {"user_id": "...", "waste_type": "Plastic", "credits": 25, "hash": "..."}
        ▼
[Firebase RTDB]
        │
        ├──► User credit balance updated
        └──► Citizen App receives push notification
```

---

## 5. Module Descriptions

### 5.1 Module A — Edge AI (`edge_ai/`)

**Purpose:** On-device waste classification with privacy preservation and zero cloud dependency for inference.

**File Structure:**
```
edge_ai/
├── main.py              # Orchestrator: sensor → camera → classify → publish
├── inference.py         # WasteClassifier class (TFLite runtime)
├── sensor_trigger.py    # HC-SR04 distance measurement via GPIO
├── green_credit.py      # Credit engine + SHA-256 verification
├── config.py            # MODEL_PATH, MQTT_BROKER, thresholds, GPIO pins
└── requirements.txt     # opencv-python-headless, tflite-runtime, paho-mqtt, numpy
```

**Key Config (`config.py`):**
```python
MODEL_PATH = "models/yolov8_waste.tflite"
INPUT_SIZE = (320, 320)
CONFIDENCE_THRESHOLD = 0.45
TRIGGER_DISTANCE_CM = 20
TRIGGER_PIN = 23      # HC-SR04 TRIG (GPIO BCM)
ECHO_PIN = 24         # HC-SR04 ECHO (GPIO BCM)
MQTT_BROKER = "localhost"
CLASS_NAMES = ["Organic", "Paper", "Plastic", "Metal"]
CREDIT_TABLE = {"Organic": 10, "Paper": 15, "Plastic": 25, "Metal": 30}
```

---

### 5.2 Module B — IoT Mesh (`firmware/` + `gateway/`)

**Purpose:** Low-cost, low-power, router-free bin monitoring across an entire neighbourhood.

**ESP-NOW Binary Payload (21 bytes, struct format `<BfffII`):**

| Byte(s) | Field | Type | Description |
|---------|-------|------|-------------|
| 0 | bin_id | uint8 | Unique bin identifier (0–255) |
| 1–4 | fill_pct | float32 | Fill percentage (0.0–100.0) |
| 5–8 | distance_cm | float32 | Raw ultrasonic distance |
| 9–12 | battery_v | float32 | Battery voltage (3.0–4.2V) |
| 13–16 | reading_count | uint32 | Cumulative readings since boot |
| 17–20 | timestamp | uint32 | Unix timestamp (seconds) |

**Power Profile:**
- Active (reading + TX): ~160mA for ~200ms
- Deep sleep: ~10µA
- Average current @ 30s cycle: ~1.07mA
- Estimated battery life (2000mAh Li-ion): **~78 days**

---

### 5.3 Module C — Citizen App (`citizen_app/`)

**Purpose:** Gamified mobile interface to incentivize correct waste segregation.

**Rank System (`gamification.js`):**

| Rank | Min EXP | Badge Color | Bonus Multiplier |
|------|---------|-------------|-----------------|
| Bronze Scavenger | 0 | 🟤 Bronze | 1.0× |
| Silver Sorter | 500 | ⚪ Silver | 1.2× |
| Gold Guardian | 1,500 | 🟡 Gold | 1.5× |
| Platinum Pioneer | 3,500 | 🔵 Platinum | 1.8× |
| Diamond Defender | 7,000 | 💎 Diamond | 2.5× |

**Key Screens:**
- `GreenDashboard.js` — Credits balance, rank progress, daily quests, impact stats
- `LiveMap.js` — Color-coded bin pins (🟢 <60% | 🟡 60–80% | 🔴 >80%)
- `RedemptionStore.js` — Vouchers for local businesses, bus passes, etc.

---

### 5.4 Module D — Admin Dashboard (`admin_dashboard/`)

**Purpose:** Command centre for municipal administrators and logistics managers.

**A\* Route Optimization Logic (`astar.js`):**
1. Fetch all bins with `fill_pct ≥ 80%` from Firebase
2. Build a weighted graph of bin locations using GPS coordinates
3. Heuristic: Haversine distance to nearest unvisited critical bin
4. Output: Ordered list of bin IDs with estimated travel time and total distance
5. Render on Google Maps with polyline route for driver navigation

**Real-time Data Pipeline:**
```
MQTT Broker (ws://broker:9001)
    └── mqtt.js subscribes to swachh/#
        ├── swachh/bin_status → BinMap.js updates marker color
        └── swachh/route_update → RoutePanel.js refreshes route
```

---

## 6. Security Design

| Concern | Mitigation |
|---------|-----------|
| Reward spoofing | SHA-256 hash of (user_id + timestamp + waste_type) verified server-side |
| MQTT unauthorized publish | Mosquitto ACL — ESP32/Pi nodes authenticated with username+password |
| Dashboard access | Firebase Auth (email/password + Google SSO) with role-based access |
| ESP-NOW eavesdropping | Encrypted payloads using ESP-NOW built-in CCMP (AES-128) |
| API abuse | Firebase Security Rules restrict writes to authenticated users only |

---

## 7. Scalability Considerations

- **Horizontal ESP-NOW scaling:** Each gateway Pi handles up to ~200 ESP32 nodes; add more Pi gateways for larger zones
- **MQTT broker clustering:** Mosquitto supports bridge mode for multi-broker deployments across city zones
- **Firebase sharding:** Bin data partitioned by city/zone for efficient queries
- **State-change MQTT optimization:** Reduces cloud data ingestion by ~80% vs. continuous publishing
- **Model updates:** TFLite model can be pushed OTA to Pi gateways via MQTT file transfer topic

---

## 8. Directory Structure

```
swachh-ai/
├── edge_ai/                  # Module A — Pi inference
│   ├── main.py
│   ├── inference.py
│   ├── sensor_trigger.py
│   ├── green_credit.py
│   ├── config.py
│   └── requirements.txt
├── firmware/
│   └── esp_now_slave/
│       └── esp_now_slave.ino # Module B — ESP32 firmware
├── gateway/                  # Module B — Pi gateway
│   ├── esp_now_bridge.py
│   └── mqtt_client.py
├── citizen_app/              # Module C — React Native
│   └── src/
│       ├── screens/
│       │   ├── GreenDashboard.js
│       │   ├── LiveMap.js
│       │   └── RedemptionStore.js
│       └── utils/
│           └── gamification.js
├── admin_dashboard/          # Module D — Next.js
│   └── src/
│       ├── components/
│       │   ├── BinMap.js
│       │   └── RoutePanel.js
│       └── lib/
│           ├── mqtt.js
│           └── astar.js
├── models/                   # YOLOv8 training pipeline
│   ├── train.py
│   ├── export_model.py
│   ├── prepare_dataset.py
│   └── data.yaml
├── mosquitto/                # Broker config
├── docker-compose.yml
└── CLAUDE.md
```

---

*Team Strawhats | Sanjivani College of Engineering, Kopargaon | India Innovate 2026*
