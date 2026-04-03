# SWACHH-AI — Edge AI
# Team Strawhats | Sanjivani College of Engineering, Kopargaon
# India Innovate 2026

import hashlib
import time
from config import CREDIT_TABLE

def calculate_credits(waste_type: str, rank_multiplier: float = 1.0) -> int:
    """Look up CREDIT_TABLE, multiply by rank_multiplier, return int."""
    base_credits = CREDIT_TABLE.get(waste_type, 0)
    return int(base_credits * rank_multiplier)

def generate_verification_hash(user_id: str, timestamp: float, waste_type: str) -> str:
    """SHA-256 of user_id:timestamp:waste_type."""
    data = f"{user_id}:{timestamp}:{waste_type}"
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def build_reward_payload(user_id: str, waste_type: str, confidence: float, bin_id: str, rank_multiplier: float = 1.0) -> dict:
    """Return full MQTT payload."""
    credits_awarded = calculate_credits(waste_type, rank_multiplier)
    timestamp = time.time()
    verification_hash = generate_verification_hash(user_id, timestamp, waste_type)
    
    return {
        "user_id": user_id,
        "waste_type": waste_type,
        "confidence": confidence,
        "credits_awarded": credits_awarded,
        "timestamp": timestamp,
        "bin_id": bin_id,
        "verification_hash": verification_hash
    }
