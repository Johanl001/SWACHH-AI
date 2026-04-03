# 📡 SWACHH-AI — IoT Firmware & ESP-NOW Communication

> **Team Strawhats** | Sanjivani College of Engineering, Kopargaon
> **India Innovate 2026**

---

## 1. Overview

The IoT layer consists of two components:

1. **ESP32 Bin Nodes** — Ultra-low-power sensors inside each bin, communicating via ESP-NOW (no WiFi router needed)
2. **Raspberry Pi Gateway** — Receives ESP-NOW packets via a bridge ESP32, converts them to JSON, and publishes to the MQTT broker

---

## 2. ESP32 Bin Node Firmware (`firmware/esp_now_slave/esp_now_slave.ino`)

### 2.1 Hardware Connections

| ESP32 Pin | Component | Note |
|-----------|-----------|------|
| GPIO 5 | HC-SR04 TRIG | Trigger pulse |
| GPIO 18 | HC-SR04 ECHO | Echo response |
| 3.3V | HC-SR04 VCC | Power |
| GND | HC-SR04 GND | Ground |
| EN pin | Deep sleep wake | Tied to reset via 10kΩ |

### 2.2 Firmware Logic

```
BOOT
 │
 ├── Initialize ESP-NOW
 ├── Add Gateway MAC as peer
 │
 ├── Read HC-SR04 (average of 5 readings)
 ├── Compute fill_pct
 ├── Read battery voltage (ADC pin 34)
 │
 ├── Pack BinPayload struct (21 bytes)
 ├── esp_now_send() to Gateway MAC
 │
 └── esp_deep_sleep(30 * 1000000)  // 30 seconds
```

### 2.3 Full Firmware Code

```cpp
#include <esp_now.h>
#include <WiFi.h>

// ─── Configuration ───────────────────────────────────────────
#define BIN_ID          7             // Unique ID for this bin node
#define TRIG_PIN        5
#define ECHO_PIN        18
#define BATTERY_PIN     34            // ADC for battery voltage divider
#define SLEEP_US        30000000ULL   // 30 seconds deep sleep
#define MAX_BIN_DEPTH   100.0f        // cm — empty bin depth
#define READINGS_AVG    5             // Average N distance readings

// Gateway bridge ESP32 MAC address (replace with actual MAC)
uint8_t gatewayMAC[] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF};

// ─── Payload Struct ──────────────────────────────────────────
typedef struct __attribute__((packed)) {
  uint8_t  bin_id;
  float    fill_pct;
  float    distance_cm;
  float    battery_v;
  uint32_t reading_count;
  uint32_t timestamp;
} BinPayload;

// Persistent across deep sleep (stored in RTC memory)
RTC_DATA_ATTR uint32_t reading_count = 0;

// ─── HC-SR04 Distance Reading ────────────────────────────────
float readDistance() {
  float total = 0;
  for (int i = 0; i < READINGS_AVG; i++) {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 30ms timeout
    total += (duration * 0.034f / 2.0f);
    delay(50);
  }
  return total / READINGS_AVG;
}

// ─── Battery Voltage ─────────────────────────────────────────
float readBattery() {
  int raw = analogRead(BATTERY_PIN);
  // Voltage divider: 100kΩ + 100kΩ → max 4.2V reads as ~2.1V → ADC 3.3V ref
  return (raw / 4095.0f) * 3.3f * 2.0f;
}

// ─── ESP-NOW Send Callback ───────────────────────────────────
void onDataSent(const uint8_t *mac, esp_now_send_status_t status) {
  // Optional: log delivery status via Serial
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "TX OK" : "TX FAIL");
}

// ─── Setup ───────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init failed");
    esp_deep_sleep(SLEEP_US);
    return;
  }

  esp_now_register_send_cb(onDataSent);

  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, gatewayMAC, 6);
  peer.channel = 0;
  peer.encrypt = false;
  esp_now_add_peer(&peer);

  // Read sensors
  float dist = readDistance();
  float fill = max(0.0f, min(100.0f, ((MAX_BIN_DEPTH - dist) / MAX_BIN_DEPTH) * 100.0f));
  float batt = readBattery();
  reading_count++;

  // Build payload
  BinPayload payload = {
    .bin_id        = BIN_ID,
    .fill_pct      = fill,
    .distance_cm   = dist,
    .battery_v     = batt,
    .reading_count = reading_count,
    .timestamp     = (uint32_t)(millis() / 1000),  // use NTP in production
  };

  esp_now_send(gatewayMAC, (uint8_t *)&payload, sizeof(payload));
  delay(100);  // Allow TX to complete before sleep

  esp_deep_sleep(SLEEP_US);
}

void loop() {
  // Never reached — device always sleeps after setup()
}
```

---

## 3. Raspberry Pi Gateway

### 3.1 ESP-NOW Bridge (`gateway/esp_now_bridge.py`)

A second ESP32 (USB-connected to the Pi) acts as an ESP-NOW receiver and forwards raw bytes over Serial.

