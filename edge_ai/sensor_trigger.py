# SWACHH-AI — Edge AI
# Team Strawhats | Sanjivani College of Engineering, Kopargaon
# India Innovate 2026

import time
import logging

try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    logging.warning("RPi.GPIO not available, running in mock mode.")
    GPIO_AVAILABLE = False

class UltrasonicSensor:
    """Class to interact with HC-SR04 ultrasonic sensor."""

    def __init__(self, trig_pin: int, echo_pin: int):
        """Initialize GPIO pins for HC-SR04."""
        self.trig_pin = trig_pin
        self.echo_pin = echo_pin
        if GPIO_AVAILABLE:
            try:
                GPIO.setmode(GPIO.BCM)
                GPIO.setup(self.trig_pin, GPIO.OUT)
                GPIO.setup(self.echo_pin, GPIO.IN)
                GPIO.output(self.trig_pin, False)
                time.sleep(2) # settle time
            except Exception as e:
                logging.error(f"GPIO setup failed: {e}")

    def read_distance_cm(self) -> float:
        """Measure distance in cm."""
        if not GPIO_AVAILABLE:
            time.sleep(0.1)
            return 15.0 # mock distance (triggers easily)

        try:
            GPIO.output(self.trig_pin, True)
            time.sleep(0.00001) # 10us
            GPIO.output(self.trig_pin, False)

            pulse_start = time.time()
            pulse_end = time.time()

            timeout = time.time() + 0.05 # 50ms timeout
            while GPIO.input(self.echo_pin) == 0:
                pulse_start = time.time()
                if pulse_start > timeout:
                    return 999.0

            timeout = time.time() + 0.05
            while GPIO.input(self.echo_pin) == 1:
                pulse_end = time.time()
                if pulse_end > timeout:
                    return 999.0

            pulse_duration = pulse_end - pulse_start
            distance = pulse_duration * 17150
            return round(distance, 2)
        except Exception as e:
            logging.error(f"Distance read failed: {e}")
            return 999.0

    def is_triggered(self, threshold_cm: float) -> bool:
        """Return True if distance <= threshold_cm."""
        return self.read_distance_cm() <= threshold_cm
