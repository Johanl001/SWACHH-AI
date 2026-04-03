# 📡 SWACHH-AI — API Reference

> **Team Strawhats** | Sanjivani College of Engineering, Kopargaon
> **India Innovate 2026**

---

## 1. MQTT Topics

All MQTT communication flows through the Mosquitto broker.
- **Standard MQTT port:** `1883`
- **WebSocket port:** `9001`
- **TLS (production):** `8883`
- **Topic prefix:** `swachh/`

---

### 1.1 `swachh/bin_status` — Bin Fill Level Update

**Direction:** ESP32 → Raspberry Pi Gateway → MQTT Broker → Dashboard / Firebase

**Publisher:** `gateway/mqtt_client.py`
**Subscribers:** Admin Dashboard, Firebase Cloud Functions

**Publish Conditions (State-Change Logic):**
- Fill percentage changed by ≥ 5% since last publish, **OR**
- Fill percentage crossed the 80% critical threshold

**Payload (JSON):**
```json
{
  "bin_id": 7,
  "fill_pct": 83.5,
  "distance_cm": 8.2,
  "battery_v": 3.74,
  "reading_count": 1042,
  "timestamp": 1738234800,
  "zone": "Delhi-Ward-14",
  "coordinates": {
    "lat": 28.6139,
    "lng": 77.2090
  }
}
```

**Field Reference:**

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| bin_id | integer | — | Unique bin identifier (0–255 per gateway) |
| fill_pct | float | % | Current fill level (0.0–100.0) |
| distance_cm | float | cm | Raw sensor distance |
| battery_v | float | V | ESP32 battery voltage |
| reading_count | integer | — | Total readings since last boot |
| timestamp | integer | Unix seconds | Reading time (UTC) |
| zone | string | — | Municipal zone identifier |
| coordinates | object | WGS84 | GPS location of bin |

---

### 1.2 `swachh/user_reward` — Waste Classification Reward

**Direction:** Raspberry Pi Edge AI → MQTT Broker → Firebase

**Publisher:** `edge_ai/main.py`
**Subscribers:** Firebase Cloud Functions (update user balance)

**Payload (JSON):**
```json
{
  "user_id": "usr_9f3a2b1c",
  "waste_type": "Plastic",
  "confidence": 0.91,
  "credits_awarded": 25,
  "timestamp": 1738234812,
  "bin_id": 7,
  "verification_hash": "a3f8c21d9b..."
}
```

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| user_id | string | Firebase Auth UID of citizen |
| waste_type | string | One of: `Organic`, `Paper`, `Plastic`, `Metal` |
| confidence | float | Model confidence score (0.0–1.0) |
| credits_awarded | integer | Green Credits assigned |
| timestamp | integer | Unix timestamp (UTC) |
| bin_id | integer | Bin where disposal occurred |
| verification_hash | string | SHA-256(user_id + timestamp + waste_type) |

**Credit Table:**

| Waste Type | Credits | Reason |
|-----------|---------|--------|
| Organic | 10 | Compostable value |
| Paper | 15 | Standard recyclable |
| Plastic | 25 | High environmental impact avoidance |
| Metal | 30 | Highest recyclability value |

---

### 1.3 `swachh/route_update` — Route Optimization Command

**Direction:** Admin Dashboard → MQTT Broker → Driver App / Gateway

**Publisher:** Admin Dashboard (`admin_dashboard/src/lib/mqtt.js`)
**Subscribers:** Driver mobile devices

**Payload (JSON):**
```json
{
  "route_id": "route_20260115_ward14",
  "truck_id": "DL-1G-7732",
  "driver_id": "drv_44bc21",
  "zone": "Delhi-Ward-14",
  "generated_at": 1738234900,
  "estimated_duration_min": 47,
  "total_distance_km": 12.3,
  "waypoints": [
    {
      "order": 1,
      "bin_id": 7,
      "fill_pct": 83.5,
      "lat": 28.6139,
      "lng": 77.2090,
      "eta_min": 0
    },
    {
      "order": 2,
      "bin_id": 12,
      "fill_pct": 91.2,
      "lat": 28.6201,
      "lng": 77.2145,
      "eta_min": 8
    }
  ]
}
```

---

### 1.4 `swachh/alert` — Critical Alert

**Direction:** Gateway / Cloud Function → MQTT Broker → Dashboard

**Payload (JSON):**
```json
{
  "alert_type": "BIN_OVERFLOW",
  "bin_id": 7,
  "fill_pct": 100.0,
  "zone": "Mumbai-Ward-3",
  "timestamp": 1738235000,
  "priority": "HIGH"
}
```

**Alert Types:**

| alert_type | Trigger | Priority |
|-----------|---------|----------|
| `BIN_OVERFLOW` | fill_pct ≥ 100% | HIGH |
| `BIN_CRITICAL` | fill_pct ≥ 80% | MEDIUM |
| `BATTERY_LOW` | battery_v < 3.1V | MEDIUM |
| `SENSOR_OFFLINE` | No heartbeat > 5 min | HIGH |
| `MODEL_CONFIDENCE_LOW` | confidence < 0.45 | LOW |

---

## 2. Firebase Realtime Database Schema

### 2.1 Users Collection

