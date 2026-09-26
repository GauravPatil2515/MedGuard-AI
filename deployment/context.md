# MedGuard AI — Comprehensive System & Pitch Context (for PPT Generation)

> **Document Purpose**: This document provides an exhaustive, presentation-ready overview of **MedGuard AI** — including problem statement, core clinical workflow, offline on-device machine learning architecture, technical specifications, UI/UX design language, and slide-by-slide presentation outlines for hackathon, investor, and clinical stakeholder decks.

---

## 1. Executive Summary

- **Product Name**: MedGuard AI
- **Tagline**: The Privacy-First, In-Browser Clinical Medication Safety & DDI Prevention Copilot
- **Core Value Proposition**: Prevents fatal drug-drug interactions (DDIs) and adherence failures for polypharmacy patients by running 100% of OCR, Named Entity Recognition (NER), molecular toxicity models, and conversational clinical reasoning **directly in the user's web browser** — ensuring zero patient health information (PHI) ever leaves the device.
- **Target Audience**:
  - Elderly polypharmacy patients and their family caregivers.
  - Physicians and cardiologists needing rapid (<60s) intake verification.
  - Hospital IT and compliance officers requiring strict HIPAA and 21 CFR Part 11 data privacy.

---

## 2. The Clinical Problem & Market Need

### 2.1 The Silent Crisis of Polypharmacy
- **Adverse Drug Events (ADEs)**: Over 1.3 million emergency department visits and 100,000+ deaths annually in the United States alone are attributable to adverse drug events.
- **Drug-Drug Interactions (DDIs)**: Patients managing multiple chronic conditions (e.g., Atrial Fibrillation, Hypertension, Diabetes, Chronic Pain) are often prescribed 5 to 10+ concurrent medications by different specialists who lack unified visibility.
- **The "Over-the-Counter" Hazard**: A patient on Warfarin taking an everyday OTC analgesic like Combiflam (Ibuprofen + Paracetamol) faces a 300% to 500% surge in major gastrointestinal bleeding risk within 48 hours.

### 2.2 The Healthcare Privacy Paradox
- Modern AI solutions (e.g., generic ChatGPT wrappers or cloud OCR APIs) require transmitting unredacted prescription images, patient names, and medical diagnoses to third-party cloud servers.
- **Regulatory Barriers**: Hospitals and compliance officers reject tools that leak PHI to remote LLM endpoints.
- **Offline Reliability**: Patients in rural clinics or areas with intermittent internet connectivity cannot rely on server-dependent AI tools during medical emergencies.

---

## 3. The MedGuard Solution: 100% On-Device Offline Intelligence

MedGuard AI flips the conventional cloud architecture upside down:
- **Zero-Server Patient Processing**: Prescription images, extracted medications, dosages, and interaction triage run entirely client-side using WebAssembly (WASM SIMD) and WebGPU.
- **Local Cryptographic Vault**: All patient data is encrypted at rest using AES-GCM (256-bit) via the browser's native Web Crypto API and persisted in IndexedDB.
- **Backend Role**: Restricted solely to session authentication and opaque, non-PII caregiver emergency push alerts (e.g. "Critical risk flagged for review").

---

## 4. Multi-Modal On-Device AI/ML Pipeline

MedGuard integrates **5 specialized inference-only models** running locally inside the browser after an automated, non-blocking one-time cache download (~700MB):

| Model Component | Model Architecture / Source | Device Target | Role in Workflow |
| :--- | :--- | :--- | :--- |
| **1. Handwritten OCR** | `microsoft/trocr-base-handwritten` (TrOCR-Small ONNX) | WASM SIMD / WebGPU | Transcribes messy, handwritten doctor prescriptions and doctor notes directly from camera photos or image files. |
| **2. Drug NER** | `OpenMed-NER-PharmaDetect-SuperMedical-125M` | ONNX / Transformers.js | Detects and extracts pharmaceutical active ingredients, brand names, and dosages (e.g., Warfarin 5mg, Amiodarone 200mg). |
| **3. Disease NER** | `OpenMed-NER-DiseaseDetect-BioMed-335M` | ONNX / Transformers.js | Identifies underlying clinical conditions, contraindications, and comorbidity tags from doctor notes. |
| **4. DDI Classifier** | `bprimal/Drug-Drug-Interaction` (CatBoost ONNX) | ONNX Runtime Web | Performs pairwise pharmacokinetic and pharmacodynamic clash evaluation across all concurrent active treatments. |
| **5. Clinical Copilot** | `onnx-community/Qwen2.5-0.5B-Instruct` (q4 quantized) | WebGPU (WASM fallback) | On-device offline conversational assistant scoped strictly to explaining active drug safety, food clashes, and flagged risks. |

