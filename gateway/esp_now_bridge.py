# SWACHH-AI — Gateway
# Team Strawhats | Sanjivani College of Engineering, Kopargaon
# India Innovate 2026

import struct
import time
import logging
import serial

STRUCT_FORMAT = '<BfffII'
STRUCT_SIZE = 21
SERIAL_PORT = '/dev/ttyUSB0'
BAUD_RATE = 115200

BIN_ZONE_MAP = {
    1: "Delhi-Ward-14",
    2: "Delhi-Ward-14",
    3: "Mumbai-Ward-3",
    4: "Mumbai-Ward-3",
    5: "Pune-Ward-7",
    6: "Pune-Ward-7",
    7: "Delhi-Ward-14",
    8: "Mumbai-Ward-3",
    9: "Pune-Ward-7",
    10: "Delhi-Ward-14"
}

BIN_GPS_MAP = {
    1: {"lat": 28.6139, "lng": 77.2090},
    2: {"lat": 28.6149, "lng": 77.2190},
    3: {"lat": 19.0760, "lng": 72.8777},
    4: {"lat": 19.0860, "lng": 72.8877},
    5: {"lat": 18.5204, "lng": 73.8567},
    6: {"lat": 18.5304, "lng": 73.8667},
    7: {"lat": 28.6239, "lng": 77.2290},
    8: {"lat": 19.0960, "lng": 72.8977},
    9: {"lat": 18.5404, "lng": 73.8767},
    10: {"lat": 28.6339, "lng": 77.2390}
}

def parse_payload(raw: bytes) -> dict:
    """Unpack struct and return dict."""
    try:
        unpacked = struct.unpack(STRUCT_FORMAT, raw)
        return {
            "bin_id": unpacked[0],
            "fill_pct": unpacked[1],
            "distance_cm": unpacked[2],
            "battery_v": unpacked[3],
            "reading_count": unpacked[4],
            "timestamp": unpacked[5],
            "received_at": time.time()
        }
    except Exception as e:
        logging.error(f"Payload parse error: {e}")
        return {}

def run_bridge(on_packet_callback):
    """Open serial port, read frames, parse, and call callback."""
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        logging.info(f"Opened serial port {SERIAL_PORT}")
    except Exception as e:
        logging.error(f"Failed to open serial port {SERIAL_PORT}: {e}")
        return

    buffer = bytearray()
    
    while True:
        try:
            if ser.in_waiting > 0:
                chunk = ser.read(ser.in_waiting)
                buffer.extend(chunk)
                
                while len(buffer) >= STRUCT_SIZE:
                    # simplistic framing since it's exactly 21 bytes
                    frame = bytes(buffer[:STRUCT_SIZE])
                    payload_dict = parse_payload(frame)
                    
                    if payload_dict and payload_dict.get('bin_id') in BIN_ZONE_MAP:
                        payload_dict["zone"] = BIN_ZONE_MAP.get(payload_dict["bin_id"])
                        coords = BIN_GPS_MAP.get(payload_dict["bin_id"], {"lat": 0.0, "lng": 0.0})
                        payload_dict["lat"] = coords["lat"]
                        payload_dict["lng"] = coords["lng"]
                        
                        on_packet_callback(payload_dict)
                        buffer = buffer[STRUCT_SIZE:]
                    else:
                        # alignment recovery
                        buffer.pop(0)
            else:
                time.sleep(0.1)
        except serial.SerialException as e:
            logging.error(f"Serial exception: {e}")
            time.sleep(2)
        except KeyboardInterrupt:
            logging.info("Bridge stopped by user.")
            break
        except Exception as e:
            logging.error(f"Unexpected error in bridge: {e}")
            if buffer:
                buffer.pop(0)
            
    ser.close()
