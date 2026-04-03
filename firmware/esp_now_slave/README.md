# SWACHH-AI / ESP-NOW Slave Node

## Purpose
Monitors the fill levels of connected bins using ultrasonic sensors. Transmits data wirelessly to the Gateway via ESP-NOW protocol, maximizing battery life by sleeping between measurements.

## Wiring Table
| ESP32 Pin | Component Pin | Notes                     |
|-----------|---------------|---------------------------|
| 5         | HC-SR04 Trig  | Trigger Pulse             |
| 18        | HC-SR04 Echo  | Needs voltage divider     |
| 34        | Battery/VIN   | Voltage divider to ground |
| 3V3       | VCC           | Sensor power              |
| GND       | GND           | Sensor GND                |

## Gateway MAC Binding
1. Run `WiFi.macAddress()` on your gateway ESP32.
2. Edit `gatewayMAC` in the `.ino` sketch above with your real MAC.

## Node Identification
Set `#define BIN_ID` to a unique number for every bin flashed. (0-255).

## IDE Settings
- Board: ESP32 Dev Module
- Baud Rate: 115200

## CLI Quick Deploy (PlatformIO)
`pio run -t upload --upload-port /dev/ttyUSB0`

## Troubleshooting
1. **TX FAIL**: Double check that the MAC address matches your Gateway.
2. **Always sleeping**: Device sends into sleep immediately. Wait 30s.
3. **No readings (>100.0)**: Ensure 5V vs 3.3V requirements for your specific HC-SR04.
4. **Compile fails esp_now.h**: Reinstall "esp32" by Espressif inside the Arduino Boards Manager.
5. **Always 0.0 fill**: Ensure `MAX_BIN_DEPTH` reflects actual depth of the bin (cm).
