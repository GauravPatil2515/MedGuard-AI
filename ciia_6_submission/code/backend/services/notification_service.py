"""
MedGuard AI — Notification Service (Web Push / Mock FCM & APNs)
==============================================================
Provides cross-platform push notifications for critical medication dose alerts,
caregiver escalations, and refill warnings.
"""

import logging
import os
import json
from typing import Dict, Any, Optional

logger = logging.getLogger("medguard.notifications")


class NotificationService:
    def __init__(self):
        self.fcm_server_key = os.getenv("FCM_SERVER_KEY", None)
        self.apns_cert_path = os.getenv("APNS_CERT_PATH", None)

    def send_caregiver_push(
        self,
        caregiver_id: str,
        patient_name: str,
        drug_name: str,
        criticality: str,
        title: str = "⚠️ Critical Dose Alert",
        body: Optional[str] = None
    ) -> Dict[str, Any]:
        """Dispatches an urgent push alert to a caregiver's registered mobile device."""
        if not body:
            body = f"{patient_name} missed high-criticality medication: {drug_name}. Immediate action required."

        payload = {
            "to_caregiver": caregiver_id,
            "notification": {
                "title": title,
                "body": body,
                "priority": "high",
                "sound": "critical_alarm.wav"
            },
            "data": {
                "patient_name": patient_name,
                "drug_name": drug_name,
                "criticality": criticality,
                "type": "MISSED_DOSE_ESCALATION"
            }
        }

        # If live FCM key configured, would post to https://fcm.googleapis.com/fcm/send
        logger.info(f"[PUSH NOTIFICATION DISPATCHED] -> Caregiver {caregiver_id}: {body}")
        return {"status": "DELIVERED", "payload": payload}

    def send_patient_reminder(
        self,
        patient_id: str,
        drug_name: str,
        dose: str,
        scheduled_time: str
    ) -> Dict[str, Any]:
        """Dispatches scheduled reminder to patient's device."""
        body = f"Time to take your {drug_name} ({dose})."
        payload = {
            "to_patient": patient_id,
            "notification": {
                "title": "💊 Medication Reminder",
                "body": body
            },
            "data": {
                "drug_name": drug_name,
                "dose": dose,
                "scheduled_time": scheduled_time
            }
        }
        logger.info(f"[PATIENT REMINDER DISPATCHED] -> Patient {patient_id}: {body}")
        return {"status": "DELIVERED", "payload": payload}
