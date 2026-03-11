# SWACHH-AI System Architecture

## Communication Flow

```mermaid
graph TD
    A[ESP32 Bin Node] -->|ESP-NOW| B[Raspberry Pi Gateway]
    B -->|Serial Parse| C[ESP-NOW Bridge]
    C -->|JSON| D[MQTT Client]
    D -->|MQTT Publish| E[Mosquitto Broker]
    
    F[Pi Camera] -->|Frame| G[YOLOv8 TFLite]
    G -->|Classification| H[Green Credit Engine]
    H -->|Reward Signal| D

    E -->|Subscribe| I[Next.js Admin Dashboard]
    E -->|Subscribe| J[React Native Citizen App]
    
    I -->|A* Route| K[Google Maps]
    J -->|Display| L[Live Bin Map]
```

## MQTT Topics

| Topic                    | Publisher   | Subscriber       | Payload                                    |
|--------------------------|-------------|------------------|--------------------------------------------|
| `swachh/bin_status`      | Gateway     | Admin Dashboard  | `{bin_id, fill_pct, lat, lng, timestamp}`  |
| `swachh/user_reward`     | Edge AI     | Citizen App      | `{user_id, credits, waste_type, timestamp}`|
| `swachh/route_update`    | Admin       | Driver App       | `{route_id, waypoints[], eta}`             |

## Data Flow: Waste Disposal Event

1. User approaches bin → HC-SR04 detects object < 20 cm
2. Pi Camera captures frame → YOLOv8 classifies waste
3. Green Credit engine computes reward
4. MQTT publishes `user_reward` to broker
5. Citizen app receives notification, updates Eco-Rank
6. Bin fill level updated via ESP-NOW → MQTT → Dashboard

## Power Management (ESP32 Nodes)

- **Active**: Read sensor → Transmit ESP-NOW → 50ms
- **Deep Sleep**: 30-second intervals between readings
- **Battery Life**: ~6 months on 3× AA batteries (estimated)
