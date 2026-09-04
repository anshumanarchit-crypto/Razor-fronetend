"""
Security Validation & Governance Utilities.
Provides HMAC SHA-256 webhook validation, rate limiting, and fail-closed safety handlers.
"""

from typing import Dict, Any, Optional
import hmac
import hashlib
import time
from collections import defaultdict


class WebhookValidator:
    """
    Validates cryptographic authenticity of incoming payment gateway webhooks.
    """

    @classmethod
    def verify_signature(
        cls,
        payload_bytes: bytes,
        signature: str,
        secret: str = "rzp_webhook_secret_dev_demo"
    ) -> bool:
        """
        Verifies HMAC-SHA256 signature against expected secret.
        """
        if not signature or not secret:
            return False
        
        computed = hmac.new(
            secret.encode("utf-8"),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(computed, signature)


class InMemoryRateLimiter:
    """
    Sliding-window rate limiter per tenant / IP address.
    """

    def __init__(self, max_requests_per_minute: int = 120):
        self.max_rpm = max_requests_per_minute
        self.request_timestamps = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        cutoff = now - 60.0
        
        # Clean older entries
        self.request_timestamps[client_id] = [
            t for t in self.request_timestamps[client_id] if t > cutoff
        ]
        
        if len(self.request_timestamps[client_id]) >= self.max_rpm:
            return False

        self.request_timestamps[client_id].append(now)
        return True
