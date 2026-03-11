# ─────────────────────────────────────────────
# SWACHH-AI Edge AI Configuration
# ─────────────────────────────────────────────

import os

# ── Model ──────────────────────────────────
MODEL_PATH = os.getenv("MODEL_PATH", "models/yolov8_waste.tflite")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))
NMS_IOU_THRESHOLD = float(os.getenv("NMS_IOU_THRESHOLD", "0.5"))
INPUT_SIZE = (640, 640)  # YOLOv8 default input resolution

# Class labels for waste classification
CLASS_NAMES = ["Organic", "Plastic", "Paper", "Metal"]
NUM_CLASSES = len(CLASS_NAMES)

# ── Ultrasonic Sensor (HC-SR04) ────────────
TRIGGER_PIN = int(os.getenv("TRIGGER_PIN", "23"))  # BCM GPIO
ECHO_PIN = int(os.getenv("ECHO_PIN", "24"))         # BCM GPIO
TRIGGER_DISTANCE_CM = float(os.getenv("TRIGGER_DISTANCE_CM", "20.0"))
SENSOR_TIMEOUT_S = 0.04  # Max echo wait (~6.8m range)

# ── Camera ─────────────────────────────────
CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))
CAMERA_WIDTH = 1280
CAMERA_HEIGHT = 720
CAMERA_FPS = 30

# ── MQTT ───────────────────────────────────
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPIC_REWARD = "swachh/user_reward"
MQTT_TOPIC_BIN_STATUS = "swachh/bin_status"
MQTT_CLIENT_ID = "swachh_edge_ai"

# ── Green Credits ──────────────────────────
# Credits awarded per waste category
CREDIT_TABLE = {
    "Organic":  10,
    "Plastic":  25,
    "Paper":    15,
    "Metal":    30,
}

# ── Logging ────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", "logs/edge_ai.log")