### Supplementary Molecular Toxicity Models (Edge-Exported)
- **hERG Cardiotoxicity Engine**: Graph Isomorphism Network (GIN) & Dual-Stream GSAT evaluating molecular graph SMILES for sudden cardiac death and QT prolongation liability.
- **Conformal Predictor**: Calibrated 95% conformal confidence bounds `[lower, upper]` guaranteeing rigorous error bounds on risk output rather than overconfident point estimates.

---

## 5. The One Core Workflow

The user experience is consolidated into a single, seamless 7-step path:

```
[1. Auth Gate]
      │
[2. Scan Prescription] ──► On-Device TrOCR & PharmaNER
      │
[3. Confirm & Edit]    ──► User verifies Drug, Dosage, Frequency, Duration (flags OCR <75%)
      │
[4. Assign Schedule]   ──► Times of day, days of week, doctor name ──► Creates "Treatment"
      │
[5. Automatic DDI]     ──► Pools ALL active treatments ──► CatBoost pairwise check ──► Generates "RiskEvent"
      │
[6. Home Dashboard]    ──► Surfaces EXACTLY ONE dominant Risk Card (no risk = no card, zero noise)
                           + 1-Tap Daily Dosing (Take / Missed updates aggregated adherence)
      │
[7. Doctor Share]      ──► 1-Minute Structured Clinical Summary (PDF Export + 24h Expiring Link)
```

---

## 6. Single Unified Data Model: `PatientRecord`

All user state is managed in a single encrypted schema:

```typescript
interface PatientRecord {
  patientId: string;
  treatments: Treatment[];          // Both active and past treatments in one array
  riskEvents: RiskEvent[];          // Immutable pairwise interaction events with deduplication
  adherenceSummary: {               // Aggregated compliance metrics (no raw giant logs)
    treatmentId: string;
    drugName: string;
    percentTaken: number;
    totalScheduled: number;
    dosesTaken: number;
    dosesMissed: number;
    currentStreak: number;
    lastMissed: string | null;
  }[];
  todayDoses: {                     // 1-tap daily schedule checklist
    id: string;
    treatmentId: string;
    drugName: string;
    dosage: string;
    scheduledTime: string;
    timing: string;
    status: 'PENDING' | 'TAKEN' | 'MISSED';
    criticality: 'HIGH' | 'MEDIUM';
  }[];
}

interface Treatment {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  timesOfDay: string[];
  days: string[];
  startDate: string;
  endDate: string | null;
  condition: string | null;
  prescribingDoctor: string | null;
  status: 'active' | 'completed' | 'stopped';
  sourceOcrConfidence: number;      // Flags low-confidence scans (<0.75) for manual check
  createdAt: string;
}

interface RiskEvent {
  id: string;
  treatmentIdsInvolved: string[];
  drugPair: [string, string];
  severity: 'Major' | 'Moderate' | 'Minor';
  description: string;
  dateRaised: string;
  status: 'unresolved' | 'acknowledged' | 'resolved';
}
```

---

## 7. The 5 Top-Level Navigation Screens

The entire user interface is strictly constrained to 5 clinical screens built on the **Clinical Design System (CDS)** (neutral slate base, single navy accent, strict semantic red/amber/green triage):

