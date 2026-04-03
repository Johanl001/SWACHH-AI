# 📊 SWACHH-AI — Project Pitch & Business Case

> **Team Strawhats** | Sanjivani College of Engineering, Kopargaon
> **India Innovate 2026**

---

## 1. Executive Summary

India generates over **62 million tonnes of municipal solid waste annually** — yet only 22% is processed scientifically. Cities like Delhi, Mumbai, and Pune face overflowing bins, inefficient garbage trucks burning fuel on unoptimized routes, and zero citizen engagement in waste segregation.

**SWACHH-AI** is an end-to-end smart waste management ecosystem that fixes all three problems simultaneously using Edge AI, IoT mesh networking, a gamified citizen app, and an intelligent logistics dashboard — deployable without expensive smart city infrastructure.

---

## 2. The Problem

### 2.1 Urban Waste Crisis at a Glance

| Metric | India (Current) | Global Best Practice |
|--------|----------------|----------------------|
| Waste generated/day | ~170,000 tonnes | — |
| Waste scientifically processed | 22% | 90%+ |
| Bins monitored in real time | <1% | 70%+ |
| Citizen segregation compliance | ~18% | 85%+ |
| Avg. truck fuel waste (unoptimized routes) | 35–40% | <10% |

### 2.2 Root Causes

**No real-time visibility.** Municipal workers follow fixed schedules regardless of bin fill levels — trucks collect from half-empty bins while others overflow onto streets.

**Zero citizen incentive.** Citizens have no reason to segregate waste. Mixed waste destroys recyclability and increases processing cost by 3–5×.

**Manual, inefficient logistics.** Route planning is done manually or not at all. Trucks criss-cross the city burning diesel on non-optimal paths.

**Expensive infrastructure dependency.** Existing smart bin solutions require city-wide WiFi or 4G SIM cards per bin — costing ₹8,000–₹15,000 per node, making scale-up impossible for small municipalities.

---

## 3. Our Solution — SWACHH-AI

A four-module platform that works together as one ecosystem:

```
┌──────────────────────────────────────────────────────────────┐
│              SWACHH-AI PLATFORM OVERVIEW                     │
│                                                              │
│  📷 Edge AI Vision     📡 IoT Bin Mesh                       │
│  YOLOv8 on Pi 4        ESP32 + ESP-NOW                       │
│  Classifies waste       Monitors fill levels                 │
│  Assigns green credits  No WiFi router needed                │
│         │                      │                             │
│         └──────────┬───────────┘                             │
│                    ▼                                         │
│         ☁️  Firebase + MQTT Broker                           │
│         Real-time cloud backbone                             │
│                    │                                         │
│         ┌──────────┴───────────┐                             │
│         ▼                      ▼                             │
│  📱 Citizen App         🖥️ Admin Dashboard                   │
│  Gamified rewards        A* route optimization               │
│  Live bin map            Live city telemetry                 │
│  Redemption store        Driver navigation                   │
└──────────────────────────────────────────────────────────────┘
```

### Module A — Edge AI Vision (Raspberry Pi 4 + Camera)
A Pi Camera Module 3 captures waste images when an ultrasonic sensor detects an object within 20 cm. A YOLOv8n model (quantized to TFLite INT8, ~3 MB) runs entirely on-device — no cloud API call needed — and classifies waste into **Organic, Plastic, Paper, or Metal**. Green Credits are assigned based on recyclability and published to the cloud.

### Module B — IoT Bin Mesh (ESP32 + ESP-NOW)
ESP32 microcontrollers inside each bin measure fill level via HC-SR04 ultrasonic sensors. They communicate via **ESP-NOW** — a peer-to-peer WiFi protocol that needs no router. A Raspberry Pi gateway receives these readings via serial and forwards them to the MQTT broker. ESP32s use **deep sleep** between readings, extending battery life to months.

### Module C — Citizen App (React Native)
A cross-platform mobile app that gamifies waste disposal. Citizens earn **Green Credits** for correct segregation, level up through ranks (Bronze Scavenger → Diamond Guardian), complete Daily Quests, and redeem credits for city vouchers. A live map shows nearby bin availability. Available in English, Hindi, and Marathi.

### Module D — Admin Dashboard (Next.js)
A web dashboard for municipal administrators. Displays real-time bin fill levels and battery health on Google Maps. When bins cross 80% capacity, the **A\* pathfinding algorithm** computes the optimal truck collection route — minimizing fuel consumption and time. Drivers receive a turn-by-turn sequence with ETAs.

