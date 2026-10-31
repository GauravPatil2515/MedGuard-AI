"""
MedGuard AI / SAFE CAP⁺ — Firebase Realtime Database Integration
================================================================
Synchronizes real-time dose status, bottle inventories, and caregiver alerts
with your Firebase Realtime Database (RTDB):
URL: https://safecap-3b06f-default-rtdb.firebaseio.com/
"""

import os
import time
import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger("medguard.firebase")

DEFAULT_FIREBASE_URL = os.getenv(
    "FIREBASE_DATABASE_URL",
    "https://safecap-3b06f-default-rtdb.firebaseio.com"
).rstrip("/")


class FirebaseRealtimeService:
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = (db_url or DEFAULT_FIREBASE_URL).rstrip("/")
        self.auth_token = os.getenv("FIREBASE_AUTH_SECRET", None)

    def _get_url(self, path: str) -> str:
        clean_path = path.strip("/")
        auth_param = f"?auth={self.auth_token}" if self.auth_token else ""
        return f"{self.db_url}/{clean_path}.json{auth_param}"

    def update_patient_status(self, patient_id: str, data: Dict[str, Any]) -> bool:
        """Pushes real-time patient adherence and status updates."""
        try:
            url = self._get_url(f"patients/{patient_id}/status")
            payload = {
                **data,
                "last_updated": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "timestamp": int(time.time() * 1000)
            }
            resp = requests.patch(url, json=payload, timeout=5)
            return resp.status_code == 200
        except Exception as e:
            logger.warning(f"Firebase update_patient_status failed: {e}")
            return False

    def push_caregiver_alert(self, patient_id: str, alert_data: Dict[str, Any]) -> bool:
        """Pushes an instant alert banner to the caregiver real-time feed."""
        try:
            url = self._get_url(f"caregiver_alerts/{patient_id}")
            payload = {
                **alert_data,
                "timestamp": int(time.time() * 1000),
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            resp = requests.post(url, json=payload, timeout=5)
            return resp.status_code == 200
        except Exception as e:
            logger.warning(f"Firebase push_caregiver_alert failed: {e}")
            return False

    def update_bottle_inventory(self, patient_id: str, drug_name: str, remaining: int, total: int) -> bool:
        """Updates live SAFE CAP⁺ bottle tablet inventory."""
        try:
            safe_drug_key = drug_name.replace(" ", "_").replace("/", "_")
            url = self._get_url(f"bottles/{patient_id}/{safe_drug_key}")
            payload = {
                "drug_name": drug_name,
                "remaining_pills": remaining,
                "total_pills": total,
                "refill_needed": remaining <= 5,
                "cap_locked": True,
                "last_sync": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            resp = requests.put(url, json=payload, timeout=5)
            return resp.status_code == 200
        except Exception as e:
            logger.warning(f"Firebase update_bottle_inventory failed: {e}")
            return False

    def get_patient_data(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Reads latest realtime state for a patient."""
        try:
            url = self._get_url(f"patients/{patient_id}")
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            logger.warning(f"Firebase get_patient_data failed: {e}")
        return None