```python
import serial
import struct
import json
import logging
from datetime import datetime

STRUCT_FORMAT = '<BfffII'   # 21 bytes
STRUCT_SIZE   = struct.calcsize(STRUCT_FORMAT)
SERIAL_PORT   = '/dev/ttyUSB0'
BAUD_RATE     = 115200

logger = logging.getLogger(__name__)

def parse_payload(raw: bytes) -> dict:
    if len(raw) != STRUCT_SIZE:
        raise ValueError(f"Expected {STRUCT_SIZE} bytes, got {len(raw)}")
    fields = struct.unpack(STRUCT_FORMAT, raw)
    return {
        "bin_id":        fields[0],
        "fill_pct":      round(fields[1], 2),
        "distance_cm":   round(fields[2], 2),
        "battery_v":     round(fields[3], 3),
        "reading_count": fields[4],
        "timestamp":     fields[5],
        "received_at":   int(datetime.utcnow().timestamp()),
    }

def run_bridge(on_packet_callback):
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    logger.info(f"ESP-NOW bridge listening on {SERIAL_PORT}")
    buffer = b''
    while True:
        data = ser.read(64)
        if data:
            buffer += data
            while len(buffer) >= STRUCT_SIZE:
                try:
                    payload = parse_payload(buffer[:STRUCT_SIZE])
                    on_packet_callback(payload)
                    buffer = buffer[STRUCT_SIZE:]
                except ValueError as e:
                    logger.warning(f"Parse error: {e}")
                    buffer = buffer[1:]  # Skip one byte and retry
```

### 3.2 MQTT Publisher with State-Change Logic (`gateway/mqtt_client.py`)

```python
import paho.mqtt.client as mqtt
import json
import logging

MQTT_BROKER    = "localhost"
MQTT_PORT      = 1883
MQTT_TOPIC_BIN = "swachh/bin_status"
CHANGE_THRESHOLD = 5.0   # Only publish if fill_pct changes by ≥ 5%
CRITICAL_LEVEL   = 80.0  # Always publish when crossing this threshold

last_published = {}  # {bin_id: fill_pct}

logger = logging.getLogger(__name__)

def should_publish(bin_id: int, new_fill: float) -> bool:
    if bin_id not in last_published:
        return True
    prev = last_published[bin_id]
    # Publish on threshold crossing
    if prev < CRITICAL_LEVEL <= new_fill:
        return True
    # Publish on significant change
    if abs(new_fill - prev) >= CHANGE_THRESHOLD:
        return True
    return False

class MQTTPublisher:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
        self.client.loop_start()

    def publish_bin_status(self, payload: dict):
        bin_id   = payload["bin_id"]
        fill_pct = payload["fill_pct"]
        if should_publish(bin_id, fill_pct):
            msg = json.dumps(payload)
            self.client.publish(MQTT_TOPIC_BIN, msg, qos=1, retain=True)
            last_published[bin_id] = fill_pct
            logger.info(f"Published bin {bin_id}: {fill_pct}%")
        else:
            logger.debug(f"Skipped bin {bin_id}: no significant change")
```

---

## 4. ESP-NOW Network Setup

### 4.1 Finding Gateway ESP32 MAC Address

Flash this sketch to your bridge ESP32 to print its MAC:

```cpp
#include <WiFi.h>
void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  Serial.println(WiFi.macAddress());
}
void loop() {}
```

Update `gatewayMAC[]` in `esp_now_slave.ino` with the printed address.

### 4.2 Multi-Node Deployment

Each bin node needs:
1. A unique `BIN_ID` value (0–255)
2. The same `gatewayMAC[]` (all nodes point to the same bridge)
3. Flashed via Arduino IDE or PlatformIO

The gateway bridge ESP32 uses `esp_now_register_recv_cb()` — it accepts packets from **any** registered or unregistered peer. For production, enable MAC whitelisting.

### 4.3 ESP-NOW Range

| Environment | Typical Range |
|------------|--------------|
| Open area (outdoor) | ~200–480m |
| Urban street (bins 10–20m apart) | ~80–150m |
| With obstacles (walls, vehicles) | ~30–60m |

For dense bin deployments, use **ESP-NOW mesh relay** — intermediate nodes forward packets from distant nodes to the gateway.

---

## 5. Power Budget Analysis

| Mode | Current | Duration | Energy |
|------|---------|----------|--------|
| Boot + WiFi init | ~240mA | ~300ms | 20mAh |
| Sensor read | ~80mA | ~200ms | 4.4mAh |
| ESP-NOW TX | ~160mA | ~5ms | 0.22mAh |
| Deep sleep | ~0.01mA | ~29.5s | 0.08mAh |
| **Per cycle (30s)** | — | 30s | **~24.7mAh** |
| **Per hour** | — | — | **~2.96mAh** |
| **2000mAh battery** | — | — | **~28 days** |

> **Tip:** Use a 4000mAh Li-ion pack for ~56-day field life without charging.

---

## 6. Troubleshooting ESP-NOW

| Symptom | Possible Cause | Fix |
|---------|---------------|-----|
| Gateway receives no packets | Wrong MAC address | Re-flash with correct `gatewayMAC[]` |
| Occasional lost packets | RF interference | Add retry logic in firmware |
| fill_pct always 0 or 100 | HC-SR04 wiring issue | Check TRIG/ECHO pin connections |
| `Parse error: Expected 21 bytes` | Partial packet in serial | Check baud rate (must be 115200) |
| Battery drains in <3 days | Deep sleep not working | Check EN/RST wiring for deep sleep wake |

---

*Team Strawhats | Sanjivani College of Engineering, Kopargaon | India Innovate 2026*
