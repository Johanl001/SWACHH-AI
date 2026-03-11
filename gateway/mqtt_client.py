"""
SWACHH-AI — MQTT Gateway Client
================================
Publishes bin_status and user_reward data to the MQTT broker.
Implements state-change-only publishing to conserve bandwidth.

Topics:
  swachh/bin_status   → Bin fill levels, battery, location
  swachh/user_reward  → Green Credit rewards from Edge AI

Works with both local Mosquitto and Firebase MQTT broker.
"""

import os
import json
import time
import signal
import sys
import logging

import paho.mqtt.client as mqtt

from esp_now_bridge import ESPNowBridge

# ── Configuration ──────────────────────────────────────────────
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "swachh_gateway")
SERIAL_PORT = os.getenv("SERIAL_PORT", "/dev/ttyUSB0")
SERIAL_BAUD = int(os.getenv("SERIAL_BAUD", "115200"))

TOPIC_BIN_STATUS = "swachh/bin_status"
TOPIC_USER_REWARD = "swachh/user_reward"

# ── Bin Location Registry (static config per deployment) ───────
# In production, this would be loaded from a database or config file
BIN_LOCATIONS = {
    1: {"lat": 22.7196, "lng": 75.8577, "zone": "Zone-A", "address": "MG Road, Indore"},
    2: {"lat": 22.7235, "lng": 75.8625, "zone": "Zone-A", "address": "Rajwada, Indore"},
    3: {"lat": 22.7150, "lng": 75.8500, "zone": "Zone-B", "address": "Sapna Sangeeta Rd, Indore"},
    4: {"lat": 22.7300, "lng": 75.8700, "zone": "Zone-B", "address": "Vijay Nagar, Indore"},
    5: {"lat": 22.7100, "lng": 75.8450, "zone": "Zone-C", "address": "Palasia Square, Indore"},
}

logger = logging.getLogger("swachh.mqtt")


class SwachhMQTTGateway:
    """
    MQTT Gateway that bridges ESP-NOW data to the cloud broker.
    
    Features:
      - State-change-only publishing (saves data bandwidth)
      - Auto-reconnect with exponential backoff
      - Enriches data with GPS coordinates from bin registry
    """

    def __init__(self):
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
            handlers=[logging.StreamHandler(sys.stdout)],
        )

        logger.info("=" * 50)
        logger.info("  SWACHH-AI MQTT Gateway Starting...")
        logger.info("=" * 50)

        # Initialize ESP-NOW bridge
        self.bridge = ESPNowBridge(
            port=SERIAL_PORT,
            baud=SERIAL_BAUD,
        )

        # Initialize MQTT client
        self.client = mqtt.Client(client_id=MQTT_CLIENT_ID)
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message

        # Reconnection state
        self.connected = False
        self.reconnect_delay = 1
        self.max_reconnect_delay = 60

        # Running flag
        self.running = True

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("✅ Connected to MQTT broker")
            self.connected = True
            self.reconnect_delay = 1

            # Subscribe to incoming topics (e.g., route updates from admin)
            client.subscribe("swachh/commands/#", qos=1)
        else:
            logger.error(f"❌ MQTT connection failed (rc={rc})")

    def _on_disconnect(self, client, userdata, rc):
        self.connected = False
        if rc != 0:
            logger.warning(f"⚠️ Unexpected MQTT disconnect (rc={rc})")

    def _on_message(self, client, userdata, msg):
        """Handle incoming commands from admin dashboard."""
        logger.info(f"📨 Received [{msg.topic}]: {msg.payload.decode()}")

    def connect_mqtt(self):
        """Connect to MQTT broker with retry logic."""
        while self.running:
            try:
                logger.info(
                    f"Connecting to MQTT broker {MQTT_BROKER}:{MQTT_PORT}..."
                )
                self.client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
                self.client.loop_start()
                time.sleep(1)  # Wait for connection callback

                if self.connected:
                    return True

            except Exception as e:
                logger.error(
                    f"MQTT connection error: {e} — "
                    f"retrying in {self.reconnect_delay}s"
                )
                time.sleep(self.reconnect_delay)
                self.reconnect_delay = min(
                    self.reconnect_delay * 2, self.max_reconnect_delay
                )

        return False

    def enrich_data(self, data: dict) -> dict:
        """
        Enrich bin data with location information from registry.
        """
        bin_id = data.get("bin_id", 0)
        location = BIN_LOCATIONS.get(bin_id, {})

        enriched = {
            **data,
            "lat": location.get("lat", 0.0),
            "lng": location.get("lng", 0.0),
            "zone": location.get("zone", "Unknown"),
            "address": location.get("address", "Unknown"),
            "status": self._fill_to_status(data.get("fill_pct", 0)),
        }

        return enriched

    @staticmethod
    def _fill_to_status(fill_pct: float) -> str:
        """Convert fill percentage to human-readable status."""
        if fill_pct >= 90:
            return "CRITICAL"
        elif fill_pct >= 80:
            return "FULL"
        elif fill_pct >= 50:
            return "HALF"
        elif fill_pct >= 20:
            return "LOW"
        else:
            return "EMPTY"

    def publish_bin_status(self, data: dict):
        """Publish enriched bin status to MQTT (state-change only)."""
        if not self.bridge.has_state_changed(data):
            logger.debug(
                f"Bin #{data['bin_id']} — no significant change, skipping"
            )
            return

        enriched = self.enrich_data(data)
        payload = json.dumps(enriched)

        result = self.client.publish(
            TOPIC_BIN_STATUS,
            payload,
            qos=1,
            retain=True,  # Retain last status for new subscribers
        )

        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            logger.info(
                f"📤 Published bin_status: Bin #{data['bin_id']} "
                f"→ {data['fill_pct']}% ({enriched['status']})"
            )
        else:
            logger.warning(f"⚠️ Publish failed: rc={result.rc}")

    def run(self):
        """Main gateway loop."""
        # Start ESP-NOW bridge
        bridge_ok = self.bridge.start()
        if not bridge_ok:
            logger.warning("ESP-NOW bridge failed — running MQTT-only mode")

        # Connect to MQTT
        if not self.connect_mqtt():
            logger.error("Failed to connect to MQTT — exiting")
            return

        logger.info("🚀 Gateway running — forwarding bin data to MQTT...")

        while self.running:
            try:
                # Process all pending ESP-NOW data
                pending = self.bridge.get_all_pending()
                for data in pending:
                    self.publish_bin_status(data)

                time.sleep(0.5)

            except KeyboardInterrupt:
                break
            except Exception as e:
                logger.error(f"Gateway error: {e}", exc_info=True)
                time.sleep(2)

        self.shutdown()

    def shutdown(self):
        """Graceful shutdown."""
        logger.info("Shutting down MQTT Gateway...")
        self.running = False
        self.bridge.stop()

        try:
            self.client.loop_stop()
            self.client.disconnect()
        except Exception:
            pass

        logger.info("Gateway stopped")


def main():
    gateway = SwachhMQTTGateway()

    def signal_handler(sig, frame):
        gateway.running = False

    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    gateway.run()


if __name__ == "__main__":
    main()