---

## 4. Key Differentiators

| Feature | SWACHH-AI | Typical Smart Bin Solutions |
|---------|-----------|----------------------------|
| Per-node cost | ~₹1,200 (ESP32 + HC-SR04) | ₹8,000–₹15,000 (4G SIM) |
| WiFi router required | ❌ No (ESP-NOW mesh) | ✅ Yes |
| On-device AI inference | ✅ Yes (Pi + TFLite) | ❌ No (cloud API) |
| Citizen gamification | ✅ Full rank + quest system | ❌ None |
| Route optimization | ✅ A* algorithm | ❌ Fixed schedules |
| Multilingual | ✅ EN / HI / MR | ❌ English only |
| Offline capability | ✅ Edge AI + ESP-NOW | ❌ Cloud-dependent |

---

## 5. Impact Metrics (Projected — Pilot: Delhi, Mumbai, Pune)

### Environmental Impact (per 1,000 bins deployed)
- **35% reduction** in unnecessary truck trips
- **22% reduction** in fuel consumption and CO₂ emissions
- **3× increase** in correctly segregated waste
- **₹18–22 lakh/year** saved in logistics costs per city zone

### Social Impact
- Citizens directly see the environmental impact of their actions (water saved, trees equivalent)
- Inclusion of Hindi and Marathi breaks language barriers for adoption
- Waste collection workers get optimized routes — less overwork, safer conditions

### Economic Impact
- Node cost of ~₹1,200 vs. ₹8,000+ incumbent solutions = **85% cost reduction**
- Credits redeemable at local businesses = circular local economy stimulus
- Scalable to any municipality without smart city infrastructure investment

---

## 6. Technology Readiness

| Component | Status |
|-----------|--------|
| YOLOv8 model training pipeline | ✅ Complete |
| TFLite INT8 export (~3MB, 320×320) | ✅ Complete |
| ESP32 ESP-NOW firmware | ✅ Complete |
| Raspberry Pi MQTT gateway | ✅ Complete |
| React Native citizen app | ✅ Complete |
| Next.js admin dashboard | ✅ Complete |
| Docker compose deployment | ✅ Complete |
| Multilingual (EN/HI/MR) | ✅ Complete |

**Target Model Performance:** mAP@0.5 > 92%, Precision > 93%, Inference < 120ms on Pi 4

---

## 7. Go-To-Market & Scalability

### Phase 1 — Pilot (Months 1–6)
Deploy 50 smart bins across one municipal ward each in Pune, Mumbai, and Delhi. Onboard 500 citizen beta users. Measure route optimization savings vs. baseline.

### Phase 2 — City Rollout (Months 7–18)
Expand to 500 bins per city. Partner with Swachh Bharat Mission digital infrastructure. Integrate with existing municipal ERP systems via REST API.

### Phase 3 — National Scale (Year 2+)
License the platform to municipalities as **SaaS + Hardware Kit**. White-label the citizen app under city branding. Target 100 cities via Smart Cities Mission partnerships.

### Revenue Model
- **Hardware Kit:** One-time cost per bin node (ESP32 kit + Pi Gateway)
- **SaaS License:** Monthly per-city dashboard + cloud fee
- **Data Insights:** Anonymized waste analytics sold to urban planners and FMCG companies
- **Credit Ecosystem:** Transaction fee on voucher redemptions via the app

---

## 8. Team Strawhats

| Role | Responsibility |
|------|---------------|
| ML Engineer | YOLOv8 training, TFLite optimization, green credit engine |
| IoT Engineer | ESP32 firmware, ESP-NOW mesh, gateway bridge |
| Mobile Developer | React Native citizen app, gamification, i18n |
| Full-Stack Developer | Next.js dashboard, A* routing, MQTT integration |
| DevOps | Docker, Firebase, MQTT broker, CI/CD |

**Institution:** Sanjivani College of Engineering, Kopargaon, Maharashtra
**Competition:** India Innovate 2026

---

## 9. Vision

> *"What if every Indian citizen was rewarded for doing the right thing — and every garbage truck knew exactly where to go?"*

SWACHH-AI makes smart waste management accessible to every Indian municipality — not just cities with ₹100 crore smart city budgets. By combining affordable IoT hardware, on-device AI, and genuine citizen engagement, we make **Swachh Bharat** not just a slogan, but a measurable, data-driven reality.

---

*Team Strawhats | Sanjivani College of Engineering, Kopargaon | India Innovate 2026*
