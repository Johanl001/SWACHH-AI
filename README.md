# 🌿 SWACHH-AI — Smart Waste Ecosystem

> An end-to-end IoT + AI platform for India's Circular Economy, enabling real-time waste classification, smart bin monitoring, gamified citizen engagement, and optimized logistics.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOUD LAYER                            │
│  Firebase MQTT Broker  ←→  Admin Dashboard (Next.js)        │
│                            Citizen App (React Native)       │
└──────────────────┬──────────────────────────────────────────┘
                   │ MQTT (State-change only)
┌──────────────────┴──────────────────────────────────────────┐
│               GATEWAY LAYER (Raspberry Pi 4)                │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ Edge AI      │  │ ESP-NOW       │  │ MQTT Client      │ │
│  │ YOLOv8 TFLite│  │ Bridge        │  │ Publisher        │ │
│  │ + Pi Camera  │  │ (Serial RX)   │  │ (Paho)           │ │
│  └──────────────┘  └───────────────┘  └──────────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │ ESP-NOW (Mesh, No Router)
┌──────────────────┴──────────────────────────────────────────┐
│              EDGE NODES (ESP32 × N)                         │
│  HC-SR04 Ultrasonic  →  Fill-Level  →  ESP-NOW TX           │
│  Deep Sleep between readings for power efficiency           │
└─────────────────────────────────────────────────────────────┘
```

## 🌟 Modules: Scope and Features

### 1. Module A: Edge AI Vision (Raspberry Pi)
*   **Scope:** Local video processing to classify waste, ensuring privacy and reducing bandwidth.
*   **Object Detection:** YOLOv8 `.tflite` model classifies waste (Organic, Plastic, Paper, Metal).
*   **Ultrasonic Trigger:** HC-SR04 sensor triggers camera inference only when an object is within 20cm (saves power).
*   **Green Credits:** Dynamically assigns reward points based on the recyclability value of the waste.

### 2. Module B: Hybrid IoT Communication (ESP-NOW & MQTT)
*   **Scope:** Manages bin sensory data and handles reliable local-to-cloud networking.
*   **ESP-NOW Mesh:** ESP32 nodes communicate via a peer-to-peer network, eliminating the need for local WiFi routers.
*   **Power Efficiency:** ESP32s use Deep Sleep, waking up only to read sensors and broadcast payloads via ESP-NOW.
*   **Smart Gateway:** A Raspberry Pi acts as a bridge, converting local ESP-NOW packets to JSON and publishing to the cloud.
*   **MQTT Optimization:** Uses "state-change-only" logic to publish data only when capacity crosses specific thresholds (saving data).

### 3. Module C: Gamified Citizen App (React Native)
*   **Scope:** Cross-platform mobile app to incentivize proper waste segregation through gamification and rewards.
*   **Eco-Rank Progression:** Users earn EXP to rank up (e.g., Bronze Scavenger to Gold Guardian) with visual progress bars.
*   **Live Smart Map:** Real-time color-coded pins (Green/Yellow/Red) showing nearby bin availability to prevent walking to full bins.
*   **Impact Tracking:** Translates recycled weight into tangible metrics (e.g., water saved, trees planted) via Daily Quests.
*   **Redemption Store & i18n:** Spend Green Credits on city vouchers. Fully localized in English, Hindi, and Marathi.

### 4. Module D: Logistics & Admin Dashboard (Next.js)
*   **Scope:** Web dashboard for administrators to monitor bin metrics and optimize truck collection routes.
*   **Live City Telemetry:** WebSockets (MQTT.js) display real-time fill levels and battery health on Google Maps.
*   **A* Route Optimization:** Filters bins below 80% capacity and applies A* pathfinding for fuel-efficient collection routes.
*   **Driver Navigation:** Provides drivers with an optimized sequence of bins and turn-by-turn routing with ETAs.

### 5. YOLOv8 Training Pipeline
*   **Scope:** ML backend to train, evaluate, and compress the visual model before deployment.
*   **Features:** Multi-dataset merge utility (`data.yaml`), comprehensive data augmentation, and export optimizations (TFLite INT8 and ONNX).

## 📁 Project Structure

| Directory          | Description                                       |
|--------------------|---------------------------------------------------|
| `edge_ai/`         | Module A — YOLOv8 TFLite inference on Raspberry Pi |
| `firmware/`        | Module B — ESP32 ESP-NOW slave firmware (Arduino)  |
| `gateway/`         | Module B — Raspberry Pi serial bridge + MQTT       |
| `citizen_app/`     | Module C — React Native gamified citizen app       |
| `admin_dashboard/` | Module D — Next.js logistics & admin dashboard     |
| `mosquitto/`       | MQTT broker configuration                          |
| `models/`          | Trained YOLOv8 `.tflite` model (user-provided)    |
| `docs/`            | Architecture and API documentation                 |

## 🚀 Quick Start

### 1. Backend Services (Docker)

```bash
cd swachh-ai
docker compose up -d
```

### 2. Edge AI (Raspberry Pi)

```bash
cd edge_ai
pip install -r requirements.txt
python main.py
```

### 3. ESP32 Firmware

Flash `firmware/esp_now_slave/esp_now_slave.ino` using Arduino IDE or PlatformIO.

### 4. Citizen App

```bash
cd citizen_app
npm install
npx react-native run-android
```

### 5. Admin Dashboard

```bash
cd admin_dashboard
npm install
npm run dev
```

## 🔧 Hardware Requirements

| Component              | Specification                |
|------------------------|------------------------------|
| Master Gateway         | Raspberry Pi 4 (4GB RAM)     |
| Camera                 | Pi Camera Module 3           |
| Bin Nodes              | ESP32 DevKit v1              |
| Distance Sensor        | HC-SR04 Ultrasonic           |
| AI Model               | YOLOv8n (quantized `.tflite`)|
## Preview 
<img width="1895" height="821" alt="Screenshot 2026-04-03 194904" src="https://github.com/user-attachments/assets/7f6ff514-ff25-4a21-9897-58737a0304bd" />
<img width="1887" height="851" alt="Screenshot 2026-04-03 194921" src="https://github.com/user-attachments/assets/54b978ec-47aa-4eff-a724-bda025084f37" />
<img width="1896" height="817" alt="Screenshot 2026-04-03 194940" src="https://github.com/user-attachments/assets/817f4fbd-c91a-4fb0-8723-28f12c2400ad" />

## 📜 License

MIT License — Built for India Innovate 2026