```
/users/{user_id}/
  ├── profile/
  │   ├── name: string
  │   ├── phone: string
  │   ├── city: string           # "Delhi" | "Mumbai" | "Pune"
  │   └── language: string       # "en" | "hi" | "mr"
  ├── gamification/
  │   ├── credits: integer        # Current Green Credits balance
  │   ├── total_exp: integer      # Lifetime EXP earned
  │   ├── rank: string            # "Bronze Scavenger" ... "Diamond Defender"
  │   ├── rank_multiplier: float  # 1.0 – 2.5
  │   └── daily_quests/
  │       ├── date: string        # "2026-01-15"
  │       ├── quest_1_done: bool
  │       ├── quest_2_done: bool
  │       └── quest_3_done: bool
  └── history/
      └── {transaction_id}/
          ├── type: string        # "earn" | "redeem"
          ├── amount: integer
          ├── waste_type: string
          └── timestamp: integer
```

### 2.2 Bins Collection

```
/bins/{bin_id}/
  ├── zone: string
  ├── coordinates/
  │   ├── lat: float
  │   └── lng: float
  ├── current/
  │   ├── fill_pct: float
  │   ├── battery_v: float
  │   ├── last_updated: integer
  │   └── status: string         # "ok" | "critical" | "offline"
  └── history/
      └── {timestamp}/
          ├── fill_pct: float
          └── battery_v: float
```

### 2.3 Routes Collection

```
/routes/{route_id}/
  ├── zone: string
  ├── truck_id: string
  ├── driver_id: string
  ├── status: string              # "pending" | "in_progress" | "completed"
  ├── generated_at: integer
  ├── completed_at: integer
  └── waypoints/
      └── {order}/
          ├── bin_id: integer
          ├── fill_pct: float
          ├── lat: float
          ├── lng: float
          └── collected: bool
```

---

## 3. ESP-NOW Binary Protocol

### Struct Definition (C — ESP32 Firmware)

```c
typedef struct {
  uint8_t  bin_id;         // 1 byte
  float    fill_pct;       // 4 bytes
  float    distance_cm;    // 4 bytes
  float    battery_v;      // 4 bytes
  uint32_t reading_count;  // 4 bytes
  uint32_t timestamp;      // 4 bytes
} BinPayload;              // Total: 21 bytes
```

### Python Unpack (Gateway)

```python
import struct

STRUCT_FORMAT = '<BfffII'  # Little-endian: uint8, float, float, float, uint32, uint32

def parse_payload(raw_bytes: bytes) -> dict:
    fields = struct.unpack(STRUCT_FORMAT, raw_bytes)
    return {
        "bin_id":        fields[0],
        "fill_pct":      round(fields[1], 2),
        "distance_cm":   round(fields[2], 2),
        "battery_v":     round(fields[3], 3),
        "reading_count": fields[4],
        "timestamp":     fields[5],
    }
```

---

## 4. REST-like Firebase Cloud Functions (Planned)

> These endpoints are triggered internally by Firebase Cloud Functions reacting to MQTT data pushed into Firestore via the gateway.

### POST `/api/reward/verify`
Verifies the SHA-256 hash before crediting a user.

**Request:**
```json
{
  "user_id": "usr_9f3a2b1c",
  "waste_type": "Plastic",
  "timestamp": 1738234812,
  "verification_hash": "a3f8c21d9b..."
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "credits_awarded": 25,
  "new_balance": 340,
  "new_rank": "Silver Sorter"
}
```

### GET `/api/bins/{zone}`
Returns current status of all bins in a zone.

**Response:**
```json
{
  "zone": "Delhi-Ward-14",
  "bins": [
    {"bin_id": 7, "fill_pct": 83.5, "status": "critical", "lat": 28.6139, "lng": 77.2090},
    {"bin_id": 8, "fill_pct": 45.0, "status": "ok", "lat": 28.6201, "lng": 77.2145}
  ],
  "critical_count": 1,
  "total_bins": 2,
  "last_updated": 1738234900
}
```

### POST `/api/route/optimize`
Triggers A\* route optimization for critical bins in a zone.

**Request:**
```json
{
  "zone": "Delhi-Ward-14",
  "truck_id": "DL-1G-7732",
  "driver_id": "drv_44bc21",
  "threshold_pct": 80
}
```

**Response:**
```json
{
  "route_id": "route_20260115_ward14",
  "waypoints": [...],
  "total_distance_km": 12.3,
  "estimated_duration_min": 47
}
```

---

## 5. WebSocket Events (Admin Dashboard)

The dashboard connects to MQTT over WebSocket (`ws://broker:9001`) and handles these events:

```javascript
// mqtt.js — subscription setup
client.subscribe('swachh/bin_status');
client.subscribe('swachh/route_update');
client.subscribe('swachh/alert');

client.on('message', (topic, payload) => {
  const data = JSON.parse(payload.toString());
  switch (topic) {
    case 'swachh/bin_status':
      updateBinMarker(data);         // BinMap.js
      break;
    case 'swachh/route_update':
      refreshRoutePanel(data);       // RoutePanel.js
      break;
    case 'swachh/alert':
      showAlertNotification(data);   // AlertBar.js
      break;
  }
});
```

---

*Team Strawhats | Sanjivani College of Engineering, Kopargaon | India Innovate 2026*
