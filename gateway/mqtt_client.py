# SWACHH-AI — Gateway
# Team Strawhats | Sanjivani College of Engineering, Kopargaon
# India Innovate 2026

import os
import json
import logging
import time
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_USER = os.getenv("MQTT_USER", "gateway_user")
MQTT_PASS = os.getenv("MQTT_PASS", "PLACEHOLDER_MQTT_PASS")

class MQTTPublisher:
    """MQTT Client for publishing bin status and alerts."""

    def __init__(self):
        self.last_published = {}
        self.client = mqtt.Client()
        if MQTT_USER and MQTT_PASS:
            self.client.username_pw_set(MQTT_USER, MQTT_PASS)
            
        self.client.on_connect = self.on_connect
        try:
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            logging.info(f"Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        except Exception as e:
            logging.error(f"Failed to connect to MQTT: {e}")

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logging.info("MQTT connection established successfully!")
        else:
            logging.error(f"MQTT connection failed with code {rc}")

    def loop_start(self):
        self.client.loop_start()

    def publish_bin_status(self, payload: dict):
        """Serialize payload to JSON and publish."""
        bin_id = payload.get("bin_id")
        new_fill = payload.get("fill_pct", 0)
        battery_v = payload.get("battery_v", 0)
        
        should_publish = False
        if bin_id not in self.last_published:
            should_publish = True
        else:
            prev_fill = self.last_published[bin_id]
            if abs(new_fill - prev_fill) >= 5.0:
                should_publish = True
            elif prev_fill < 80.0 <= new_fill:
                should_publish = True

        if should_publish:
            try:
                self.client.publish("swachh/bin_status", json.dumps(payload), qos=1, retain=True)
                logging.info(f"Published status for bin {bin_id}: {new_fill}%")
                self.last_published[bin_id] = new_fill
            except Exception as e:
                logging.error(f"Publish failed: {e}")

        # Alerts
        if new_fill >= 100.0:
            self._publish_alert(bin_id, "OVERFLOW")
        if battery_v < 3.1:
            self._publish_alert(bin_id, "BATTERY_LOW")

    def _publish_alert(self, bin_id: int, alert_type: str):
        alert_payload = {
            "bin_id": bin_id,
            "alert": alert_type,
            "timestamp": time.time()
        }
        try:
            self.client.publish("swachh/alert", json.dumps(alert_payload), qos=1)
            logging.warning(f"Sent {alert_type} alert for bin {bin_id}")
        except Exception as e:
            logging.error(f"Alert publish failed: {e}")