### Screen 1: Home
- **Today's Medication Schedule**: Displays what to take now and next with drug name, strength, scheduled time, and criticality flags.
- **1-Tap Actions**: Single-tap "Take" and "Missed" logging that immediately updates both the daily checklist and the aggregated adherence rate.
- **Single Dominant Risk Card**: If any unresolved risk exists across the patient's active treatments, displays **exactly one** high-priority risk card with plain-language explanation and immediate action ("Acknowledge" or "Contact Doctor"). If no risk exists: **no card, zero noise**.
- **Auto-Download Status Indicator**: Displays background cache progress for on-device models.

### Screen 2: Scan
- **Capture / Paste**: Uploads a photo of handwritten doctor prescription or pastes transcribed clinical text.
- **Entity Confirmation Screen**: Automatically parses medicine name, dosage, frequency, and duration. Warns if OCR confidence is low (<75%).
- **Schedule Configuration**: Assigns times of day, start/end dates, condition, and prescribing doctor.
- **Automated Safety Trigger**: Saving the treatment instantly pools all currently active treatments, evaluates pairwise DDI compatibility, and routes directly to Home.

### Screen 3: Patient Record
- **3-Section Consolidated EHR View**:
  1. *Active Treatments*: Current medications, schedules, prescribers, with a 1-click "Discontinue / Complete" action.
  2. *Past Treatments*: Historical completed and stopped medications.
  3. *Pairwise Risk History*: Every interaction flag ever detected, severity, date raised, and resolution status.
  4. *Adherence Summary*: Aggregated cards showing % compliance, streak, and last missed date (no giant unreadable logs).
- **Scoped Clinical Assistant**: Embedded Qwen2.5-0.5B assistant scoped strictly to answering questions about active treatments, food clashes, and flagged risks, refusing off-topic banter.

### Screen 4: Share (Physician Summary)
- Formatted specifically for a doctor to review in **under 60 seconds**:
  - Section 1 — Active Treatments (medication, dosage, schedule, since date, prescriber).
  - Section 2 — Past Treatments (medication, dosage, duration, status).
  - Section 3 — Drug-Drug Interaction History (pair, severity, clinical notes, status).
  - Section 4 — Adherence Summary (per treatment: % taken, streak, last missed date).
- **Export Capabilities**:
  - Native print & PDF export with print CSS hiding all navigation chrome.
  - Shareable read-only link with 24-hour expiry simulation.

### Screen 5: Settings
- Auth session and subscription gate status.
- Real-time on-device model status (TrOCR, NER, CatBoost, Qwen2.5, WebGPU/WASM runtime).
- AES-GCM local storage encryption controls and factory cache reset button.

---

## 8. Technical Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER / CLIENT                          │
│                                                                        │
│   React 19 + Vite 8 (Clinical Design System - CSS Variables & Inter)   │
│   ├── Navigation: Home │ Scan │ Patient Record │ Share │ Settings      │
│   ├── Domain Store: patientRecordStore.js                             │
│   └── Local Vault: Web Crypto API (AES-GCM-256) + IndexedDB           │
│                                                                        │
│   ON-DEVICE LOCAL INFERENCE RUNTIME (Transformers.js + ONNX Web)       │
│   ├── Qwen2.5-0.5B-Instruct (q4, WebGPU / WASM SIMD)                   │
│   ├── TrOCR-Small Handwritten OCR (ONNX)                               │
│   ├── OpenMed PharmaNER 125M (ONNX Token Classification)               │
│   └── CatBoost DDI Pairwise Classifier (ONNX InferenceSession)         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (HTTPS / Opaque SSE Events Only)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER (FASTAPI)                        │
│                                                                        │
│   ├── Authentication & Session Gate                                   │
│   ├── Real-Time Server-Sent Events (SSE) Telemetry Dispatcher          │
│   ├── Emergency SMS / Twilio Proxy (Dispatches Non-PII Alerts)         │
│   └── SQLite Immutable 21 CFR Part 11 Audit Trail                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Presentation Deck Outline (10-Slide Structure for PPT)

### Slide 1: Title & Hook
- **Title**: MedGuard AI
- **Subtitle**: In-Browser, Privacy-First Medication Safety & DDI Prevention Copilot
- **Presenter Details**: Project MedGuard Team
- **Key Visual**: Product mockup showing clean Clinical Design System dashboard on desktop & mobile with "100% On-Device" shield badge.

