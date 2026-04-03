# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SWACHH-AI is an end-to-end IoT + AI platform for smart waste management, built for India Innovate 2026. It comprises four modules working together:

1. **Edge AI (Raspberry Pi 4)** - YOLOv8 TFLite waste classification using Pi Camera + ultrasonic trigger
2. **IoT Mesh (ESP32)** - ESP-NOW peer-to-peer network for bin sensors (HC-SR04), deep sleep for power efficiency
3. **Citizen App (React Native)** - Gamified mobile app with green credits, ranks, quests, and redemption store
4. **Admin Dashboard (Next.js)** - Real-time logistics dashboard with A* route optimization on Google Maps

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUD LAYER                               │
│   Firebase/MQTT  ←→  Admin Dashboard  +  Citizen App             │
└──────────────────────┬──────────────────────────────────────────┘
                       │ MQTT (WebSocket ws://:9001)
┌──────────────────────┴──────────────────────────────────────────┐
│                   GATEWAY LAYER (Raspberry Pi 4)               │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │ Edge AI      │  │ ESP-NOW       │  │ MQTT Client          │ │
│  │ YOLOv8       │  │ Serial Bridge │  │ Paho                 │ │
│  │ (Python)     │  │ (Python)      │  │ (paho-mqtt)          │ │
│  └──────────────┘  └───────────────┘  └──────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │ ESP-NOW (no WiFi router needed)
┌──────────────────────┴──────────────────────────────────────────┐
│                    EDGE NODES (ESP32 × N)                        │
│       HC-SR04 Ultrasonic → Fill Level → ESP-NOW TX              │
│       Deep sleep 30s between readings                           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Topics:**
- `swachh/bin_status` - Bin fill level updates from ESP32 nodes
- `swachh/user_reward` - Classification rewards from Edge AI
- `swachh/route_update` - Route optimization commands

## Module Structure

### Edge AI (`edge_ai/`)
- `main.py` - Main orchestration service (sensor → camera → classify → MQTT)
- `inference.py` - `WasteClassifier` class for YOLOv8 TFLite inference
- `sensor_trigger.py` - HC-SR04 ultrasonic sensor interface
- `green_credit.py` - Credit calculation engine (Organic:10, Plastic:25, Paper:15, Metal:30)
- `config.py` - Configuration (MODEL_PATH, MQTT_BROKER, INPUT_SIZE=320×320)

**Running:**
```bash
cd edge_ai
pip install -r requirements.txt  # opencv-python-headless, tflite-runtime, paho-mqtt, numpy
python main.py
```

### ESP32 Firmware (`firmware/esp_now_slave/`)
- `esp_now_slave.ino` - Arduino firmware for ESP32 bin nodes
- Uses ESP-NOW protocol (peer-to-peer, no router)
- Deep sleep 30 seconds between readings
- Payload struct: `{bin_id, fill_pct, distance_cm, battery_v, reading_count, timestamp}`

### Gateway (`gateway/`)
- `esp_now_bridge.py` - Serial bridge receives ESP-NOW packets via USB ESP32, parses binary struct to JSON
- `mqtt_client.py` - Publishes bin data to MQTT broker

### Citizen App (`citizen_app/`)
- React Native with bottom-tab navigation
- `src/utils/gamification.js` - Rank system (Bronze→Silver→Gold→Platinum→Diamond), credit calculation, daily quests
- `src/screens/GreenDashboard.js` - Main dashboard with progress, quests, impact stats
- `src/screens/LiveMap.js` - Real-time bin availability map
- `src/screens/RedemptionStore.js` - Credit redemption

**Running:**
```bash
cd citizen_app
npm install
npx react-native run-android
# or: npx react-native run-ios
```

### Admin Dashboard (`admin_dashboard/`)
- Next.js 14 with App Router
- `src/components/BinMap.js` - Google Maps with real-time bin markers
- `src/components/RoutePanel.js` - A* route optimization UI
- `src/lib/mqtt.js` - Browser MQTT over WebSocket
- `src/lib/astar.js` - Route optimization algorithm

**Running:**
```bash
cd admin_dashboard
npm install
npm run dev  # http://localhost:3000
```

### ML Training Pipeline (`models/`)
- `train.py` - YOLOv8 Nano training (target: mAP@0.5 > 92%, precision > 93%)
- `export_model.py` - Export to TFLite INT8 (320×320, ~3MB), ONNX, NCNN
- `prepare_dataset.py` - Merge TrashNet + custom dataset, apply augmentation
- `data.yaml` - Dataset configuration (4 classes: Plastic, Organic, Paper, Metal)

**Training:**
```bash
cd models
pip install -r requirements.txt  # ultralytics, torch, tensorflow, opencv-python
python train.py --epochs 100 --batch 16
python export_model.py --model runs/detect/swachh_waste/weights/best.pt --format tflite
```

## Key Design Patterns

### MQTT State-Change Optimization
ESP32 nodes only publish when `fill_pct` changes by ≥ 5% or on threshold crossings (80% critical). This minimizes data usage on cellular/satellite uplinks.

### Green Credit System
Credits are weighted by recyclability value:
- Organic: 10 (compost value)
- Paper: 15 (recyclable)
- Plastic: 25 (high environmental impact)
- Metal: 30 (highest recyclability)

Verification signal is a SHA-256 hash of user_id + timestamp + waste_type to prevent spoofing.

### ESP-NOW Binary Protocol
The struct format `<BfffII` (21 bytes) is used for minimal airtime:
- 1 byte: bin_id
- 4 bytes: fill_pct (float)
- 4 bytes: distance_cm (float)
- 4 bytes: battery_v (float)
- 4 bytes: reading_count (uint32)
- 4 bytes: timestamp (uint32)

## Environment Variables

**Edge AI:**
- `MODEL_PATH` - Path to TFLite model (default: `models/yolov8_waste.tflite`)
- `MQTT_BROKER` - MQTT broker hostname (default: `localhost`)
- `CONFIDENCE_THRESHOLD` - Detection threshold (default: `0.45`)
- `TRIGGER_PIN`, `ECHO_PIN` - HC-SR04 GPIO pins (default: `23`, `24`)

**Admin Dashboard:**
- `NEXT_PUBLIC_MQTT_BROKER` - WebSocket broker URL (default: `ws://localhost:9001`)

## Testing & Validation

**Model Validation:**
```bash
cd models
python train.py --validate-only runs/detect/swachh_waste/weights/best.pt
```

**Edge AI Inference Test:**
```bash
cd edge_ai
python -c "from inference import WasteClassifier; c = WasteClassifier(); print('Model loaded:', c.input_shape)"
```

## Dependencies to Note

- **Edge AI:** Uses `tflite-runtime` on Raspberry Pi, falls back to `tensorflow.lite` on development machines
- **React Native:** Uses `@react-native-async-storage/async-storage` for local state, `mqtt` package for real-time updates
- **Next.js:** Uses `@react-google-maps/api` for maps, requires Google Maps API key

## Hardware Requirements

| Component | Specification |
|-----------|---------------|
| Master Gateway | Raspberry Pi 4 (4GB RAM) |
| Camera | Pi Camera Module 3 |
| Bin Nodes | ESP32 DevKit v1 |
| Distance Sensor | HC-SR04 Ultrasonic |
| AI Model | YOLOv8n quantized TFLite (320×320, ~3MB) |

## Common Development Tasks

**Add new waste class:**
1. Update `models/data.yaml` - increment `nc`, add class name
2. Update `edge_ai/config.py` - `CLASS_NAMES` and `CREDIT_TABLE`
3. Update `citizen_app/src/utils/gamification.js` - colors, rank bonuses
4. Retrain model with new dataset

**Adjust MQTT broker:**
- Mosquitto config in `mosquitto/` directory
- Default ports: 1883 (MQTT), 9001 (WebSocket)

**Debug ESP-NOW communication:**
- Gateway logs to `logs/edge_ai.log`
- Serial monitor at 115200 baud on bridge ESP32
- Check MAC address matching between nodes and gateway
