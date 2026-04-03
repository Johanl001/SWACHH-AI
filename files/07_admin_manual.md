# 🖥️ SWACHH-AI — Admin Dashboard User Manual

**For: Government Officials, Municipal Administrators, Zone Supervisors**
> **Team Strawhats** | Sanjivani College of Engineering, Kopargaon | India Innovate 2026

---

## Welcome

The SWACHH-AI Admin Dashboard is your command centre for managing urban waste collection across Delhi, Mumbai, and Pune. This manual walks you through every feature — from logging in to dispatching optimized truck routes.

**Dashboard URL:** `http://your-deployment-url:3000` (or hosted Vercel URL)

---

## 1. Logging In

1. Open the dashboard URL in your browser (Chrome or Edge recommended)
2. Enter your **official email** and **password** provided by the system administrator
3. Click **Sign In**
4. On first login, you will be prompted to change your password

> **Note:** Your account is tied to your city zone (e.g., Delhi-Ward-14). You will only see bins and routes for your assigned zone.

**Forgot Password?** Click "Forgot Password" on the login screen — a reset link will be sent to your official email within 2 minutes.

---

## 2. Dashboard Overview

After login, you land on the **Main Dashboard** with four sections:

```
┌─────────────────────────────────────────────────────────────────┐
│  SWACHH-AI Admin Dashboard          [Zone: Delhi-Ward-14] [🔔]  │
├───────────────┬─────────────────────────────────────────────────┤
│               │                                                 │
│  LEFT PANEL   │              MAP VIEW                           │
│               │                                                 │
│  📊 Summary   │   [Google Maps — Live Bin Locations]            │
│  Bins: 24     │   🟢 = OK  🟡 = Moderate  🔴 = Critical         │
│  Critical: 3  │                                                 │
│  Trucks: 2    │                                                 │
│               │                                                 │
│  🗺️ Route     │                                                 │
│  Panel        │                                                 │
│               │                                                 │
│  ⚠️ Alerts    │                                                 │
│  3 active     │                                                 │
│               │                                                 │
│  📈 Analytics │                                                 │
│               │                                                 │
└───────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Live Bin Map

The map shows all bins in your zone as colour-coded pins, updating in real time:

| Pin Colour | Fill Level | Action Required |
|-----------|-----------|----------------|
| 🟢 Green | < 60% | None — bin is fine |
| 🟡 Yellow | 60%–80% | Monitor closely |
| 🔴 Red | > 80% | Schedule collection immediately |
| ⚫ Grey | Offline | Check sensor / battery |

### Clicking a Bin Pin

Click any bin pin on the map to see:
- **Bin ID and address**
- **Current fill percentage** (live)
- **Last updated** timestamp
- **Battery level** (🔋 percentage)
- **Fill history graph** (last 24 hours)
- Button: **Mark for Collection** (adds to route manually)

### Map Controls

| Control | Description |
|---------|-------------|
| 🔍 Zoom | Scroll wheel or +/− buttons |
| 🗺️ Layer toggle | Switch between Map / Satellite view |
| 🔄 Refresh | Force-refresh all bin data |
| 🏷️ Labels | Toggle bin ID labels on/off |
| 📍 My Zone | Zoom to fit all bins in your zone |

---

## 4. Route Optimization

This is the most powerful feature of the dashboard. When critical bins (>80% full) need to be emptied, the system calculates the most fuel-efficient truck route automatically.

### 4.1 Generating a Route

1. Click **"Optimize Route"** in the left Route Panel
2. The system fetches all bins above 80% fill in your zone
3. The **A\* algorithm** calculates the shortest efficient path
4. The route appears as a **blue polyline** on the map
5. Waypoints are listed in order in the Route Panel with ETAs

### 4.2 Route Panel Details

```
OPTIMIZED ROUTE — Delhi-Ward-14
Generated: 15 Jan 2026, 09:42 AM
──────────────────────────────
Total distance:   12.3 km
Estimated time:   47 minutes
Bins to collect:  8 bins
Fuel saving:      ~35% vs manual

