# SWACHH-AI Gateway

## Purpose
Bridges the ESP-NOW local mesh network to the cloud MQTT broker. Runs on a master ESP32 connected via Serial to the Raspberry Pi.

## Prerequisites
- A separate ESP32 running receiver sketch plugged into `/dev/ttyUSB0`
- Python 3.11

## Setup Steps
1. Create `.env` from `.env.example`
2. Install dependencies: `pip install -r requirements.txt`

## Run Command
`python main.py`

## Troubleshooting
1. **Requires sudo for Serial**: Check your permissions `sudo usermod -a -G dialout $USER`.
2. **Device not found**: Check if it's `/dev/ttyUSB1` or `/dev/ttyACM0` instead.
3. **MQTT connection failed**: Make sure docker compose is running for mosquitto.
4. **Invalid byte parse**: Ensure baudrate in code and on the device are both exactly `115200`.
5. **No payloads appearing**: Ensure slave nodes have the exact MAC address of the gateway receiver!
