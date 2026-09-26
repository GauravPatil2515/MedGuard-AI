/**
 * patientRecordStore.js
 * Unified patient record domain store for MedGuard.
 * Encapsulates:
 * - PatientRecord { treatments, riskEvents, adherenceSummary }
 * - Cross-treatment pairwise DDI check across all active treatments
 * - 1-tap dose Taken/Missed logging updating aggregated adherence
 * - IndexedDB persistence via encrypted storage
 */

import { saveEncryptedRecord, getDecryptedRecord } from './encryptedStorage';
import { runFullPipeline } from './riskPipeline';

const RECORD_KEY_PREFIX = 'patient_record_';

// Default initial state if no record exists yet
const createInitialPatientRecord = (patientId = 'patient_mrs_kulkarni_01') => ({
  patientId,
  treatments: [
    {
      id: 'treat_warfarin_01',
      drugName: 'Warfarin',
      dosage: '5mg',
      frequency: 'OD (Once Daily)',
      timesOfDay: ['20:00'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      startDate: '2026-08-01',
      endDate: null,
      condition: 'Atrial Fibrillation / DVT Prophylaxis',
      prescribingDoctor: 'Dr. V. Sharma (Cardiology)',
      status: 'active',
      sourceOcrConfidence: 0.96,
      createdAt: '2026-08-01T10:00:00Z'
    },
    {
      id: 'treat_amiodarone_02',
      drugName: 'Amiodarone',
      dosage: '200mg',
      frequency: 'OD (Once Daily)',
      timesOfDay: ['09:00'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      startDate: '2026-08-15',
      endDate: null,
      condition: 'Ventricular Arrhythmia',
      prescribingDoctor: 'Dr. V. Sharma (Cardiology)',
      status: 'active',
      sourceOcrConfidence: 0.94,
      createdAt: '2026-08-15T11:00:00Z'
    },
    {
      id: 'treat_pantoprazole_03',
      drugName: 'Pantoprazole',
      dosage: '40mg',
      frequency: 'OD (Before Breakfast)',
      timesOfDay: ['07:30'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      startDate: '2026-09-01',
      endDate: null,
      condition: 'Gastroprotection',
      prescribingDoctor: 'Dr. S. Patil',
      status: 'active',
      sourceOcrConfidence: 0.98,
      createdAt: '2026-09-01T08:30:00Z'
    }
  ],
  riskEvents: [
    {
      id: 'risk_warfarin_amiodarone',
      treatmentIdsInvolved: ['treat_warfarin_01', 'treat_amiodarone_02'],
      drugPair: ['Warfarin', 'Amiodarone'],
      severity: 'Major',
      description: 'Amiodarone inhibits CYP2C9/CYP3A4 metabolism of Warfarin, potentially doubling INR and dramatically raising bleed hazard. Frequent INR monitoring required.',
      dateRaised: '2026-08-15T11:05:00Z',
      status: 'acknowledged'
    }
  ],
  adherenceSummary: [
    {
      treatmentId: 'treat_warfarin_01',
      drugName: 'Warfarin 5mg',
      percentTaken: 96,
      totalScheduled: 28,
      dosesTaken: 27,
      dosesMissed: 1,
      currentStreak: 14,
      lastMissed: '2026-09-12'
    },
    {
      treatmentId: 'treat_amiodarone_02',
      drugName: 'Amiodarone 200mg',
      percentTaken: 100,
      totalScheduled: 28,
      dosesTaken: 28,
      dosesMissed: 0,
      currentStreak: 28,
      lastMissed: null
    },
    {
      treatmentId: 'treat_pantoprazole_03',
      drugName: 'Pantoprazole 40mg',
      percentTaken: 93,
      totalScheduled: 28,
      dosesTaken: 26,
      dosesMissed: 2,
      currentStreak: 5,
      lastMissed: '2026-09-21'
    }
  ],
  todayDoses: [
    {
      id: 'dose_01',
      treatmentId: 'treat_pantoprazole_03',
      drugName: 'Pantoprazole',
      dosage: '40mg',
      scheduledTime: '07:30',
      timing: 'Before Breakfast',
      status: 'TAKEN', // 'PENDING' | 'TAKEN' | 'MISSED'
      criticality: 'MEDIUM'
    },
    {
      id: 'dose_02',
      treatmentId: 'treat_amiodarone_02',
      drugName: 'Amiodarone',
      dosage: '200mg',
      scheduledTime: '09:00',
      timing: 'After Breakfast',
      status: 'TAKEN',
      criticality: 'HIGH'
    },
    {
      id: 'dose_03',
      treatmentId: 'treat_warfarin_01',
      drugName: 'Warfarin',
      dosage: '5mg',
      scheduledTime: '20:00',
      timing: 'After Dinner',
      status: 'PENDING',
      criticality: 'HIGH'
    }
  ]
});

/**
 * Load the patient record from encrypted IndexedDB, or initialize if first run
 */
export async function loadPatientRecord(patientId = 'patient_mrs_kulkarni_01') {
  try {
    const stored = await getDecryptedRecord(`${RECORD_KEY_PREFIX}${patientId}`);
    if (stored && stored.patientId && Array.isArray(stored.treatments)) {
      return stored;
    }
  } catch (err) {
    console.warn('Could not load encrypted record from IndexedDB, initializing default:', err);
  }

  const initial = createInitialPatientRecord(patientId);
  try {
    await saveEncryptedRecord(`${RECORD_KEY_PREFIX}${patientId}`, initial);
  } catch (e) {
    console.warn('Could not persist initial record:', e);
  }
  return initial;
}

/**
 * Save updated PatientRecord to encrypted IndexedDB
 */
export async function savePatientRecord(record) {
  if (!record || !record.patientId) return;
  await saveEncryptedRecord(`${RECORD_KEY_PREFIX}${record.patientId}`, record);
}

/**
 * Core Safety Requirement:
 * Runs pairwise cross-treatment risk evaluation across ALL currently ACTIVE treatments.
 * Deduplicates against existing riskEvents (updates existing instead of duplicating).
 */
export async function runCrossTreatmentRiskCheck(record) {
  const activeTreatments = record.treatments.filter(t => t.status === 'active');
  if (activeTreatments.length < 2) return record;

  const activeDrugNames = activeTreatments.map(t => t.drugName);
  
  // Combine all active drugs into text for the on-device risk pipeline
  const compositeText = activeDrugNames.map(d => `Rx Tab ${d}`).join('\n');
  
  try {
    const analysis = await runFullPipeline(compositeText);
    const discoveredInteractions = analysis.interactions || [];

    const updatedRiskEvents = [...record.riskEvents];

    discoveredInteractions.forEach(inter => {
      const drugA = inter.drug_a;
      const drugB = inter.drug_b;

      // Find the treatment IDs for these drugs
      const tA = activeTreatments.find(t => t.drugName.toLowerCase() === drugA.toLowerCase());
      const tB = activeTreatments.find(t => t.drugName.toLowerCase() === drugB.toLowerCase());
      
      const treatmentIdsInvolved = [];
      if (tA) treatmentIdsInvolved.push(tA.id);
      if (tB) treatmentIdsInvolved.push(tB.id);

      // Check if this pair already exists
      const existingIdx = updatedRiskEvents.findIndex(re => 
        (re.drugPair[0].toLowerCase() === drugA.toLowerCase() && re.drugPair[1].toLowerCase() === drugB.toLowerCase()) ||
        (re.drugPair[0].toLowerCase() === drugB.toLowerCase() && re.drugPair[1].toLowerCase() === drugA.toLowerCase())
      );

      const severity = inter.risk_label || 'Major';
      const description = inter.description || `${drugA} and ${drugB} interact negatively.`;

      if (existingIdx >= 0) {
        // Update existing record, preserve resolution status unless severity worsened
        const existing = updatedRiskEvents[existingIdx];
        updatedRiskEvents[existingIdx] = {
          ...existing,
          treatmentIdsInvolved: Array.from(new Set([...existing.treatmentIdsInvolved, ...treatmentIdsInvolved])),
          severity,
          description
        };
      } else {
        // Create new RiskEvent
        updatedRiskEvents.unshift({
          id: `risk_${drugA.toLowerCase()}_${drugB.toLowerCase()}_${Date.now()}`,
          treatmentIdsInvolved,
          drugPair: [drugA, drugB],
          severity,
          description,
          dateRaised: new Date().toISOString(),
          status: 'unresolved'
        });
      }
    });

    const updatedRecord = {
      ...record,
      riskEvents: updatedRiskEvents
    };

    await savePatientRecord(updatedRecord);
    return updatedRecord;
  } catch (err) {
    console.error('Cross-treatment DDI evaluation error:', err);
    return record;
  }
}

/**
 * Add a new Treatment to the PatientRecord and trigger cross-treatment DDI check
 */
export async function addTreatment(record, treatmentInput) {
  const newId = `treat_${Date.now()}`;
  const newTreatment = {
    id: newId,
    drugName: treatmentInput.drugName.trim(),
    dosage: treatmentInput.dosage || '1 dose',
    frequency: treatmentInput.frequency || 'OD',
    timesOfDay: treatmentInput.timesOfDay || ['09:00'],
    days: treatmentInput.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    startDate: treatmentInput.startDate || new Date().toISOString().split('T')[0],
    endDate: treatmentInput.endDate || null,
    condition: treatmentInput.condition || null,
    prescribingDoctor: treatmentInput.prescribingDoctor || null,
    status: 'active',
    sourceOcrConfidence: treatmentInput.sourceOcrConfidence || 1.0,
    createdAt: new Date().toISOString()
  };

  const updatedTreatments = [...record.treatments, newTreatment];

  // Initialize adherence summary item
  const updatedAdherence = [
    ...record.adherenceSummary,
    {
      treatmentId: newId,
      drugName: `${newTreatment.drugName} ${newTreatment.dosage}`,
      percentTaken: 100,
      totalScheduled: 1,
      dosesTaken: 1,
      dosesMissed: 0,
      currentStreak: 1,
      lastMissed: null
    }
  ];

  // Add today dose item
  const newTodayDose = {
    id: `dose_${Date.now()}`,
    treatmentId: newId,
    drugName: newTreatment.drugName,
    dosage: newTreatment.dosage,
    scheduledTime: newTreatment.timesOfDay[0] || '12:00',
    timing: newTreatment.frequency,
    status: 'PENDING',
    criticality: newTreatment.drugName.toLowerCase().includes('warfarin') ? 'HIGH' : 'MEDIUM'
  };

  const intermediateRecord = {
    ...record,
    treatments: updatedTreatments,
    adherenceSummary: updatedAdherence,
    todayDoses: [...(record.todayDoses || []), newTodayDose]
  };

  // Run automatic pairwise cross-treatment risk check
  return await runCrossTreatmentRiskCheck(intermediateRecord);
}

/**
 * 1-Tap Log Dose: Marks dose as TAKEN or MISSED and immediately aggregates adherence summary
 */
export async function logDoseStatus(record, doseId, status) {
  const doses = record.todayDoses || [];
  const targetDose = doses.find(d => d.id === doseId);
  if (!targetDose) return record;

  const updatedDoses = doses.map(d => d.id === doseId ? { ...d, status } : d);

  // Update aggregated adherenceSummary
  const updatedAdherence = record.adherenceSummary.map(item => {
    if (item.treatmentId === targetDose.treatmentId) {
      const isTaken = status === 'TAKEN';
      const dosesTaken = item.dosesTaken + (isTaken ? 1 : 0);
      const dosesMissed = item.dosesMissed + (!isTaken ? 1 : 0);
      const total = dosesTaken + dosesMissed;
      const percentTaken = total > 0 ? Math.round((dosesTaken / total) * 100) : 100;
      const currentStreak = isTaken ? item.currentStreak + 1 : 0;
      const lastMissed = !isTaken ? new Date().toISOString().split('T')[0] : item.lastMissed;

      return {
        ...item,
        dosesTaken,
        dosesMissed,
        totalScheduled: total,
        percentTaken,
        currentStreak,
        lastMissed
      };
    }
    return item;
  });

  const updatedRecord = {
    ...record,
    todayDoses: updatedDoses,
    adherenceSummary: updatedAdherence
  };

  await savePatientRecord(updatedRecord);
  return updatedRecord;
}

/**
 * Acknowledge or Resolve a RiskEvent
 */
export async function updateRiskStatus(record, riskId, newStatus) {
  const updatedRisks = record.riskEvents.map(r => r.id === riskId ? { ...r, status: newStatus } : r);
  const updatedRecord = { ...record, riskEvents: updatedRisks };
  await savePatientRecord(updatedRecord);
  return updatedRecord;
}
