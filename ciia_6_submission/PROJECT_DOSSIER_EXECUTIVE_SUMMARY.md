# SAFE CAP⁺ & MedGuard AI: Technical Project Dossier
### A Neuro-Symbolic Platform for Polypharmacy Toxicity Screening & Intelligent Patient-Centric Medication Packaging

**Innovator**: Gaurav Patil & Team  
**Domain**: Computational Pharmacology, Artificial Intelligence, Healthcare IoT  
**Target Competition**: CIIA-6 National Innovation Exhibition & Awards (Nehru Science Centre, Mumbai)  
**Track**: Technology Institutions (Pharma, Bio & Chemical Technology / Healthcare Gadgets)  

---

## 1. Executive Summary

Adverse Drug Reactions (ADRs) and polypharmacy complications are among the leading causes of preventable hospitalizations and mortality worldwide, particularly among geriatric patients managing multiple chronic conditions (cardiovascular disease, diabetes, hypertension). Current commercial health applications function merely as digital alarm clocks; **none evaluate whether a given combination of prescribed and over-the-counter (OTC) drugs could induce fatal cardiotoxicity or systemic hemorrhage prior to ingestion.**

**SAFE CAP⁺** bridges physical pharmaceutical packaging with an advanced, regulatory-grade neuro-symbolic clinical safety engine:
1. **Physical Smart Packaging**: Uses child-resistant push-and-turn bottle caps to prevent pediatric accidental poisonings, embedded with a 1-Scan instant QR identification protocol.
2. **Vernacular Plain-Language Guidance**: Eliminates clinical jargon and synthesizes spoken audio guides in regional Indian languages (**Marathi**, **Hindi**, and **English**) for elderly and low-literacy patients.
3. **Multi-Target Deep Learning Toxicity Screening**: Evaluates chemical structures across Graph Neural Networks (Tox21 Dual-Stream GSAT, ClinTox GNN, BBBP GNN) and Morgan Fingerprint Random Forests (hERG cardiotoxicity ROC-AUC 0.8627) with 95% conformal prediction statistical bounds.
4. **Caregiver Escalation & Regulatory Audit Trail**: Employs Server-Sent Events (SSE) to notify family members of missed critical doses, supported by a 21 CFR Part 11 compliant SHA-256 tamper-evident audit ledger.

---

## 2. Multi-Tier Neuro-Symbolic Architecture

MedGuard AI rejects black-box LLM hallucinations for drug safety. Instead, it couples **symbolic clinical rule graphs** with **continuous geometric deep learning models**:

```
                       [ Prescription Image / Physical QR Scan ]
                                          │
                                          ▼
                      Multimodal OCR & Clinical Normalizer
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
            Tier 1: Symbolic Rule Engine             Tier 2: Molecular GNN Suite
          - Deterministic CYP450 Competition       - hERG Potassium Channel (RF)
          - DDI Matrix (Warfarin/NSAID)            - Tox21 Dual-Stream GSAT
          - Food-Drug & Missed-Dose Rules          - ClinTox Trial Failure GNN
                     │                                         │
                     └────────────────────┬────────────────────┘
                                          ▼
                         Tier 3: Conformal Calibration
                      (Mondrian Inductive Bounds: 95% Coverage)
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
         Patient / Elderly UI                      Caregiver Monitoring
       - Zero Jargon Interface                   - Real-Time SSE Telemetry
       - Vernacular TTS (Marathi/Hindi)          - Hash-Chained Audit Ledger
```

### The AI & Machine Learning Suite:
* **Cardiac hERG QT-Prolongation Model (`herg_rf_model.pkl`)**:  
  Trained on ChEMBL bioassays using 2048-bit Morgan circular fingerprints (radius 2) to predict $I_{Kr}$ channel blockage (ROC-AUC: 0.8627). Protects patients against drug-induced fatal arrhythmias (Torsades de Pointes).
* **Tox21 Dual-Stream GSAT GNN (`dual_stream_tox21_s42.pt`)**:  
  A Graph Structure-Aware Attention Transformer with an Information Bottleneck that screens compounds across 12 endocrine, nuclear receptor, and cellular stress pathways.
* **ClinTox Clinical Safety GNN (`dual_stream_clintox_s42.pt`)**:  
  Trained on FDA-approved versus clinical trial failed compounds to flag intrinsic organ toxicity.
* **Blood-Brain Barrier Permeability GNN (`dual_stream_bbbp_s42.pt`)**:  
  Assesses whether a compound crosses into the central nervous system, alerting clinicians to delirium and neurotoxicity risks in geriatric patients.
* **Conformal Uncertainty Calibration (`conformal_predictor.py`)**:  
  Applies finite-sample statistical guarantees ensuring predictions have a calibrated error rate of $\le 5\%$ ($\alpha = 0.05$).

---

## 3. Physical Smart Bottle Integration: SAFE CAP⁺

At the exhibition, software alone cannot be demonstrated on a table. **SAFE CAP⁺ transforms the project into demonstrable physical hardware**:

1. **Child-Proof Push-and-Turn Cap**: Protects infants and toddlers in multi-generational Indian households from ingesting potent cardiac, anticoagulant, or diabetic tablets.
2. **Standard 2"x4" QR Prescription Label**: Glued to the bottle exterior. Encodes the patient prescription metadata, linking the physical medicine bottle to the patient profile without requiring passwords, account creation, or manual typing.
3. **Tactile & Visual Contrast**: Designed with high-contrast typography, large touch targets, and visual pill iconography suited for patients with impaired vision or tremors.

---

## 4. Regional Inclusivity & Vernacular Audio Engine

In India, complex clinical English warnings (e.g., *"Contraindicated due to synergistic platelet inhibition and CYP2C9 displacement"*) confuse elderly patients. 

SAFE CAP⁺ translates critical clinical findings into simple vernacular speech using Google Text-to-Speech (gTTS) with local phonetic adaptation:
* **Marathi (`mr`)**:  
  *“सावधान: वॉरफेरिन सोबत कॉम्बीफ्लॅम घेऊ नका. यामुळे अंतर्गत रक्तस्त्रावाचा मोठा धोका होऊ शकतो. त्वरित डॉक्टरांचा सल्ला घ्या.”*
* **Hindi (`hi`)**:  
  *“चेतावनी: वॉर्फरिन के साथ कॉम्बिफ्लैम न लें। इससे गंभीर आंतरिक रक्तस्राव हो सकता है। कृपया तुरंत डॉक्टर से संपर्क करें।”*
* **English (`en`)**:  
  *“Warning: Do not take Combiflam with Warfarin. It can cause serious internal bleeding. Please consult your doctor.”*

---

## 5. Regulatory Compliance & Caregiver Coordination

* **21 CFR Part 11 Audit Trail**: Every dosage intake, missed alert, and interaction warning is recorded in a cryptographically signed SHA-256 hash-chained SQLite/PostgreSQL audit database.
* **Caregiver Escalation Stream**: Built with HTTP Server-Sent Events (SSE). If a patient fails to confirm a high-criticality medication (e.g., Warfarin 5mg or Met-XL) within 45 minutes of scheduled time, an urgent push alert escalates to family caregivers.

---

## 6. Social Impact & Market Potential

* **Target Users**: Over 70 million chronic disease patients in India suffering from hypertension, cardiovascular disease, and Type-2 diabetes.
* **Pharma Supply Chain Integration**: Pharmaceutical manufacturers and pharmacy chains (Apollo, Netmeds, Tata 1mg) can print SAFE CAP⁺ labels directly during packaging at marginal cost (< ₹0.50 per bottle), creating an immense competitive advantage in patient safety.
