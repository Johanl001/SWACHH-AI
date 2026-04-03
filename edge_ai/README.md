# SWACHH-AI Edge AI

## Purpose
This module uses a Raspberry Pi 4 and a Pi Camera to detect and classify waste items entering a smart bin using a YOLOv8 TFLite model. It awards Green Credits to citizens and communicates with the backend via MQTT.

## Prerequisites
- Raspberry Pi 4 Model B
- Pi Camera Module
- HC-SR04 Ultrasonic Sensor

## Setup Steps
1. Connect HC-SR04 sensor to the Pi (Trig to pin 23, Echo to pin 24).
2. Install dependencies: `pip install -r requirements.txt`.
3. Set up the `yolov8_waste.tflite` model in the `models/` directory next to this project root.

## Run Command
`python main.py`
Or setup systemd service: `sudo cp edge_ai.service /etc/systemd/system/ && sudo systemctl enable --now edge_ai.service`

## Troubleshooting
1. **Camera not detected**: Ensure camera is enabled in `raspi-config`.
2. **RPi.GPIO import fails**: Only works on physical Pi; mock mode runs locally.
3. **No detections**: Ensure `yolov8_waste.tflite` exists in `../models/`.
4. **MQTT fails**: Verify broker address in `config.py` and ensure the Mosquitto container is running.
5. **Sensor always triggers**: Check wiring. Echo pin requires a 1k/2k voltage divider.
