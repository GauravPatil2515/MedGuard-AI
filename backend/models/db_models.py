"""
MedGuard AI — Production Database Schema Models (SQLAlchemy 2.0)
===============================================================
PostgreSQL-ready schemas with SQLite backward compatibility.
Models:
- User (Auth & RBAC)
- Patient (Clinical Demographics)
- Caregiver (Guardian profiles)
- PatientCaregiverLink (Relationship & alert routing)
- MedicationSchedule (Dose times & Criticality)
- DoseEvent (Adherence verification)
- SafetyAssessment (DDI + hERG ML results)
- AuditRecord (21 CFR Part 11 append-only ledger)
"""

import os
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey,
    Text, Enum as SQLEnum, Index, JSON, create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()


class UserRole(str, Enum):
    PATIENT = "PATIENT"
    CAREGIVER = "CAREGIVER"
    CLINICIAN = "CLINICIAN"
    ADMIN = "ADMIN"


class CriticalityLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class DoseStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    TAKEN = "TAKEN"
    MISSED = "MISSED"
    SNOOZED = "SNOOZED"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.PATIENT)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")
    caregiver_profile = relationship("Caregiver", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=True)
    name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=True)
    diagnosis = Column(Text, nullable=True)
    phone = Column(String(30), nullable=True)
    preferred_language = Column(String(10), default="mr")  # "mr", "hi", "en"
    emergency_contact = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    caregiver_links = relationship("PatientCaregiverLink", back_populates="patient", cascade="all, delete-orphan")
    schedules = relationship("MedicationSchedule", back_populates="patient", cascade="all, delete-orphan")
    safety_assessments = relationship("SafetyAssessment", back_populates="patient", cascade="all, delete-orphan")


class Caregiver(Base):
    __tablename__ = "caregivers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    relation = Column(String(50), nullable=True)  # "Son", "Daughter", "Nurse", etc.
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="caregiver_profile")
    patient_links = relationship("PatientCaregiverLink", back_populates="caregiver", cascade="all, delete-orphan")


class PatientCaregiverLink(Base):
    __tablename__ = "patient_caregiver_links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    caregiver_id = Column(String(36), ForeignKey("caregivers.id"), nullable=False, index=True)
    access_level = Column(String(20), default="FULL")  # "FULL", "READ_ONLY", "EMERGENCY_ONLY"
    alert_on_missed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient = relationship("Patient", back_populates="caregiver_links")
    caregiver = relationship("Caregiver", back_populates="patient_links")


class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    brand_name = Column(String(150), nullable=False)
    generic_name = Column(String(150), nullable=True)
    smiles = Column(Text, nullable=True)
    dose = Column(String(50), nullable=False)  # e.g., "75mg", "1 tablet"
    frequency = Column(String(50), nullable=False)  # "OD", "BD", "TDS", "QID"
    scheduled_times = Column(JSON, nullable=False)  # e.g. ["08:00", "20:00"]
    criticality = Column(SQLEnum(CriticalityLevel), default=CriticalityLevel.MEDIUM, index=True)
    food_instruction = Column(String(100), default="AFTER_FOOD")
    remaining_pills = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient = relationship("Patient", back_populates="schedules")
    dose_events = relationship("DoseEvent", back_populates="schedule", cascade="all, delete-orphan")


class DoseEvent(Base):
    __tablename__ = "dose_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    schedule_id = Column(String(36), ForeignKey("medication_schedules.id"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    scheduled_time = Column(String(30), nullable=False)  # ISO string or "YYYY-MM-DD HH:MM"
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(SQLEnum(DoseStatus), default=DoseStatus.SCHEDULED, index=True)
    verification_method = Column(String(50), default="ONE_CLICK")  # "ONE_CLICK", "QR_CODE", "VOICE"
    notes = Column(Text, nullable=True)

    # Relationships
    schedule = relationship("MedicationSchedule", back_populates="dose_events")


class SafetyAssessment(Base):
    __tablename__ = "safety_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=True, index=True)
    drugs_analyzed = Column(JSON, nullable=False)  # list of drug names
    overall_status = Column(String(20), nullable=False)  # "SAFE", "WARNING", "CRITICAL"
    interaction_count = Column(Integer, default=0)
    herg_cardiotox_prob = Column(Float, nullable=True)
    conformal_lower_bound = Column(Float, nullable=True)
    conformal_upper_bound = Column(Float, nullable=True)
    details = Column(JSON, nullable=False)  # Full interaction & GNN output payload
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    patient = relationship("Patient", back_populates="safety_assessments")


class AuditRecord(Base):
    """21 CFR Part 11 Append-Only Hash-Chained Regulatory Audit Ledger"""
    __tablename__ = "audit_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()), index=True)
    timestamp = Column(String(35), nullable=False)  # ISO 8601 UTC
    event_type = Column(String(100), nullable=False, index=True)
    user_id = Column(String(100), nullable=False)
    patient_id = Column(String(36), nullable=True)
    action_data = Column(Text, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    record_hash = Column(String(64), nullable=False)
    signature = Column(String(64), nullable=False)  # HMAC-SHA256 signature


def get_db_engine(db_url: Optional[str] = None):
    url = db_url or os.getenv("DATABASE_URL", "sqlite:///medguard_audit.db")
    return create_engine(url, echo=False)


def init_db(engine=None):
    if engine is None:
        engine = get_db_engine()
    Base.metadata.create_all(bind=engine)
    return engine
