"""
SWACHH-AI — Ultrasonic Sensor Trigger Module
=============================================
Interfaces with HC-SR04 ultrasonic sensor via Raspberry Pi GPIO
to detect when a user places an object within the trigger distance.

Captures are only initiated when an object is detected < 20 cm.
"""

import time
import logging

try:
    import RPi.GPIO as GPIO
except (ImportError, RuntimeError):
    # Mock GPIO for development on non-RPi systems
    class _MockGPIO:
        BCM = "BCM"
        OUT = "OUT"
        IN = "IN"

        @staticmethod
        def setmode(mode): pass

        @staticmethod
        def setup(pin, mode): pass

        @staticmethod
        def output(pin, state): pass

        @staticmethod
        def input(pin): return 0

        @staticmethod
        def cleanup(): pass

        @staticmethod
        def setwarnings(flag): pass

    GPIO = _MockGPIO()
    logging.getLogger("swachh.sensor").warning(
        "RPi.GPIO not available — using mock GPIO for development"
    )

from config import (
    TRIGGER_PIN,
    ECHO_PIN,
    TRIGGER_DISTANCE_CM,
    SENSOR_TIMEOUT_S,
)

logger = logging.getLogger("swachh.sensor")


class UltrasonicTrigger:
    """
    HC-SR04 ultrasonic distance sensor interface.
    
    Wiring:
        VCC  → 5V
        GND  → GND
        TRIG → GPIO 23 (BCM)
        ECHO → GPIO 24 (BCM) via voltage divider (5V → 3.3V)
    
    Usage:
        sensor = UltrasonicTrigger()
        if sensor.is_object_detected():
            # Capture and classify waste
            ...
        sensor.cleanup()
    """

    def __init__(
        self,
        trigger_pin: int = TRIGGER_PIN,
        echo_pin: int = ECHO_PIN,
        threshold_cm: float = TRIGGER_DISTANCE_CM,
    ):
        self.trigger_pin = trigger_pin
        self.echo_pin = echo_pin
        self.threshold_cm = threshold_cm

        # Setup GPIO
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.trigger_pin, GPIO.OUT)
        GPIO.setup(self.echo_pin, GPIO.IN)

        # Ensure trigger starts LOW
        GPIO.output(self.trigger_pin, False)
        time.sleep(0.05)  # Settle time

        logger.info(
            f"Ultrasonic sensor initialized — "
            f"TRIG: GPIO{trigger_pin}, ECHO: GPIO{echo_pin}, "
            f"Threshold: {threshold_cm} cm"
        )

    def measure_distance(self) -> float:
        """
        Measure distance to nearest object using HC-SR04.
        
        Returns:
            Distance in centimeters, or -1.0 on timeout/error.
        """
        # Send 10µs trigger pulse
        GPIO.output(self.trigger_pin, True)
        time.sleep(0.00001)  # 10 microseconds
        GPIO.output(self.trigger_pin, False)

        # Wait for echo to go HIGH (start of return pulse)
        pulse_start = time.time()
        timeout = pulse_start + SENSOR_TIMEOUT_S

        while GPIO.input(self.echo_pin) == 0:
            pulse_start = time.time()
            if pulse_start > timeout:
                logger.warning("Ultrasonic sensor timeout (no echo start)")
                return -1.0

        # Wait for echo to go LOW (end of return pulse)
        pulse_end = time.time()
        timeout = pulse_end + SENSOR_TIMEOUT_S

        while GPIO.input(self.echo_pin) == 1:
            pulse_end = time.time()
            if pulse_end > timeout:
                logger.warning("Ultrasonic sensor timeout (no echo end)")
                return -1.0

        # Calculate distance
        # Speed of sound = 343 m/s = 34300 cm/s
        # Distance = (time × speed) / 2 (round trip)
        pulse_duration = pulse_end - pulse_start
        distance_cm = (pulse_duration * 34300) / 2

        logger.debug(f"Distance measured: {distance_cm:.1f} cm")
        return round(distance_cm, 2)

    def is_object_detected(self) -> bool:
        """
        Check if an object is within the trigger distance.
        
        Takes 3 rapid readings and uses the median to filter noise.
        
        Returns:
            True if object detected within threshold_cm
        """
        readings = []
        for _ in range(3):
            dist = self.measure_distance()
            if dist > 0:
                readings.append(dist)
            time.sleep(0.01)  # Small delay between readings

        if not readings:
            return False

        median_dist = sorted(readings)[len(readings) // 2]
        detected = median_dist <= self.threshold_cm

        if detected:
            logger.info(
                f"🎯 Object detected at {median_dist:.1f} cm "
                f"(threshold: {self.threshold_cm} cm)"
            )

        return detected

    def cleanup(self):
        """Release GPIO resources."""
        GPIO.cleanup()
        logger.info("GPIO resources released")
