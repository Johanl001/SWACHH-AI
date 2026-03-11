"""
SWACHH-AI — Edge AI Main Service
=================================
Main control loop that orchestrates:
  1. Ultrasonic sensor polling (object detection)
  2. Camera frame capture
  3. YOLOv8 TFLite waste classification
  4. Green Credit reward generation
  5. MQTT publishing of rewards

Designed for Raspberry Pi 4 + Pi Camera Module 3.
"""

import cv2
import json
import time
import signal
import sys
import logging
import logging.handlers
import os

import paho.mqtt.client as mqtt

from config import (
    CAMERA_INDEX,
    CAMERA_WIDTH,
    CAMERA_HEIGHT,
    CAMERA_FPS,
    MQTT_BROKER,
    MQTT_PORT,
    MQTT_CLIENT_ID,
    MQTT_TOPIC_REWARD,
    LOG_LEVEL,
    LOG_FILE,
)
from inference import WasteClassifier
from sensor_trigger import UltrasonicTrigger
from green_credit import GreenCreditEngine

# ── Logging Setup ──────────────────────────
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.handlers.RotatingFileHandler(
            LOG_FILE, maxBytes=5_000_000, backupCount=3
        ),
    ],
)
logger = logging.getLogger("swachh.main")


class SwachhEdgeAI:
    """
    Main service orchestrating the Edge AI pipeline.
    
    Flow:
        ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌────────┐
        │ HC-SR04  │────→│ Pi Camera  │────→│ YOLOv8   │────→│ Green  │
        │ Trigger  │     │ Capture    │     │ Classify │     │ Credit │
        └──────────┘     └────────────┘     └──────────┘     └────┬───┘
                                                                  │
                                                           ┌──────▼──────┐
                                                           │ MQTT Publish │
                                                           └─────────────┘
    """

    def __init__(self):
        logger.info("=" * 60)
        logger.info("  SWACHH-AI Edge AI Service Starting...")
        logger.info("=" * 60)

        # Initialize components
        self.sensor = UltrasonicTrigger()
        self.classifier = WasteClassifier()
        self.credit_engine = GreenCreditEngine()

        # Initialize camera
        self.camera = cv2.VideoCapture(CAMERA_INDEX)
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
        self.camera.set(cv2.CAP_PROP_FPS, CAMERA_FPS)

        if not self.camera.isOpened():
            logger.error("❌ Failed to open camera!")
            raise RuntimeError("Camera initialization failed")

        logger.info(
            f"📷 Camera initialized: {CAMERA_WIDTH}×{CAMERA_HEIGHT} @ {CAMERA_FPS}fps"
        )

        # Initialize MQTT client
        self.mqtt_client = mqtt.Client(client_id=MQTT_CLIENT_ID)
        self.mqtt_client.on_connect = self._on_mqtt_connect
        self.mqtt_client.on_disconnect = self._on_mqtt_disconnect

        try:
            self.mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
            self.mqtt_client.loop_start()
        except Exception as e:
            logger.warning(f"⚠️ MQTT connection failed: {e} — running in offline mode")
            self.mqtt_connected = False

        # State
        self.running = True
        self.cooldown_seconds = 3  # Prevent rapid re-triggers
        self.last_trigger_time = 0

    def _on_mqtt_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("✅ Connected to MQTT broker")
            self.mqtt_connected = True
        else:
            logger.error(f"❌ MQTT connection failed with code: {rc}")
            self.mqtt_connected = False

    def _on_mqtt_disconnect(self, client, userdata, rc):
        logger.warning(f"⚠️ Disconnected from MQTT broker (rc={rc})")
        self.mqtt_connected = False

    def capture_frame(self):
        """Capture a single frame from the Pi Camera."""
        ret, frame = self.camera.read()
        if not ret or frame is None:
            logger.error("Failed to capture frame")
            return None
        return frame

    def publish_reward(self, reward: dict):
        """Publish reward data to MQTT broker."""
        try:
            payload = json.dumps(reward)
            result = self.mqtt_client.publish(
                MQTT_TOPIC_REWARD, payload, qos=1
            )
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"📤 Published reward to {MQTT_TOPIC_REWARD}")
            else:
                logger.warning(f"⚠️ MQTT publish failed: rc={result.rc}")
        except Exception as e:
            logger.error(f"MQTT publish error: {e}")

    def process_disposal(self):
        """
        Full disposal event pipeline:
        Capture → Classify → Reward → Publish
        """
        logger.info("🔄 Processing disposal event...")

        # Capture frame
        frame = self.capture_frame()
        if frame is None:
            return

        # Run classification
        annotated_frame, detections = self.classifier.classify_and_annotate(frame)

        if not detections:
            logger.info("No waste detected in frame — skipping")
            return

        # Log detections
        for det in detections:
            logger.info(
                f"  🏷️  {det['class']} ({det['confidence']:.0%}) "
                f"@ [{det['bbox']}]"
            )

        # Compute reward (using placeholder user_id — real system uses NFC/QR)
        reward = self.credit_engine.compute_reward(
            detections, user_id="citizen_001"
        )

        if reward:
            # Generate verification signal
            signal = self.credit_engine.generate_verification_signal(reward)
            logger.info(f"✅ Verification signal:\n{signal}")

            # Publish to MQTT
            self.publish_reward(reward)

        # Optionally save annotated frame for debugging
        debug_path = f"logs/detection_{int(time.time())}.jpg"
        cv2.imwrite(debug_path, annotated_frame)
        logger.debug(f"Saved debug frame: {debug_path}")

    def run(self):
        """
        Main event loop.
        
        Poll ultrasonic sensor → On trigger → Capture & Classify → Reward
        """
        logger.info("🚀 Edge AI service running — waiting for objects...")

        while self.running:
            try:
                # Check if object is within trigger distance
                if self.sensor.is_object_detected():
                    # Cooldown check to prevent rapid re-triggers
                    now = time.time()
                    if now - self.last_trigger_time >= self.cooldown_seconds:
                        self.last_trigger_time = now
                        self.process_disposal()
                    else:
                        remaining = self.cooldown_seconds - (now - self.last_trigger_time)
                        logger.debug(
                            f"Cooldown active — {remaining:.1f}s remaining"
                        )

                # Small sleep to prevent CPU hammering
                time.sleep(0.1)

            except KeyboardInterrupt:
                logger.info("Keyboard interrupt received")
                break
            except Exception as e:
                logger.error(f"Error in main loop: {e}", exc_info=True)
                time.sleep(1)  # Prevent tight error loop

        self.shutdown()

    def shutdown(self):
        """Graceful shutdown — release all resources."""
        logger.info("Shutting down Edge AI service...")
        self.running = False

        if self.camera.isOpened():
            self.camera.release()
            logger.info("Camera released")

        self.sensor.cleanup()

        try:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        except Exception:
            pass

        # Print session summary
        summary = self.credit_engine.get_session_summary()
        logger.info(
            f"\n{'=' * 40}\n"
            f"  Session Summary\n"
            f"  Items Processed: {summary['total_items']}\n"
            f"  Credits Awarded: {summary['total_credits']}\n"
            f"  Avg Credits/Item: {summary['avg_credits_per_item']}\n"
            f"{'=' * 40}"
        )


def main():
    """Entry point."""
    service = SwachhEdgeAI()

    # Graceful shutdown on SIGTERM (Docker stop)
    def signal_handler(sig, frame):
        logger.info(f"Signal {sig} received — shutting down")
        service.running = False

    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    service.run()


if __name__ == "__main__":
    main()
