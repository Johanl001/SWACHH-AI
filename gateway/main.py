# SWACHH-AI — Gateway
# Team Strawhats | Sanjivani College of Engineering, Kopargaon
# India Innovate 2026

import os
import sys
import logging
from mqtt_client import MQTTPublisher
from esp_now_bridge import run_bridge

os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/gateway.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

def main():
    logging.info("Starting SWACHH-AI Gateway Service")
    publisher = MQTTPublisher()
    publisher.loop_start()
    
    # Run the bridge loop blocking
    try:
        run_bridge(publisher.publish_bin_status)
    except KeyboardInterrupt:
        logging.info("Gateway stopped by user")

if __name__ == "__main__":
    main()
