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

## 📜 License

MIT License — Built for India Innovate 2026
