"""
SWACHH-AI — Green Credit Reward Engine
=======================================
Generates "Green Credit" verification signals when users
correctly dispose of classified waste items.

Credits are awarded based on waste category to incentivize
recycling of harder-to-process materials (Metal > Plastic > Paper > Organic).
"""

import json
import time
import uuid
import logging

from config import CREDIT_TABLE

logger = logging.getLogger("swachh.credits")


class GreenCreditEngine:
    """
    Computes and generates Green Credit rewards from waste classification.
    
    Credit Table:
        Organic  → 10 credits
        Plastic  → 25 credits
        Paper    → 15 credits
        Metal    → 30 credits
    
    Usage:
        engine = GreenCreditEngine()
        reward = engine.compute_reward(detections, user_id="user_123")
        # reward = {"user_id": "user_123", "credits": 25, ...}
    """

    def __init__(self, credit_table: dict = None):
        self.credit_table = credit_table or CREDIT_TABLE
        self.session_credits = 0
        self.session_items = 0
        logger.info(f"Green Credit Engine initialized — Table: {self.credit_table}")

    def compute_reward(
        self,
        detections: list[dict],
        user_id: str = "anonymous",
    ) -> dict | None:
        """
        Compute the Green Credit reward for a set of detections.
        
        Awards credits for the highest-confidence detection only
        (one reward per disposal event).
        
        Args:
            detections: List of detection dicts from WasteClassifier
            user_id: Identifier for the citizen (QR code / NFC)
            
        Returns:
            Reward payload dict, or None if no valid detections
        """
        if not detections:
            logger.debug("No detections — no reward generated")
            return None

        # Pick the highest-confidence detection
        best = max(detections, key=lambda d: d["confidence"])
        waste_class = best["class"]
        confidence = best["confidence"]

        # Look up credit value
        credits = self.credit_table.get(waste_class, 0)
        if credits == 0:
            logger.warning(f"Unknown waste class: {waste_class}")
            return None

        # Apply confidence multiplier (reward accuracy)
        # Full credits at ≥80% confidence, scaled down below
        confidence_multiplier = min(confidence / 0.8, 1.0)
        adjusted_credits = int(credits * confidence_multiplier)

        # Build reward payload
        reward = {
            "transaction_id": str(uuid.uuid4())[:8],
            "user_id": user_id,
            "waste_type": waste_class,
            "confidence": round(confidence, 4),
            "credits_awarded": adjusted_credits,
            "credits_base": credits,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "verified": True,
        }

        # Track session totals
        self.session_credits += adjusted_credits
        self.session_items += 1

        logger.info(
            f"💰 Reward: {adjusted_credits} credits for {waste_class} "
            f"(conf: {confidence:.0%}) → User: {user_id}"
        )

        return reward

    def generate_verification_signal(self, reward: dict) -> str:
        """
        Generate a JSON verification signal for downstream systems
        (MQTT publish, LED feedback, buzzer, etc.).
        
        Returns:
            JSON string of the reward payload
        """
        signal = json.dumps(reward, indent=2)
        logger.debug(f"Verification signal generated:\n{signal}")
        return signal

    def get_session_summary(self) -> dict:
        """Return cumulative session statistics."""
        return {
            "total_credits": self.session_credits,
            "total_items": self.session_items,
            "avg_credits_per_item": (
                round(self.session_credits / self.session_items, 1)
                if self.session_items > 0 else 0
            ),
        }

    def reset_session(self):
        """Reset session tracking counters."""
        self.session_credits = 0
        self.session_items = 0
        logger.info("Session counters reset")
