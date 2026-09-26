"""
MedGuard AI — Caregiver Linking & Patient Management Service
============================================================
Provides secure patient↔caregiver relational data model.

Tables:
  - patients         (id, name, age, diagnosis, created_at)
  - caregivers       (id, name, phone, email, relation, created_at)
  - caregiver_links  (patient_id, caregiver_id, access_level, created_at)
  - schedules        (id, patient_id, drug_name, dose, frequency, start_date, end_date, ...)
  - adherence_log    (already in audit trail, but extended here with schedule_id)
"""

import sqlite3
import json
import hashlib
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger("medguard.caregiver")

DB_PATH = Path(__file__).resolve().parent.parent / "medguard_audit.db"


def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_caregiver_tables():
    """Initialize all caregiver & scheduling tables."""
    conn = get_conn()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS patients (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                age         INTEGER,
                diagnosis   TEXT,
                phone       TEXT,
                pin_hash    TEXT,
                created_at  TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS caregivers (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                phone       TEXT,
                email       TEXT,
                relation    TEXT,
                created_at  TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS caregiver_links (
                id              TEXT PRIMARY KEY,
                patient_id      TEXT REFERENCES patients(id),
                caregiver_id    TEXT REFERENCES caregivers(id),
                access_level    TEXT DEFAULT 'READ',
                is_active       INTEGER DEFAULT 1,
                linked_at       TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS medication_schedules (
                id              TEXT PRIMARY KEY,
                patient_id      TEXT REFERENCES patients(id),
                drug_name       TEXT NOT NULL,
                generic_name    TEXT,
                dosage          TEXT,
                frequency       TEXT,
                times_per_day   INTEGER DEFAULT 1,
                dose_times      TEXT,
                start_date      TEXT,
                end_date        TEXT,
                duration_days   INTEGER,
                meal_timing     TEXT DEFAULT 'any',
                notes           TEXT,
                is_active       INTEGER DEFAULT 1,
                created_at      TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS dose_events (
                id              TEXT PRIMARY KEY,
                patient_id      TEXT REFERENCES patients(id),
                schedule_id     TEXT REFERENCES medication_schedules(id),
                drug_name       TEXT,
                scheduled_time  TEXT,
                actual_time     TEXT,
                status          TEXT,
                missed_reason   TEXT,
                created_at      TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS medication_risk_flags (
                id              TEXT PRIMARY KEY,
                prescription_id TEXT,
                patient_id      TEXT,
                raw_ocr_text    TEXT,
                drugs           TEXT,
                conditions      TEXT,
                interactions    TEXT,
                side_effects    TEXT,
                needs_review    INTEGER DEFAULT 0,
                max_severity    TEXT DEFAULT 'SAFE',
                disclaimer      TEXT,
                created_at      TEXT DEFAULT (datetime('now'))
            );
        """)
        conn.commit()
        logger.info("Caregiver and Risk Flag tables initialized")
    finally:
        conn.close()

    seed_demo_data()


def seed_demo_data():
    """Seeds rich demo data for Mrs. Sunita Kulkarni and caregiver Rahul if not already present."""
    conn = get_conn()
    try:
        existing = conn.execute("SELECT id FROM patients WHERE id='patient_mrs_kulkarni_01'").fetchone()
        if existing:
            return

        # 1. Create Patient
        conn.execute("""
            INSERT OR IGNORE INTO patients (id, name, age, diagnosis, phone)
            VALUES (?, ?, ?, ?, ?)
        """, ('patient_mrs_kulkarni_01', 'Mrs. Sunita Kulkarni', 68, 'Post-MI, Atrial Fibrillation, Type-2 Diabetes', '+91 98200 11223'))

        # 2. Create Caregiver
        conn.execute("""
            INSERT OR IGNORE INTO caregivers (id, name, phone, email, relation)
            VALUES (?, ?, ?, ?, ?)
        """, ('cg_rahul_01', 'Rahul Kulkarni', '+91 98201 23456', 'rahul.kulkarni@example.com', 'Son'))

        # 3. Link Caregiver
        conn.execute("""
            INSERT OR IGNORE INTO caregiver_links (id, patient_id, caregiver_id, access_level)
            VALUES (?, ?, ?, ?)
        """, ('link_01', 'patient_mrs_kulkarni_01', 'cg_rahul_01', 'FULL'))

        # 4. Medication Schedules
        schedules = [
            ('sched_warfarin', 'patient_mrs_kulkarni_01', 'Warfarin 5mg', 'Warfarin', '5mg', 'OD', 1, json.dumps(['20:00']), '2026-09-01', '2026-10-31', 60, 'After dinner', 'Critical anticoagulant - monitor INR'),
            ('sched_metformin', 'patient_mrs_kulkarni_01', 'Metformin 500mg', 'Metformin', '500mg', 'BD', 2, json.dumps(['08:00', '20:00']), '2026-09-01', '2026-10-31', 60, 'With meals', 'Take after food'),
            ('sched_atorvastatin', 'patient_mrs_kulkarni_01', 'Atorvastatin 40mg', 'Atorvastatin', '40mg', 'HS', 1, json.dumps(['22:00']), '2026-09-01', '2026-10-31', 60, 'Bedtime', 'Lipid lowering agent'),
            ('sched_aspirin', 'patient_mrs_kulkarni_01', 'Aspirin 75mg', 'Aspirin', '75mg', 'OD', 1, json.dumps(['08:00']), '2026-09-01', '2026-10-31', 60, 'After breakfast', 'Antiplatelet')
        ]
        for s in schedules:
            conn.execute("""
                INSERT OR IGNORE INTO medication_schedules 
                (id, patient_id, drug_name, generic_name, dosage, frequency, times_per_day, dose_times, start_date, end_date, duration_days, meal_timing, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, s)

        # 5. Seed past 20 days of realistic dose events
        base_date = datetime.now() - timedelta(days=20)
        import random
        random.seed(42)
        for d in range(21):
            day_str = (base_date + timedelta(days=d)).strftime("%Y-%m-%d")
            # For each schedule, log events
            # Warfarin
            miss_warfarin = (d in [7, 15])  # 2 missed doses
            conn.execute("""
                INSERT OR IGNORE INTO dose_events (id, patient_id, schedule_id, drug_name, scheduled_time, actual_time, status, missed_reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (f"dose_war_{d}", 'patient_mrs_kulkarni_01', 'sched_warfarin', 'Warfarin 5mg', f"{day_str}T20:00:00", f"{day_str}T20:15:00" if not miss_warfarin else None, "MISSED" if miss_warfarin else "TAKEN", "Patient forgot evening dose" if miss_warfarin else None))
            
            # Metformin 08:00
            conn.execute("""
                INSERT OR IGNORE INTO dose_events (id, patient_id, schedule_id, drug_name, scheduled_time, actual_time, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (f"dose_met_m_{d}", 'patient_mrs_kulkarni_01', 'sched_metformin', 'Metformin 500mg', f"{day_str}T08:00:00", f"{day_str}T08:10:00", "TAKEN"))

            # Metformin 20:00
            miss_met = (d == 12)
            conn.execute("""
                INSERT OR IGNORE INTO dose_events (id, patient_id, schedule_id, drug_name, scheduled_time, actual_time, status, missed_reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (f"dose_met_e_{d}", 'patient_mrs_kulkarni_01', 'sched_metformin', 'Metformin 500mg', f"{day_str}T20:00:00", f"{day_str}T20:05:00" if not miss_met else None, "MISSED" if miss_met else "TAKEN", "Out for dinner" if miss_met else None))

            # Atorvastatin 22:00
            conn.execute("""
                INSERT OR IGNORE INTO dose_events (id, patient_id, schedule_id, drug_name, scheduled_time, actual_time, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (f"dose_at_{d}", 'patient_mrs_kulkarni_01', 'sched_atorvastatin', 'Atorvastatin 40mg', f"{day_str}T22:00:00", f"{day_str}T22:05:00", "TAKEN"))

        conn.commit()
        logger.info("Demo patient, caregiver, schedules, and adherence events successfully seeded.")
    except Exception as e:
        logger.warning(f"Error seeding demo data: {e}")
    finally:
        conn.close()


def _uid():
    import uuid
    return str(uuid.uuid4())[:16]


# ── Patient CRUD ──────────────────────────────────────────────────────────────

def create_patient(name: str, age: int, diagnosis: str, phone: str = "") -> Dict:
    pid = _uid()
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO patients (id, name, age, diagnosis, phone) VALUES (?,?,?,?,?)",
            (pid, name, age, diagnosis, phone)
        )
        conn.commit()
        return {"id": pid, "name": name, "age": age}
    finally:
        conn.close()


def get_patient(patient_id: str) -> Optional[Dict]:
    conn = get_conn()
    try:
        row = conn.execute("SELECT * FROM patients WHERE id=?", (patient_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


# ── Caregiver CRUD ────────────────────────────────────────────────────────────

def create_caregiver(name: str, phone: str, relation: str, email: str = "") -> Dict:
    cid = _uid()
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO caregivers (id, name, phone, email, relation) VALUES (?,?,?,?,?)",
            (cid, name, phone, email, relation)
        )
        conn.commit()
        return {"id": cid, "name": name, "phone": phone, "relation": relation}
    finally:
        conn.close()


def link_caregiver(patient_id: str, caregiver_id: str, access_level: str = "READ") -> Dict:
    lid = _uid()
    conn = get_conn()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO caregiver_links (id, patient_id, caregiver_id, access_level) VALUES (?,?,?,?)",
            (lid, patient_id, caregiver_id, access_level)
        )
        conn.commit()
        return {"link_id": lid, "patient_id": patient_id, "caregiver_id": caregiver_id, "access_level": access_level}
    finally:
        conn.close()


def get_patient_caregivers(patient_id: str) -> List[Dict]:
    conn = get_conn()
    try:
        rows = conn.execute("""
            SELECT c.id, c.name, c.phone, c.relation, cl.access_level, cl.linked_at
            FROM caregivers c
            JOIN caregiver_links cl ON cl.caregiver_id = c.id
            WHERE cl.patient_id = ? AND cl.is_active = 1
        """, (patient_id,)).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_caregiver_patients(caregiver_id: str) -> List[Dict]:
    """Returns all patients this caregiver is authorized to monitor."""
    conn = get_conn()
    try:
        rows = conn.execute("""
            SELECT p.id, p.name, p.age, p.diagnosis, cl.access_level, cl.linked_at
            FROM patients p
            JOIN caregiver_links cl ON cl.patient_id = p.id
            WHERE cl.caregiver_id = ? AND cl.is_active = 1
        """, (caregiver_id,)).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


# ── Medication Schedule Engine ────────────────────────────────────────────────

FREQUENCY_MAP = {
    "OD": {"times_per_day": 1, "dose_times": ["08:00"]},
    "BD": {"times_per_day": 2, "dose_times": ["08:00", "20:00"]},
    "TDS": {"times_per_day": 3, "dose_times": ["08:00", "14:00", "20:00"]},
    "QID": {"times_per_day": 4, "dose_times": ["08:00", "12:00", "16:00", "20:00"]},
    "SOS": {"times_per_day": 0, "dose_times": []},
    "HS": {"times_per_day": 1, "dose_times": ["22:00"]},       # Bedtime
    "AC": {"times_per_day": 3, "dose_times": ["07:30", "13:30", "19:30"]},  # Before meals
    "PC": {"times_per_day": 3, "dose_times": ["09:00", "14:30", "21:00"]},  # After meals
}


def create_schedule(patient_id: str, drug_name: str, generic_name: str,
                    dosage: str, frequency: str, start_date: str = None,
                    duration_days: int = 30, meal_timing: str = "any", notes: str = "") -> Dict:
    sid = _uid()
    freq_info = FREQUENCY_MAP.get(frequency.upper(), FREQUENCY_MAP["OD"])
    
    start = start_date or datetime.now().strftime("%Y-%m-%d")
    end_dt = (datetime.strptime(start, "%Y-%m-%d") + timedelta(days=duration_days)).strftime("%Y-%m-%d")
    
    conn = get_conn()
    try:
        conn.execute("""
            INSERT INTO medication_schedules 
            (id, patient_id, drug_name, generic_name, dosage, frequency, 
             times_per_day, dose_times, start_date, end_date, duration_days, meal_timing, notes)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            sid, patient_id, drug_name, generic_name, dosage, frequency,
            freq_info["times_per_day"], json.dumps(freq_info["dose_times"]),
            start, end_dt, duration_days, meal_timing, notes
        ))
        conn.commit()
        return {
            "schedule_id": sid,
            "drug_name": drug_name,
            "frequency": frequency,
            "dose_times": freq_info["dose_times"],
            "start_date": start,
            "end_date": end_dt,
            "duration_days": duration_days
        }
    finally:
        conn.close()


def get_patient_schedules(patient_id: str) -> List[Dict]:
    conn = get_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM medication_schedules WHERE patient_id=? AND is_active=1 ORDER BY created_at DESC",
            (patient_id,)
        ).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            try:
                d["dose_times"] = json.loads(d.get("dose_times", "[]"))
            except Exception:
                d["dose_times"] = []
            result.append(d)
        return result
    finally:
        conn.close()


def get_todays_schedule(patient_id: str) -> List[Dict]:
    """Returns today's pending and completed doses."""
    today = datetime.now().strftime("%Y-%m-%d")
    schedules = get_patient_schedules(patient_id)
    
    conn = get_conn()
    try:
        today_events = conn.execute(
            "SELECT * FROM dose_events WHERE patient_id=? AND scheduled_time LIKE ?",
            (patient_id, f"{today}%")
        ).fetchall()
        taken_set = {e["schedule_id"] + e["scheduled_time"] for e in today_events if e["status"] == "TAKEN"}
    finally:
        conn.close()

    result = []
    for sched in schedules:
        # Only include active schedules covering today
        if sched.get("start_date", "0") <= today <= sched.get("end_date", "9"):
            for dose_time in sched.get("dose_times", []):
                scheduled_at = f"{today}T{dose_time}:00"
                result.append({
                    "schedule_id": sched["id"],
                    "drug_name": sched["drug_name"],
                    "dosage": sched["dosage"],
                    "scheduled_time": scheduled_at,
                    "meal_timing": sched["meal_timing"],
                    "status": "TAKEN" if (sched["id"] + scheduled_at) in taken_set else "PENDING"
                })
    return sorted(result, key=lambda x: x["scheduled_time"])


def log_dose_event(patient_id: str, schedule_id: str, drug_name: str,
                   scheduled_time: str, status: str, missed_reason: str = "") -> Dict:
    eid = _uid()
    actual_time = datetime.now().isoformat()
    conn = get_conn()
    try:
        conn.execute("""
            INSERT INTO dose_events (id, patient_id, schedule_id, drug_name, scheduled_time, actual_time, status, missed_reason)
            VALUES (?,?,?,?,?,?,?,?)
        """, (eid, patient_id, schedule_id, drug_name, scheduled_time, actual_time, status, missed_reason))
        conn.commit()
        return {"event_id": eid, "status": status, "logged_at": actual_time}
    finally:
        conn.close()


def get_adherence_summary(patient_id: str, days: int = 30) -> Dict:
    """Returns 30-day adherence heatmap data grouped by drug and date."""
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    conn = get_conn()
    try:
        events = conn.execute(
            "SELECT * FROM dose_events WHERE patient_id=? AND created_at >= ? ORDER BY scheduled_time",
            (patient_id, since)
        ).fetchall()

        by_date = {}
        taken_total, total = 0, 0
        for e in events:
            date_key = e["scheduled_time"][:10]
            if date_key not in by_date:
                by_date[date_key] = {"taken": 0, "missed": 0, "drugs": []}
            if e["status"] == "TAKEN":
                by_date[date_key]["taken"] += 1
                taken_total += 1
            else:
                by_date[date_key]["missed"] += 1
            by_date[date_key]["drugs"].append(e["drug_name"])
            total += 1

        return {
            "patient_id": patient_id,
            "days_analyzed": days,
            "total_doses": total,
            "taken": taken_total,
            "missed": total - taken_total,
            "adherence_rate": round((taken_total / total * 100) if total > 0 else 0, 1),
            "heatmap": by_date
        }
    finally:
        conn.close()


# ── Medication Risk Flags Persistence ──────────────────────────────────────────

def save_risk_flags(
    prescription_id: str,
    patient_id: str,
    raw_ocr_text: str,
    drugs: List[Dict],
    conditions: List[Dict],
    interactions: List[Dict],
    side_effects: List[Dict],
    needs_review: bool,
    max_severity: str = "SAFE",
    disclaimer: str = "AI-generated, not a substitute for professional medical advice."
) -> Dict[str, Any]:
    """Persists risk analysis results from risk_pipeline to medication_risk_flags table."""
    flag_id = f"flag_{_uid()}"
    conn = get_conn()
    try:
        conn.execute("""
            INSERT INTO medication_risk_flags (
                id, prescription_id, patient_id, raw_ocr_text, drugs,
                conditions, interactions, side_effects, needs_review,
                max_severity, disclaimer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            flag_id,
            prescription_id,
            patient_id,
            raw_ocr_text,
            json.dumps(drugs),
            json.dumps(conditions),
            json.dumps(interactions),
            json.dumps(side_effects),
            1 if needs_review else 0,
            max_severity,
            disclaimer
        ))
        conn.commit()
        return {"id": flag_id, "needs_review": needs_review, "max_severity": max_severity}
    finally:
        conn.close()


def get_risk_flags(patient_id: Optional[str] = None, limit: int = 10) -> List[Dict]:
    """Retrieves stored medication risk flags."""
    conn = get_conn()
    try:
        if patient_id:
            rows = conn.execute("""
                SELECT * FROM medication_risk_flags WHERE patient_id = ?
                ORDER BY created_at DESC LIMIT ?
            """, (patient_id, limit)).fetchall()
        else:
            rows = conn.execute("""
                SELECT * FROM medication_risk_flags
                ORDER BY created_at DESC LIMIT ?
            """, (limit,)).fetchall()

        results = []
        for r in rows:
            d = dict(r)
            d["drugs"] = json.loads(d.get("drugs") or "[]")
            d["conditions"] = json.loads(d.get("conditions") or "[]")
            d["interactions"] = json.loads(d.get("interactions") or "[]")
            d["side_effects"] = json.loads(d.get("side_effects") or "[]")
            d["needs_review"] = bool(d.get("needs_review", 0))
            results.append(d)
        return results
    finally:
        conn.close()