### Slide 2: The Problem — The Deadly Cost of Polypharmacy
- 1.3M+ hospital visits and 100k+ deaths per year from adverse drug events.
- Elderly patients taking 5–10 concurrent prescriptions from separate doctors.
- Patients unknowingly combining OTC drugs (e.g., Combiflam/Ibuprofen) with narrow-therapeutic-index drugs (Warfarin), causing severe internal hemorrhaging.

### Slide 3: The Privacy Barrier in Digital Health
- Traditional AI requires uploading unredacted prescription scans to cloud LLMs (OpenAI/Anthropic).
- Violates patient trust, hospital compliance, and international health privacy laws (HIPAA/GDPR).
- Clinics need an AI that works **offline, on-device, with zero server transmission**.

### Slide 4: MedGuard AI Core Innovation
- **100% Client-Side Intelligence**: AI inference runs entirely inside browser memory via WebAssembly SIMD and WebGPU.
- **Client-Side AES-GCM Encryption**: Data is stored encrypted in the browser vault (IndexedDB); the backend never sees medication names.
- **Auto-Download & Caching**: Models download automatically on launch and persist forever in CacheStorage for instant offline use.

### Slide 5: The 5-Model Multi-Modal Architecture
- **TrOCR-Small**: Deciphers doctor handwriting from camera images.
- **PharmaNER (125M)**: Extracts active drugs and dosage strength.
- **DiseaseNER (335M)**: Identifies diagnosed conditions and organ contraindications.
- **CatBoost DDI (ONNX)**: Evaluates pairwise interaction matrices.
- **Qwen2.5-0.5B-Instruct**: Provides conversational explanations tailored strictly to the user's active regimen.

### Slide 6: The 1-Core-Workflow Walkthrough
- Step-by-step visual diagram: Scan → Verify OCR → Assign Schedule → Automatic Cross-Treatment DDI Check → 1-Tap Daily Dosing → Share.
- Highlight the **Single Dominant Risk Card** on Home: no risk = clean quiet interface; critical clash = unmistakable semantic alert.

### Slide 7: Safety-Critical Cross-Treatment Risk Engine
- Triggered whenever a treatment is created or changed.
- Cross-references **all active medications** in the patient's regimen.
- Deduplicates past alerts, updates risk severity, and notifies linked caregivers via opaque background events.

### Slide 8: The 60-Second Doctor Share Report
- Screen capture of the printable clinical summary.
- 4 clear sections: Active Treatments, Past Treatments, Risk History, 30-Day Adherence Rate.
- Export options: 1-click printable PDF and 24-hour expiring read-only link.

### Slide 9: Technical Milestones & Performance
- **Model Download Size**: Quantized to ~700MB total across all 5 models.
- **Inference Latency**: Under 450ms for pairwise DDI classification on consumer laptops.
- **Zero Server Cost Scaling**: Model execution offloads to user hardware, minimizing backend infrastructure overhead.

### Slide 10: Vision & Roadmap
- Integration with regional EHR standards (FHIR / HL7).
- Offline voice interactions for elderly patients with visual impairments.
- Pilot trials with outpatient cardiology and oncology clinics.
- Call to Action: "Transforming prescription safety into a zero-leakage, clinical-grade patient guardian."

---

## 10. Key Vocabulary & Pitch Keywords
- **Polypharmacy**: Concurrent use of 5 or more medications by a single patient.
- **Pharmacovigilance**: Science and activities relating to the detection and prevention of adverse drug effects.
- **DDI (Drug-Drug Interaction)**: Alteration of the action of one drug by the concurrent administration of another.
- **On-Device Inference**: Executing deep learning models locally on client hardware without sending inputs to a server.
- **WebAssembly (WASM SIMD)**: Binary instruction format enabling near-native CPU speeds in modern web browsers.
- **WebGPU**: Next-generation web standard for high-performance hardware-accelerated graphics and compute.
- **Conformal Prediction**: Mathematically rigorous framework providing finite-sample confidence intervals for ML models.
- **21 CFR Part 11**: FDA regulations governing electronic records and electronic signatures in healthcare.
