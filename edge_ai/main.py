# SWACHH-AI — Edge AI
# Team Strawhats | Sanjivani College of Engineering, Kopargaon
# India Innovate 2026

import time
import logging
import json
import paho.mqtt.client as mqtt
import cv2

try:
    from picamera2 import Picamera2
    PICAMERA_AVAILABLE = True
except ImportError:
    PICAMERA_AVAILABLE = False
try:
    import RPi.GPIO as GPIO
except ImportError:
    pass

import config
from inference import WasteClassifier
from sensor_trigger import UltrasonicSensor
from green_credit import build_reward_payload
import os

os.makedirs(os.path.dirname(config.LOG_FILE), exist_ok=True)
logging.basicConfig(filename=config.LOG_FILE, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logging.info("Connected to MQTT Broker!")
    else:
        logging.error(f"Failed to connect to MQTT broker, return code {rc}")

def main():
    logging.info("Starting Edge AI Service")
    
    sensor = UltrasonicSensor(config.TRIGGER_PIN, config.ECHO_PIN)
    classifier = WasteClassifier(config.MODEL_PATH, config.CONFIDENCE_THRESHOLD)
    
    client = mqtt.Client()
    client.username_pw_set(config.MQTT_USER, config.MQTT_PASS)
    client.will_set("swachh/alert", json.dumps({"bin_id": "edge_ai", "alert": "offline"}), qos=1, retain=True)
    client.on_connect = on_connect
    
    try:
        client.connect(config.MQTT_BROKER, config.MQTT_PORT, 60)
        client.loop_start()
    except Exception as e:
        logging.error(f"MQTT connection failed: {e}")

    if PICAMERA_AVAILABLE:
        try:
            picam = Picamera2()
            picam.start_and_record()
        except Exception as e:
            logging.error(f"Picamera2 init failed: {e}")
            PICAMERA_AVAILABLE = False
            
    cap = None
    if not PICAMERA_AVAILABLE:
        cap = cv2.VideoCapture(0)

    try:
        while True:
            if sensor.is_triggered(config.TRIGGER_DISTANCE_CM):
                logging.info("Motion detected!")
                frame = None
                try:
                    if PICAMERA_AVAILABLE:
                        frame = picam.capture_array()
                    elif cap:
                        ret, frame = cap.read()
                        if not ret:
                            frame = None
                except Exception as e:
                    logging.error(f"Camera capture failed: {e}")

                if frame is not None:
                    result = classifier.predict(frame)
                    if result:
                        logging.info(f"Waste detected: {result}")
                        payload = build_reward_payload(
                            user_id="demo_user_001",
                            waste_type=result["class_name"],
                            confidence=result["confidence"],
                            bin_id="BIN_001"
                        )
                        try:
                            client.publish("swachh/user_reward", json.dumps(payload), qos=1)
                            logging.info("Reward payload published")
                        except Exception as e:
                            logging.error(f"MQTT publish failed: {e}")
                time.sleep(2) # delay to avoid rapid retriggers
            time.sleep(0.5)
    except KeyboardInterrupt:
        logging.info("Edge AI Service stopping via KeyboardInterrupt")
    finally:
        if 'GPIO' in globals():
            GPIO.cleanup()
        client.loop_stop()
        client.disconnect()
        if cap:
            cap.release()

if __name__ == "__main__":
    main()