WAYPOINTS:
  1. Bin #7  — Chandni Chowk Market    83.5%  → 0 min
  2. Bin #12 — Red Fort Road           91.2%  → 8 min
  3. Bin #3  — Darya Ganj              88.0%  → 14 min
  ...
──────────────────────────────
[📤 Dispatch to Driver]  [🖨️ Print Route]
```

### 4.3 Dispatching to Driver

1. Select a **Truck ID** and **Driver** from the dropdown
2. Click **"Dispatch to Driver"**
3. The driver receives the route on their mobile app (Worker App)
4. Route status changes to **"In Progress"** on your dashboard
5. As the driver collects each bin, their location updates live on the map

### 4.4 Manual Route Adjustments

- **Add a bin:** Click any bin pin → **"Mark for Collection"**
- **Remove a bin:** In the Route Panel, click ✕ next to a waypoint
- **Re-optimize:** Click **"Re-optimize"** after manual changes

---

## 5. Alerts Panel

The Alerts Panel (bell icon 🔔) shows active issues requiring attention:

| Alert | Meaning | Recommended Action |
|-------|---------|-------------------|
| 🔴 BIN OVERFLOW | Bin is 100% full | Dispatch truck immediately |
| 🟠 BIN CRITICAL | Bin crossed 80% | Include in next route |
| 🔋 BATTERY LOW | ESP32 battery < 3.1V | Schedule battery replacement |
| 📡 SENSOR OFFLINE | No data for 5+ min | Check hardware |

Click any alert to see the exact bin location on the map.

**Acknowledging Alerts:** Click **"Acknowledge"** once you have taken action. Acknowledged alerts move to the history log.

---

## 6. Analytics

Click **📈 Analytics** in the left panel for zone-level statistics:

### Available Reports

| Report | Description |
|--------|-------------|
| Fill Level Heatmap | Colour overlay showing historically fullest bins — helps with permanent bin placement decisions |
| Collection Efficiency | Avg. fill % at time of collection — higher means you're collecting at the right time |
| Route Savings | Monthly km and fuel saved vs. pre-optimization baseline |
| Waste Type Breakdown | Plastic / Organic / Paper / Metal ratios from AI classification |
| Citizen Engagement | App users, daily active citizens, top contributors |

### Exporting Reports

1. Go to Analytics → select report type and date range
2. Click **Export** → choose CSV or PDF
3. File downloads to your browser

---

## 7. User Management (Super Admin Only)

Zone supervisors with **Super Admin** role can manage accounts:

1. Go to **Settings → User Management**
2. Click **Add User** — enter name, email, role, and assigned zone
3. Roles available:
   - **Zone Admin** — view and manage one zone
   - **City Admin** — view all zones in a city
   - **Super Admin** — full access including user management

---

## 8. Settings

| Setting | Description |
|---------|-------------|
| Notification Email | Email for critical alerts when dashboard is closed |
| Critical Threshold | Default 80% — change the fill level that triggers alerts |
| Auto-Route Interval | Set a time for automatic route generation (e.g., 6 AM daily) |
| Truck Fleet | Add/remove truck IDs and assign drivers |
| Language | English (default) |

---

## 9. Quick Reference — Common Tasks

| Task | Steps |
|------|-------|
| See all full bins | Map → filter by 🔴 Red pins |
| Get today's route | Route Panel → Optimize Route → Dispatch |
| Check battery health | Click any grey bin pin → see battery_v |
| Download monthly report | Analytics → Collection Efficiency → Export → PDF |
| Add a new driver | Settings → Truck Fleet → Add Driver |
| Acknowledge an overflow alert | Alerts 🔔 → Acknowledge |

---

## 10. Support

For technical issues, contact your system administrator or email:
**support@swachh-ai.in**

For hardware issues (bins not reporting), contact the IoT maintenance team.

---

*Team Strawhats | Sanjivani College of Engineering, Kopargaon | India Innovate 2026*
