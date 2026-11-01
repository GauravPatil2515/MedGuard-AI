# CIIA-6 Jury Walkthrough, Live Pitch & Video Submission Script
**Event**: CIIA-6 National Innovation Exhibition (Worli, Mumbai)  
**Project**: SAFE CAP⁺ (MedGuard AI)  
**Target Video Deadline**: 5th December 2026  
**Exhibition Dates**: 4th – 6th February 2027  

---

## 🎙️ Section 1: The 3-Minute Live Jury Pitch (Booth Walkthrough)

*Setup on your table:*
1. A physical child-resistant pill bottle with the **SAFE CAP⁺ printed QR label**.
2. A smartphone (for scanning the QR code and playing vernacular audio aloud).
3. A laptop running the **MedGuard AI Live Dashboard & Caregiver Monitor**.

---

### Step 1: The Hook (0:00 – 0:45)
> *"Respected Judges, good afternoon.  
> In India, millions of elderly patients with heart disease, blood pressure, and diabetes take 5 to 8 different tablets every single day. Current health apps on the market are glorified alarm clocks—they remind a patient to take a pill, but **none of them tell you whether that combination of pills could cause internal bleeding or sudden cardiac arrest before you take them.**  
> 
> We introduce **SAFE CAP⁺**: an intelligent, zero-jargon medication packaging system backed by a multi-target deep learning pharmacology engine."*

---

### Step 2: The Physical Demo (0:45 – 1:30)
*(Pick up the bottle and hand it to the judge, or demonstrate directly)*
> *"Here is our physical prototype: a child-resistant push-and-turn bottle that prevents accidental poisoning in multi-generational households. On the side is our standard SAFE CAP⁺ QR label.  
> 
> Watch how simple onboarding is for a 70-year-old grandmother. She doesn't need to type drug names or create accounts. She simply points her phone camera at the bottle..."*  
*(Scan the QR code — the web app instantly loads the profile for Mrs. Sumitra Kulkarni).*

---

### Step 3: Vernacular Audio & Elderly Accessibility (1:30 – 2:00)
> *"Instead of confusing clinical inserts, SAFE CAP⁺ provides zero-jargon plain-language advice and speaks in regional languages. Listen..."*  
*(Tap the Marathi or Hindi audio button on the phone)*  
*(The phone speaks aloud: 'सावधान: वॉरफेरिन सोबत कॉम्बीफ्लॅम घेऊ नका... / Do not take Combiflam with Warfarin...')*  
> *"Now, the elderly patient clearly understands why they should not take an over-the-counter painkiller with their prescribed blood thinner."*

---

### Step 4: The Deep Learning Safety Engine (2:00 – 2:30)
*(Point to the laptop screen showing the Toxicity & Interaction Engine)*
> *"Under the hood, our platform isn't just checking static text. It executes five validated machine learning and Graph Neural Network models:
> 1. A **Morgan Fingerprint Random Forest** model with an ROC-AUC of 0.8627 screening for cardiac hERG potassium channel blockage (arrhythmia risks).
> 2. Dual-Stream **GSAT Graph Neural Networks** trained on Tox21 and ClinTox benchmarks for endocrine and clinical trial toxicity.
> 3. Conformal prediction statistical intervals providing mathematical guarantees of 95% coverage."*

---

### Step 5: Caregiver Escalation & The Close (2:30 – 3:00)
*(Trigger a simulated missed dose on the phone)*
> *"If our patient forgets her morning Warfarin dose, our Server-Sent Event stream immediately escalates to her daughter's phone on the caregiver monitor, and cryptographically records the event in a 21 CFR Part 11 compliant audit ledger.  
> 
> SAFE CAP⁺ turns ordinary medicine packaging into an active guardian. Thank you, and we welcome your questions!"*

---

## 📹 Section 2: Script for the Mandatory Video Submission (Due Dec 5, 2026)

*Video Duration: Exactly 3 to 4 Minutes. Upload as Unlisted YouTube / Google Drive link.*

1. **Clip 1 (0:00 - 0:30) | Problem**: Close-up of multiple medicine strips and bottles. Voiceover explains polypharmacy hazards, elderly confusion, and childhood accidental poisoning.
2. **Clip 2 (0:30 - 1:15) | Physical Bottle & QR Onboarding**: Show the physical bottle, demonstrate the push-and-turn cap, scan the QR code with a phone, and show instant loading.
3. **Clip 3 (1:15 - 2:00) | Regional Voice Guidance**: Tap the regional language button and play the Marathi/Hindi voice guide clearly into the microphone.
4. **Clip 4 (2:00 - 2:45) | Live Safety & Toxicity Screen**: Screen recording of the MedGuard AI web app showing the drug clash warning (Warfarin + Combiflam), the hERG cardiotoxicity score, and the molecular structure.
5. **Clip 5 (2:45 - 3:15) | Real-Time Caregiver Notification**: Show two screens side-by-side: patient misses dose $\rightarrow$ caregiver terminal receives the real-time alert with timestamp.
6. **Clip 6 (3:15 - 3:30) | Outro**: Slide with Team Name, College, Guide Name, and CIIA-6 Registration Details.

---

## ❓ Section 3: Anticipated Jury Q&A and Winning Answers

#### Q1: "How is this different from existing pill reminder apps like Medisafe or 1mg?"
> **Answer**:  
> *"Existing apps are purely schedule trackers that assume every prescribed combination is safe. They cannot identify if an over-the-counter painkiller like Combiflam taken for knee pain will induce fatal internal bleeding when combined with Warfarin. MedGuard AI evaluates multi-drug toxicity, enzyme inhibition, and cardiac hERG channel blockage at the molecular level using trained GNNs and pharmacogenomic rules."*

#### Q2: "Can elderly rural patients really use this?"
> **Answer**:  
> *"Yes, because there is zero typing and zero medical jargon. The bottle has a 1-scan QR code, giant high-contrast buttons, and regional voice synthesis in Marathi and Hindi. A patient only has to scan and listen."*

#### Q3: "What is the cost of implementing SAFE CAP⁺ on medicine packaging?"
> **Answer**:  
> *"Almost zero incremental cost. Child-resistant caps are already standard worldwide. Printing our dynamic QR code on the packaging label costs less than ₹0.50 per bottle in bulk industrial pharmaceutical printing. The backend software runs efficiently on standard cloud or edge servers."*

#### Q4: "How do your Graph Neural Networks run in real time?"
> **Answer**:  
> *"We quantized and exported our dual-stream GNN models to optimized CPU runtimes (TorchScript/ONNX). Pairwise drug interactions are checked instantly against our deterministic symbolic matrix in < 5 milliseconds, while novel molecular fingerprints run through our Random Forest and GNN models in under 120 milliseconds."*

#### Q5: "What is 21 CFR Part 11 and why does it matter here?"
> **Answer**:  
> *"21 CFR Part 11 is the United States FDA standard for electronic records and signatures. In high-risk therapies like anticoagulation, knowing exactly when a dose was confirmed or missed with tamper-evident SHA-256 hash chaining prevents medical disputes and gives doctors clinical-grade adherence histories."*
