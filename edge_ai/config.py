# SWACHH-AI — Edge AI
# Team Strawhats | Sanjivani College of Engineering, Kopargaon
# India Innovate 2026

MODEL_PATH = "../models/yolov8_waste.tflite"
INPUT_SIZE = (320, 320)
CONFIDENCE_THRESHOLD = 0.45
TRIGGER_DISTANCE_CM = 20
TRIGGER_PIN = 23       # HC-SR04 TRIG GPIO (BCM)
ECHO_PIN = 24          # HC-SR04 ECHO GPIO (BCM)
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_USER = "gateway_user"
MQTT_PASS = "PLACEHOLDER_MQTT_PASS"
CLASS_NAMES = ["Organic", "Paper", "Plastic", "Metal"]
CREDIT_TABLE = {"Organic": 10, "Paper": 15, "Plastic": 25, "Metal": 30}
LOG_FILE = "logs/edge_ai.log"
