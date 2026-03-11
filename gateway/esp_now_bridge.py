"""
SWACHH-AI — ESP-NOW Serial Bridge (Raspberry Pi)
=================================================
Receives ESP-NOW data from ESP32 bin nodes via a USB-connected
ESP32 "receiver" module running a serial forwarding sketch.

The bridge ESP32 receives ESP-NOW packets and forwards the raw
binary struct over Serial/USB to the Raspberry Pi, where this
script parses it into JSON for the MQTT client.

Protocol:
  ESP32 Nodes --[ESP-NOW]--> Bridge ESP32 --[Serial/USB]--> RPi
"""

import struct
import json
import time
import logging
import threading
from collections import deque

try:
    import serial
except ImportError:
    serial = None
    print("WARNING: pyserial not installed — using mock serial")

logger = logging.getLogger("swachh.bridge")

# ── Payload struct format (must match ESP32 BinPayload) ────────
# uint8_t  bin_id        (B)
# float    fill_pct      (f)
# float    distance_cm   (f)
# float    battery_v     (f)
# uint32_t reading_count (I)
# uint32_t timestamp     (I)
PAYLOAD_FORMAT = "<BfffII"
PAYLOAD_SIZE = struct.calcsize(PAYLOAD_FORMAT)  # 21 bytes


def parse_payload(raw_bytes: bytes) -> dict | None:
    """
    Parse binary ESP-NOW payload into a Python dict.
    
    Args:
        raw_bytes: Raw binary data (21 bytes)
        
    Returns:
        Parsed dict or None on error
    """
    if len(raw_bytes) != PAYLOAD_SIZE:
        logger.warning(
            f"Invalid payload size: {len(raw_bytes)} (expected {PAYLOAD_SIZE})"
        )
        return None

    try:
        (
            bin_id,
            fill_pct,
            distance_cm,
            battery_v,
            reading_count,
            timestamp_ms,
        ) = struct.unpack(PAYLOAD_FORMAT, raw_bytes)

        # Sanity checks
        if fill_pct < 0 or fill_pct > 100:
            logger.warning(f"Invalid fill_pct: {fill_pct}")
            fill_pct = max(0, min(100, fill_pct))

        return {
            "bin_id": bin_id,
            "fill_pct": round(fill_pct, 1),
            "distance_cm": round(distance_cm, 1),
            "battery_v": round(battery_v, 2),
            "reading_count": reading_count,
            "node_timestamp_ms": timestamp_ms,
            "received_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        }

    except struct.error as e:
        logger.error(f"Struct unpack error: {e}")
        return None


class ESPNowBridge:
    """
    Serial bridge for receiving ESP-NOW data on Raspberry Pi.
    
    Usage:
        bridge = ESPNowBridge(port="/dev/ttyUSB0")
        bridge.start()
        
        while True:
            data = bridge.get_latest()
            if data:
                print(data)
    """

    def __init__(
        self,
        port: str = "/dev/ttyUSB0",
        baud: int = 115200,
        timeout: float = 1.0,
    ):
        self.port = port
        self.baud = baud
        self.timeout = timeout
        self.serial_conn = None
        self.running = False
        self.data_queue = deque(maxlen=100)
        self._thread = None

        # State tracking for change detection
        self.bin_states: dict[int, float] = {}  # bin_id → last fill_pct
        self.state_change_threshold = 5.0  # % change to trigger update

    def connect(self):
        """Open serial connection to bridge ESP32."""
        if serial is None:
            logger.warning("pyserial not available — running in mock mode")
            return False

        try:
            self.serial_conn = serial.Serial(
                port=self.port,
                baudrate=self.baud,
                timeout=self.timeout,
            )
            logger.info(f"✅ Serial connected: {self.port} @ {self.baud} baud")
            return True
        except serial.SerialException as e:
            logger.error(f"❌ Serial connection failed: {e}")
            return False

    def _read_loop(self):
        """Background thread: continuously read serial data."""
        logger.info("Serial read loop started")
        buffer = b""

        while self.running and self.serial_conn:
            try:
                # Read available bytes
                if self.serial_conn.in_waiting > 0:
                    buffer += self.serial_conn.read(
                        self.serial_conn.in_waiting
                    )

                    # Process complete payloads
                    while len(buffer) >= PAYLOAD_SIZE:
                        raw = buffer[:PAYLOAD_SIZE]
                        buffer = buffer[PAYLOAD_SIZE:]

                        parsed = parse_payload(raw)
                        if parsed:
                            self.data_queue.append(parsed)
                            logger.info(
                                f"📡 Bin #{parsed['bin_id']}: "
                                f"{parsed['fill_pct']}% full, "
                                f"battery: {parsed['battery_v']}V"
                            )
                else:
                    time.sleep(0.05)  # Prevent CPU spin

            except Exception as e:
                logger.error(f"Serial read error: {e}")
                time.sleep(1)

    def start(self):
        """Start the background serial reading thread."""
        if not self.connect():
            return False

        self.running = True
        self._thread = threading.Thread(
            target=self._read_loop, daemon=True, name="esp-now-bridge"
        )
        self._thread.start()
        return True

    def stop(self):
        """Stop the bridge and close serial connection."""
        self.running = False
        if self._thread:
            self._thread.join(timeout=3)
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
        logger.info("Bridge stopped")

    def get_latest(self) -> dict | None:
        """Pop the latest received data from the queue."""
        try:
            return self.data_queue.popleft()
        except IndexError:
            return None

    def get_all_pending(self) -> list[dict]:
        """Drain all pending data from the queue."""
        items = []
        while self.data_queue:
            try:
                items.append(self.data_queue.popleft())
            except IndexError:
                break
        return items

    def has_state_changed(self, data: dict) -> bool:
        """
        Check if a bin's state has changed significantly.
        Only returns True if fill_pct changed by >= threshold.
        """
        bin_id = data["bin_id"]
        fill_pct = data["fill_pct"]

        if bin_id not in self.bin_states:
            self.bin_states[bin_id] = fill_pct
            return True  # First reading always triggers

        delta = abs(fill_pct - self.bin_states[bin_id])
        if delta >= self.state_change_threshold:
            self.bin_states[bin_id] = fill_pct
            logger.info(
                f"State change detected for Bin #{bin_id}: "
                f"Δ={delta:.1f}%"
            )
            return True

        return False
