# MedGuard AI / SAFE CAP⁺ — Production System Architecture Specification

## 1. System Overview & Core Capabilities
**MedGuard AI** is a regulatory-grade, neuro-symbolic clinical medication safety and adherence platform with 21 CFR Part 11 compliant audit logging, molecular cardiotoxicity screening, and real-time caregiver coordination.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Client Layer (Web / Mobile PWA)                   │
│   - Patient Portal (SAFE CAP⁺ Zero-Jargon UI)                           │
│   - Vernacular Audio (Marathi / Hindi / English TTS)                   │
│   - Caregiver Guardian Dashboard (Real-Time SSE Alert Banners)         │
│   - Optical Scanner (Tesseract.js WASM + Edge CV Preprocessing)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / WSS
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API Gateway & Security                          │
│   - Reverse Proxy (Nginx / Cloudflare)                                 │
│   - JWT / RBAC Authentication & Token Refresh Flow                    │
│   - Rate Limiting & OWASP Request Validation                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Core Backend Services                          │
│   - Auth & Session Service (JWT + Argon2id / bcrypt)                   │
│   - Patient & Schedule Manager (Caregiver-Patient relational graph)    │
│   - Neuro-Symbolic Multi-Drug Safety Engine:                           │
│       • Tier 1: Symbolic Knowledge Base (DDI, Contraindications)       │
│       • Tier 2: Molecular ML/GNN (hERG RF, Tox21, ClinTox, BBBP)      │
│       • Tier 3: Inductive 95% Conformal Confidence Intervals           │
│   - Vernacular TTS Dispatcher (gTTS / Neural Speech Engine)            │
│   - Real-Time Dispatcher (SSE + WebSocket Push Fallback)               │
│   - 21 CFR Part 11 Tamper-Evident Ledger (SHA-256 Hash Chaining, HMAC) │
└───────────────────────┬────────────────────────────┬───────────────────┘
                        │                            │
                        ▼                            ▼
┌─────────────────────────────────┐        ┌─────────────────────────────┐
│      Relational Storage         │        │    Fast Cache & Pub/Sub     │
│  - PostgreSQL 16 (Primary RDBMS)│        │  - Redis 7                  │
│  - SQLite WAL (Tamper-evident   │        │  - Session tokens & cache   │
│    append-only ledger replica)  │        │  - Pub/Sub for SSE alerts   │
└─────────────────────────────────┘        └─────────────────────────────┘
```

---

## 2. Database Architecture

### Primary RDBMS: PostgreSQL 16 (SQLAlchemy 2.0 ORM)
- `users`: Core identity table (patient, caregiver, clinician, admin).
- `patients`: Clinical profiles, age, medical conditions, emergency contacts, language preferences.
- `caregivers`: Contact details, relationship types, notification dispatch channels.
- `patient_caregiver_links`: Many-to-many relationship mapping access permissions and escalation tiers.
- `medication_schedules`: Rx schedules, drug generic and brand names, dosage, frequency, times of day, criticality score (HIGH/MEDIUM/LOW).
- `dose_events`: Timestamped adherence intake events (`SCHEDULED`, `TAKEN`, `MISSED`, `SNOOZED`), verification method (1-Click, QR scan, NFC).
- `safety_assessments`: Computed interaction scores, hERG cardiotoxicity probabilities, conformal prediction intervals, flagged drug pairs.
- `audit_records`: 21 CFR Part 11 immutable append-only ledger with sequential SHA-256 hash chaining and HMAC-SHA256 signatures.

### Fast Cache & Real-Time Bus: Redis 7
- Token blocklist & rate limit counters.
- Prescription analysis cache (keyed by sorted drug set hash to avoid redundant molecular forward passes).
- Pub/Sub channels (`caregiver:alerts:<patient_id>`) for real-time SSE dispatch across multiple backend worker processes.

---

## 3. Security, Authentication & 21 CFR Part 11 Compliance
1. **Authentication**: JWT access tokens (15-minute expiry) + secure HTTP-only refresh tokens (7 days). Passwords hashed using Argon2id/bcrypt.
2. **Role-Based Access Control (RBAC)**:
   - `PATIENT`: Read and update own dose logs, view assigned schedules, receive vernacular audio.
   - `CAREGIVER`: Real-time alerts for linked patients, adherence dashboard, medication calendar view.
   - `CLINICIAN`: Full prescription ingestion, safety analysis, override logs, audit trail inspections.
   - `ADMIN`: User management, system health telemetry.
3. **21 CFR Part 11 / ALCOA+ Data Integrity**:
   - Every state change writes an immutable audit record.
   - Database triggers forbid `UPDATE` and `DELETE` on the audit ledger.
   - Cryptographic continuity check: `Current_Record_Hash = SHA256(Prev_Record_Hash + Timestamp + EventType + Payload + UserID)`.

---

## 4. Multi-Tiered Safety Engine Integration
1. **Tier 1 (Symbolic Rules)**: Instant microsecond lookup of drug-drug interactions (CYP3A4/2C9 inhibition, anticoagulant-NSAID bleeding, pharmacodynamic clashes).
2. **Tier 2 (hERG & Toxicological ML)**:
   - Random Forest trained on 655 ChEMBL molecules predicting hERG potassium channel blockade (ROC-AUC 0.8627).
   - Dual-Stream GNNs evaluating Tox21 (12 cellular stress/nuclear receptor pathways), ClinTox (clinical trial toxicity), and BBBP.
3. **Tier 3 (Conformal Prediction)**:
   - Computes non-conformity scores and outputs calibrated 95% Confidence Intervals for provable safety bounds.

---

## 5. Deployment & Containerization (Docker + CI/CD)
- **Container Setup**:
  - `medguard-backend`: Python 3.11/3.12 Flask + Uvicorn/Gunicorn.
  - `medguard-frontend`: Vite React PWA served via Nginx.
  - `medguard-postgres`: PostgreSQL 16 Alpine with initialized schemas.
  - `medguard-redis`: Redis 7 Alpine for session cache and pub/sub.
- **CI/CD Pipeline** (`.github/workflows/ci.yml`):
  - Linting (`flake8` / `black` / `oxlint`).
  - Unit & Integration test suite (`test_risk_pipeline.py`, auth tests, DB audit tests).
  - Docker multi-stage build validation.
