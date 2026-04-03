# 🚀 SWACHH-AI Raspberry Pi Deployment Guide

This guide details how to securely deploy and execute the SWACHH-AI Edge module on your Raspberry Pi 4. The Edge AI component captures images of waste, runs inference using YOLOv8, and communicates securely with the cloud via MQTT.

## 1. Transfer Files to Raspberry Pi
First, you need to copy the `edge_ai` module and the generated `models/yolov8_waste.tflite` straight to your Raspberry Pi.

```bash
# Example using SCP from your dev machine to Raspberry Pi
# Assuming pi is your user and swachh-ai is your target directory
ssh pi@<your-raspberry-pi-ip> "mkdir -p /home/pi/swachh-ai"
scp -r ./edge_ai pi@<your-raspberry-pi-ip>:/home/pi/swachh-ai/
scp -r ./models pi@<your-raspberry-pi-ip>:/home/pi/swachh-ai/
```

## 2. Install Dependencies
SSH into your Raspberry Pi and trigger the automated setup script. This installs OpenCV deps, TFLite-runtime, and sets up a Python virtual environment.
```bash
cd /home/pi/swachh-ai/edge_ai
chmod +x setup_pi.sh
./setup_pi.sh
```

## 3. Test Run the Application
Verify that the `tflite` model successfully loads and no camera/GPIO errors are thrown. Also ensure it connects to your MQTT broker properly.
> Note: Check `config.py` for MQTT and GPIO settings before running. If you want to push to a cloud broker (to access via the frontend frontend apps), set the `MQTT_BROKER` environment variable to the cloud address.

```bash
source venv/bin/activate
# Example pointing to cloud broker and parent models folder
export MQTT_BROKER="your-cloud-broker-url.com"
export MODEL_PATH="../models/yolov8_waste.tflite" 
python main.py
```

## 4. Setting up Auto-Start Service (Background Duty)
To keep the AI agent running smoothly (and surviving crashes/reboots), you should install the `swachh-edge.service` as a generic `systemd` daemon.

1. **Verify User & Paths**: Edit `swachh-edge.service`. Make sure `User`, `WorkingDirectory`, and `ExecStart` match the paths on your Pi. It is currently configured for a user named `pi` and path `/home/pi/swachh-ai/edge_ai`.
2. Also change `Environment="MQTT_BROKER=localhost"` to your selected cloud broker inside the `.service` file.
3. **Move Service File**:
    ```bash
    sudo cp swachh-edge.service /etc/systemd/system/
    sudo systemctl daemon-reload
    ```
4. **Enable and Start the Service**:
    ```bash
    sudo systemctl enable swachh-edge.service
    sudo systemctl start swachh-edge.service
    ```
5. **View Real-Time Logs**:
    You can freely view real-time operations by typing:
    ```bash
    sudo journalctl -u swachh-edge.service -f
    ```

## 5. View in Frontend Dashboard
When the app triggers on the Pi and correctly identifies waste (e.g. `Plastic`), it transmits a reward score to the `swachh/user_reward` topic across the connected broker. Once setup correctly with a Cloud Broker, your Citizen App and Logistics Dashboards can be configured to point to that identical Cloud Broker IP. They will instantly pick up the detection statistics in real-time.
