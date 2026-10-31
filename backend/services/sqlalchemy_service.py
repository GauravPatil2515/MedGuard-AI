"""
MedGuard AI — SQLAlchemy Service Layer (Production)
====================================================
Replaces raw SQLite with SQLAlchemy 2.0 ORM for all data operations.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
import uuid
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from models.db_models import (
    Base, User, Patient, Caregiver, PatientCaregiverLink,
    MedicationSchedule, DoseEvent, SafetyAssessment, AuditRecord,
    UserRole, CriticalityLevel, DoseStatus, get_db_engine
)

def _uid() -> str:
    return str(uuid.uuid4())

# =============================================================================
# Database Session Management
# =============================================================================
_engine = None
_session_factory = None

def get_engine(db_url: Optional[str] = None):
    global _engine
    if _engine is None:
        _engine = get_db_engine(db_url)
    return _engine

def get_session(db_url: Optional[str] = None) -> Session:
    global _session_factory
    if _session_factory is None:
        engine = get_engine(db_url)
        from sqlalchemy.orm import sessionmaker
        _session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    return _session_factory()

def init_database(db_url: Optional[str] = None):
    """Initialize all tables using SQLAlchemy models."""
    engine = get_engine(db_url)
    Base.metadata.create_all(bind=engine)
    seed_demo_data_sqlalchemy()
    return engine

# =============================================================================
# User / Auth Operations
# =============================================================================

def create_user(
    email: str,
    password_hash: str,
    role: UserRole = UserRole.PATIENT,
    full_name: str = "",
    phone: str = ""
) -> User:
    session = get_session()
    try:
        user = User(
            id=_uid(),
            email=email,
            password_hash=password_hash,
            role=role,
            full_name=full_name or email.split("@")[0],
            phone=phone
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    finally:
        session.close()

def get_user_by_email(email: str) -> Optional[User]:
    session = get_session()
    try:
        return session.query(User).filter(User.email == email).first()
    finally:
        session.close()

def get_user_by_id(user_id: str) -> Optional[User]:
    session = get_session()
    try:
        return session.query(User).filter(User.id == user_id).first()
    finally:
        session.close()

# =============================================================================
# Patient Operations
# =============================================================================

def create_patient(
    name: str,
    age: Optional[int] = None,
    diagnosis: Optional[str] = None,
    phone: str = "",
    preferred_language: str = "mr",
    user_id: Optional[str] = None
) -> Patient:
    session = get_session()
    try:
        patient = Patient(
            id=_uid(),
            user_id=user_id,
            name=name,
            age=age,
            diagnosis=diagnosis,
            phone=phone,
            preferred_language=preferred_language
        )
        session.add(patient)
        session.commit()
        session.refresh(patient)
        return patient
    finally:
        session.close()

def get_patient(patient_id: str) -> Optional[Patient]:
    session = get_session()
    try:
        return session.query(Patient).filter(Patient.id == patient_id).first()
    finally:
        session.close()

def get_patients_for_caregiver(caregiver_id: str) -> List[Patient]:
    session = get_session()
    try:
        return session.query(Patient).join(PatientCaregiverLink).filter(
            PatientCaregiverLink.caregiver_id == caregiver_id
        ).all()
    finally:
        session.close()

# =============================================================================
# Caregiver Operations
# =============================================================================

def create_caregiver(
    name: str,
    phone: str = "",
    email: str = "",
    relation: str = "Family",
    user_id: Optional[str] = None
) -> Caregiver:
    session = get_session()
    try:
        caregiver = Caregiver(
            id=_uid(),
            user_id=user_id,
            name=name,
            phone=phone,
            email=email,
            relation=relation
        )
        session.add(caregiver)
        session.commit()
        session.refresh(caregiver)
        return caregiver
    finally:
        session.close()

def get_caregiver(caregiver_id: str) -> Optional[Caregiver]:
    session = get_session()
    try:
        return session.query(Caregiver).filter(Caregiver.id == caregiver_id).first()
    finally:
        session.close()

def link_caregiver(
    patient_id: str,
    caregiver_id: str,
    access_level: str = "FULL"
) -> PatientCaregiverLink:
    session = get_session()
    try:
        link = PatientCaregiverLink(
            id=_uid(),
            patient_id=patient_id,
            caregiver_id=caregiver_id,
            access_level=access_level
        )
        session.add(link)
        session.commit()
        session.refresh(link)
        return link
    finally:
        session.close()

def get_patient_caregivers(patient_id: str) -> List[Dict]:
    session = get_session()
    try:
        links = session.query(PatientCaregiverLink).options(
            joinedload(PatientCaregiverLink.caregiver)
        ).filter(PatientCaregiverLink.patient_id == patient_id).all()
        
        return [{
            "id": link.caregiver.id,
            "name": link.caregiver.name,
            "phone": link.caregiver.phone,
            "email": link.caregiver.email,
            "relation": link.caregiver.relation,
            "access_level": link.access_level,
            "linked_at": link.created_at.isoformat() if link.created_at else None
        } for link in links]
    finally:
        session.close()

def get_caregiver_patients(caregiver_id: str) -> List[Dict]:
    session = get_session()
    try:
        links = session.query(PatientCaregiverLink).options(
            joinedload(PatientCaregiverLink.patient)
        ).filter(PatientCaregiverLink.caregiver_id == caregiver_id).all()
        
        return [{
            "id": link.patient.id,
            "name": link.patient.name,
            "age": link.patient.age,
            "diagnosis": link.patient.diagnosis,
            "access_level": link.access_level,
            "linked_at": link.created_at.isoformat() if link.created_at else None
        } for link in links]
    finally:
        session.close()

# =============================================================================
# Medication Schedule Operations
# =============================================================================

FREQUENCY_MAP = {
    "OD": {"times_per_day": 1, "dose_times": ["08:00"]},
    "BD": {"times_per_day": 2, "dose_times": ["08:00", "20:00"]},
    "TDS": {"times_per_day": 3, "dose_times": ["08:00", "14:00", "20:00"]},
    "QID": {"times_per_day": 4, "dose_times": ["08:00", "12:00", "16:00", "20:00"]},
    "SOS": {"times_per_day": 0, "dose_times": []},
    "HS": {"times_per_day": 1, "dose_times": ["22:00"]},
    "AC": {"times_per_day": 3, "dose_times": ["07:30", "13:30", "19:30"]},
    "PC": {"times_per_day": 3, "dose_times": ["09:00", "14:30", "21:00"]},
}

def create_schedule(
    patient_id: str,
    drug_name: str,
    generic_name: Optional[str] = None,
    dosage: str = "1 tab",
    frequency: str = "OD",
    start_date: Optional[str] = None,
    duration_days: int = 30,
    meal_timing: str = "AFTER_FOOD",
    notes: str = "",
    criticality: CriticalityLevel = CriticalityLevel.MEDIUM
) -> Dict:
    session = get_session()
    try:
        freq_info = FREQUENCY_MAP.get(frequency.upper(), FREQUENCY_MAP["OD"])
        start = start_date or datetime.now().strftime("%Y-%m-%d")
        end_dt = (datetime.strptime(start, "%Y-%m-%d") + timedelta(days=duration_days)).strftime("%Y-%m-%d")
        
        schedule = MedicationSchedule(
            id=_uid(),
            patient_id=patient_id,
            brand_name=drug_name,
            generic_name=generic_name,
            dose=dosage,
            frequency=frequency,
            scheduled_times=json.dumps(freq_info["dose_times"]),
            criticality=criticality,
            food_instruction=meal_timing,
            remaining_pills=30,
            is_active=True
        )
        session.add(schedule)
        session.commit()
        
        # Return as dict to avoid serialization issues
        return {
            "schedule_id": schedule.id,
            "drug_name": schedule.brand_name,
            "generic_name": schedule.generic_name,
            "dosage": schedule.dose,
            "frequency": schedule.frequency,
            "dose_times": freq_info["dose_times"],
            "start_date": start,
            "end_date": end_dt,
            "duration_days": duration_days
        }
    finally:
        session.close()

def get_patient_schedules(patient_id: str) -> List[MedicationSchedule]:
    session = get_session()
    try:
        return session.query(MedicationSchedule).filter(
            MedicationSchedule.patient_id == patient_id,
            MedicationSchedule.is_active == True
        ).order_by(MedicationSchedule.created_at.desc()).all()
    finally:
        session.close()

def get_todays_schedule(patient_id: str) -> List[Dict]:
    session = get_session()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        schedules = session.query(MedicationSchedule).filter(
            MedicationSchedule.patient_id == patient_id,
            MedicationSchedule.is_active == True
        ).all()
        
        # Get today's dose events
        dose_events = session.query(DoseEvent).filter(
            DoseEvent.patient_id == patient_id,
            DoseEvent.scheduled_time.like(f"{today}%")
        ).all()
        
        taken_set = {f"{e.schedule_id}_{e.scheduled_time}" for e in dose_events if e.status == DoseStatus.TAKEN}
        
        result = []
        for sched in schedules:
            if sched.start_date and sched.end_date:
                if not (sched.start_date <= today <= sched.end_date):
                    continue
            dose_times = json.loads(sched.scheduled_times or "[]")
            for dose_time in dose_times:
                scheduled_at = f"{today}T{dose_time}:00"
                key = f"{sched.id}_{scheduled_at}"
                result.append({
                    "schedule_id": sched.id,
                    "drug_name": sched.brand_name,
                    "dosage": sched.dose,
                    "scheduled_time": scheduled_at,
                    "meal_timing": sched.food_instruction,
                    "criticality": sched.criticality.value,
                    "status": DoseStatus.TAKEN.value if key in taken_set else DoseStatus.PENDING.value
                })
        return sorted(result, key=lambda x: x["scheduled_time"])
    finally:
        session.close()

# =============================================================================
# Dose Event Operations
# =============================================================================

def log_dose_event(
    patient_id: str,
    schedule_id: str,
    drug_name: str,
    scheduled_time: str,
    status: DoseStatus,
    verification_method: str = "ONE_CLICK",
    notes: Optional[str] = None
) -> DoseEvent:
    session = get_session()
    try:
        event = DoseEvent(
            id=_uid(),
            schedule_id=schedule_id,
            patient_id=patient_id,
            scheduled_time=scheduled_time,
            recorded_at=datetime.now(),
            status=status,
            verification_method=verification_method,
            notes=notes
        )
        session.add(event)
        session.commit()
        session.refresh(event)
        return event
    finally:
        session.close()

def get_adherence_summary(patient_id: str, days: int = 30) -> Dict:
    session = get_session()
    try:
        since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        events = session.query(DoseEvent).filter(
            DoseEvent.patient_id == patient_id,
            DoseEvent.scheduled_time >= since
        ).order_by(DoseEvent.scheduled_time).all()
        
        by_date = {}
        taken_total = total = 0
        for e in events:
            date_key = e.scheduled_time[:10]
            if date_key not in by_date:
                by_date[date_key] = {"taken": 0, "missed": 0, "drugs": []}
            if e.status == DoseStatus.TAKEN:
                by_date[date_key]["taken"] += 1
                taken_total += 1
            else:
                by_date[date_key]["missed"] += 1
            by_date[date_key]["drugs"].append(e.schedule.brand_name if e.schedule else "Unknown")
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
        session.close()

# =============================================================================
# Safety Assessment Operations
# =============================================================================

def save_safety_assessment(
    patient_id: str,
    drugs_analyzed: List[str],
    overall_status: str,
    interaction_count: int,
    herg_cardiotox_prob: Optional[float],
    conformal_lower: Optional[float],
    conformal_upper: Optional[float],
    details: Dict
) -> SafetyAssessment:
    session = get_session()
    try:
        assessment = SafetyAssessment(
            id=_uid(),
            patient_id=patient_id,
            drugs_analyzed=json.dumps(drugs_analyzed),
            overall_status=overall_status,
            interaction_count=interaction_count,
            herg_cardiotox_prob=herg_cardiotox_prob,
            conformal_lower_bound=conformal_lower,
            conformal_upper_bound=conformal_upper,
            details=json.dumps(details)
        )
        session.add(assessment)
        session.commit()
        session.refresh(assessment)
        return assessment
    finally:
        session.close()

def get_patient_safety_assessments(patient_id: str, limit: int = 10) -> List[SafetyAssessment]:
    session = get_session()
    try:
        return session.query(SafetyAssessment).filter(
            SafetyAssessment.patient_id == patient_id
        ).order_by(SafetyAssessment.created_at.desc()).limit(limit).all()
    finally:
        session.close()

# =============================================================================
# Audit Record Operations (21 CFR Part 11)
# =============================================================================

def log_audit_event(
    event_type: str,
    user_id: str,
    action_data: Dict,
    patient_id: Optional[str] = None
) -> AuditRecord:
    session = get_session()
    try:
        # Get previous record's hash
        last_record = session.query(AuditRecord).order_by(AuditRecord.id.desc()).first()
        prev_hash = last_record.record_hash if last_record else "0" * 64
        
        # Create hash chain
        import hashlib
        import hmac
        timestamp = datetime.now().isoformat()
        payload = f"{prev_hash}{timestamp}{event_type}{json.dumps(action_data, sort_keys=True)}{user_id}"
        record_hash = hashlib.sha256(payload.encode()).hexdigest()
        
        # HMAC signature
        audit_secret = os.getenv("PHARMAGUARD_AUDIT_SECRET", "audit_secret_key_2026")
        signature = hmac.new(audit_secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        
        record = AuditRecord(
            record_id=_uid(),
            timestamp=timestamp,
            event_type=event_type,
            user_id=user_id,
            patient_id=patient_id,
            action_data=json.dumps(action_data),
            prev_hash=prev_hash,
            record_hash=record_hash,
            signature=signature
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        return record
    finally:
        session.close()

def get_audit_trail(limit: int = 50) -> Dict:
    session = get_session()
    try:
        records = session.query(AuditRecord).order_by(AuditRecord.id.desc()).limit(limit).all()
        total = session.query(func.count(AuditRecord.id)).scalar()
        
        return {
            "total_records": total,
            "genesis_hash": "0" * 64,
            "records": [{
                "id": r.id,
                "record_id": r.record_id,
                "timestamp": r.timestamp,
                "event_type": r.event_type,
                "user_id": r.user_id,
                "patient_id": r.patient_id,
                "action_data": json.loads(r.action_data) if r.action_data else {},
                "prev_hash": r.prev_hash,
                "record_hash": r.record_hash,
                "signature": r.signature
            } for r in records]
        }
    finally:
        session.close()

# =============================================================================
# Demo Data Seeding
# =============================================================================

def seed_demo_data_sqlalchemy():
    """Seed demo patient and caregiver if not present."""
    session = get_session()
    try:
        # Check if demo patient exists
        existing = session.query(Patient).filter(Patient.id == "patient_mrs_kulkarni_01").first()
        if existing:
            return
        
        # Create demo patient
        patient = Patient(
            id="patient_mrs_kulkarni_01",
            name="Ms. Atharva",
            age=68,
            diagnosis="Post-MI, Atrial Fibrillation, Type-2 Diabetes",
            phone="+91 98200 11223",
            preferred_language="mr"
        )
        session.add(patient)
        
        # Create demo caregiver
        caregiver = Caregiver(
            id="cg_rahul_01",
            name="Rahul Kulkarni",
            phone="+91 98201 23456",
            email="rahul.kulkarni@example.com",
            relation="Son"
        )
        session.add(caregiver)
        
        # Link caregiver
        link = PatientCaregiverLink(
            id="link_01",
            patient_id="patient_mrs_kulkarni_01",
            caregiver_id="cg_rahul_01",
            access_level="FULL"
        )
        session.add(link)
        
        # Create medication schedules
        schedules_data = [
            ("sched_warfarin", "Warfarin 5mg", "Warfarin", "5mg", "OD", ["20:00"], CriticalityLevel.HIGH, "AFTER_FOOD"),
            ("sched_metformin", "Metformin 500mg", "Metformin", "500mg", "BD", ["08:00", "20:00"], CriticalityLevel.HIGH, "WITH_MEALS"),
            ("sched_atorvastatin", "Atorvastatin 40mg", "Atorvastatin", "40mg", "HS", ["22:00"], CriticalityLevel.MEDIUM, "BEFORE_BED"),
            ("sched_aspirin", "Aspirin 75mg", "Aspirin", "75mg", "OD", ["08:00"], CriticalityLevel.HIGH, "AFTER_BREAKFAST"),
        ]
        
        for sid, brand, generic, dose, freq, times, crit, meal in schedules_data:
            freq_info = FREQUENCY_MAP.get(freq, FREQUENCY_MAP["OD"])
            schedule = MedicationSchedule(
                id=sid,
                patient_id="patient_mrs_kulkarni_01",
                brand_name=brand,
                generic_name=generic,
                dose=dose,
                frequency=freq,
                scheduled_times=times,
                criticality=crit,
                food_instruction=meal,
                remaining_pills=30,
                is_active=True
            )

            session.add(schedule)
        
        session.commit()
        print("Demo data seeded successfully")
    except Exception as e:
        session.rollback()
        print(f"Error seeding demo data: {e}")
    finally:
        session.close()

# =============================================================================
# Import os at top
# =============================================================================
import os