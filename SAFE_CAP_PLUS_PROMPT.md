# SAFE CAP⁺ Implementation Prompt: Zero-Jargon, Elderly-Friendly UI/UX

Use this prompt to execute the SAFE CAP⁺ interface transformation on top of the MedGuard AI platform.

---

## 1. System & Codebase Architecture Context

### Workspace Location
- **Root Path**: `/home/gaurav/Desktop/gaurav code /Project/MedGuard-AI`

### Active Services
1. **Backend Service (`backend/app.py`)**: Running on `http://127.0.0.1:5000`
   - `GET /api/health`: Health status of all services
   - `POST /api/schedules/dose`: Records dose intake (`{"schedule_id": int, "dose_time": str, "status": "TAKEN"}`)
   - `POST /api/tts/audio`: Vernacular text-to-speech (`{"text": str, "lang": "mr"|"hi"|"en"}`) returning base64 audio
   - `GET /api/caregiver/stream`: Real-time Server-Sent Events (SSE) notification stream
   - `GET /api/rx/preset/<id>`: Preset prescriptions (`mrs_kulkarni_cardiac`, `clash_regimen_bleeding`, `diabetic_hypertension`)
   - `GET /api/audit/trail`: 21 CFR Part 11 tamper-evident hash-chained audit records

2. **Frontend Service (`frontend/`)**: React 19 + Vite 8 running on `http://localhost:5173`
   - **Entry point**: [`src/App.jsx`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/App.jsx)
   - **State Store**: [`src/lib/patientRecordStore.js`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/lib/patientRecordStore.js) (Unified reactive store with AES-GCM encrypted persistence)
   - **Views**:
     - [`src/components/views/DashboardView.jsx`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/components/views/DashboardView.jsx) (Patient daily home)
     - [`src/components/views/ScannerView.jsx`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/components/views/ScannerView.jsx) (Camera/OCR scanner)
     - [`src/components/views/CaregiverView.jsx`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/components/views/CaregiverView.jsx) (Caregiver guardian monitoring)
     - [`src/components/views/SafetyView.jsx`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/components/views/SafetyView.jsx) & [`MolecularView.jsx`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/components/views/MolecularView.jsx) (Currently technical/biochemical)
   - **Navigation & Shell**:
     - [`src/components/ui/BottomNav.jsx`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/components/ui/BottomNav.jsx)
     - [`src/components/ui/AppHeader.jsx`](file:///home/gaurav/Desktop/gaurav%20code%20/Project/MedGuard-AI/frontend/src/components/ui/AppHeader.jsx)

---

## 2. Core Problem & User Needs
- **Target Audience**: General public, elderly patients (e.g., 65+ years), and their family caregivers.
- **Problem**: The interface currently displays technical clinical concepts (hERG potassium channel blockages, CYP3A4/CYP2C9 enzyme inhibition, GNN statistical bounds, complex OCR sliders).
- **Goal**: Transform the frontend into **SAFE CAP⁺** as specified in `SAFE_CAP_PLUS_PLAN.tex`:
  - Zero biochemical jargon.
  - Giant, touch-friendly buttons.
  - Spoken vernacular voice guidance (Marathi, Hindi, English).
  - Clear pill bottle inventory countdown.
  - 1-click "Mark as Taken" dose logging.

---

## 3. Specific File Modifications to Execute

### 1. Navigation Simplification (`frontend/src/components/ui/BottomNav.jsx`)
- Replace the 5/7 navigation items with **3 simple tabs**:
  1. `home`: **"Today's Pills"** (Pill / Sun icon)
  2. `scanner`: **"Scan Bottle"** (Center elevated QR/Camera icon)
  3. `caregiver`: **"Family Caregiver"** (Heart / Shield icon)
- Completely hide `safety`, `molecular`, `dashboard` (portal), and technical tabs from the primary user flow.

### 2. Header & Quick Controls (`frontend/src/components/ui/AppHeader.jsx`)
- Title: **SAFE CAP⁺** (with child-safe packaging indicator badge).
- Simple Language Toggle Pills: **[मराठी | हिंदी | English]**.
- Quick "Call Family" emergency button.

### 3. Accessible Patient Dashboard (`frontend/src/components/views/DashboardView.jsx`)
- **"Dose Due Right Now" Hero Card**:
  - High-contrast, large text (24px+ for medicine name).
  - Food instruction with clear emoji/icon (e.g., *"Take 1 tablet with breakfast"*).
  - **Big Green Button**: *"✅ I HAVE TAKEN THIS PILL NOW"* (calls `onDoseAction(doseId, 'TAKEN')` with audio/visual confirmation).
  - **Vernacular Audio Button**: *"🔊 Listen in Marathi / Hindi / English"* calling `/api/tts/audio`.
- **SAFE CAP⁺ Bottle Tracker**:
  - Visual pill inventory: *"24 of 30 tablets remaining • Refill in 6 days"*.
  - Safe storage card: *"Push-and-turn child cap locked"*.
- **Upcoming Schedule List**:
  - Chronological list: Morning (8:00 AM), Afternoon (1:30 PM), Night (9:00 PM).

### 4. Plain-Language Drug Clash Warnings (Replacing Molecular Toxicity)
When a critical interaction occurs (e.g., Warfarin + Combiflam):
- **Do NOT show**: Enzyme numbers, molecular graph weights, or hERG curves.
- **Show Plain Text**:
  - ⚠️ *"Do not take Combiflam with Warfarin. It can cause serious stomach bleeding. Please ask your doctor."*
  - Dedicated **"🔊 Read Out Warning"** button in the patient's chosen vernacular language.

### 5. Streamlined Scanner (`frontend/src/components/views/ScannerView.jsx`)
- Clean camera viewfinder with framing box for the bottle label.
- Remove technical CV sliders and regex options.
- 1-tap demo preset buttons:
  - *"Mrs. Sunita Kulkarni (Cardiac Morning Routine)"*
  - *"Critical Drug Clash (Warfarin + Combiflam Hazard)"*
  - *"Diabetic Care (Glimepiride 2 mg)"*

---

## 4. Verification Directives
1. Run `npm run build` in `frontend/` to confirm zero compilation errors.
2. Confirm the app is accessible on `http://localhost:5173/`.
3. Verify that the backend API continues to respond at `http://127.0.0.1:5000/api/health`.
