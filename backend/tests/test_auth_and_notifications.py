import unittest
import os
import sys
import json
import time
from pathlib import Path

# Add backend directory to path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND_DIR))

from services.auth_service import (

    hash_password, verify_password, create_access_token, decode_token
)
from services.notification_service import NotificationService
from services.audit_trail import AuditTrailService


class TestAuthAndNotificationIntegration(unittest.TestCase):

    def test_password_hashing_and_verification(self):
        raw_pw = "DoctorSecret123!"
        hashed = hash_password(raw_pw)
        self.assertNotEqual(raw_pw, hashed)
        self.assertTrue(verify_password(hashed, raw_pw))
        self.assertFalse(verify_password(hashed, "WrongPassword"))

    def test_jwt_token_generation_and_decode(self):
        user_id = "usr_test_999"
        email = "physician@hospital.org"
        role = "CLINICIAN"
        token = create_access_token(user_id=user_id, role=role, email=email)
        decoded = decode_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], user_id)
        self.assertEqual(decoded["role"], role)
        self.assertEqual(decoded["email"], email)

    def test_notification_service_caregiver_push(self):
        notifier = NotificationService()
        result = notifier.send_caregiver_push(
            caregiver_id="caregiver_ramesh_45",
            patient_name="Mrs. Sunita Kulkarni",
            drug_name="Warfarin",
            criticality="HIGH"
        )
        self.assertEqual(result["status"], "DELIVERED")
        self.assertIn("notification", result["payload"])
        self.assertEqual(result["payload"]["data"]["criticality"], "HIGH")


if __name__ == "__main__":
    unittest.main()
