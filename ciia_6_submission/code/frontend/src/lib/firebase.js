// SAFE CAP⁺ — Firebase Client Configuration & Realtime Database Service
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, off, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDb6LtLYRK4-BygA9lczOqTBvEBdtP1BlA",
  authDomain: "safecap-3b06f.firebaseapp.com",
  databaseURL: "https://safecap-3b06f-default-rtdb.firebaseio.com",
  projectId: "safecap-3b06f",
  storageBucket: "safecap-3b06f.firebasestorage.app",
  messagingSenderId: "260066621136",
  appId: "1:260066621136:web:24e397cca448b1197750d5",
  measurementId: "G-JB8CZVVRG0"
};

// Singleton pattern to prevent reinitialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const rtdb = getDatabase(app);

const loggedNotices = new Set();
function logNoticeOnce(key, msg) {
  if (!loggedNotices.has(key)) {
    loggedNotices.add(key);
    console.warn(msg);
  }
}

/**
 * 1. Sync real-time patient adherence and status to Firebase RTDB
 */
export async function syncDoseToFirebase(patientId, doseData) {
  try {
    const statusRef = ref(rtdb, `patients/${patientId}/status`);
    await set(statusRef, {
      ...doseData,
      lastUpdated: new Date().toISOString(),
      timestamp: Date.now()
    });

    // Also push into dose history node
    const historyRef = ref(rtdb, `patients/${patientId}/doses`);
    await push(historyRef, {
      ...doseData,
      timestamp: Date.now(),
      recordedAt: new Date().toISOString()
    });
  } catch (err) {
    logNoticeOnce('dose_sync', `Firebase RTDB dose sync notice: ${err.message}`);
  }
}

/**
 * 2. Push critical alert directly to Caregiver feed on Firebase
 */
export async function pushCaregiverAlertToFirebase(patientId, alertData) {
  try {
    const alertsRef = ref(rtdb, `caregiver_alerts/${patientId}`);
    await push(alertsRef, {
      ...alertData,
      patient_id: patientId,
      timestamp: Date.now(),
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firebase RTDB caregiver alert push notice:", err.message);
  }
}

/**
 * 3. Subscribe to live caregiver alerts for a patient
 */
export function subscribeToCaregiverAlerts(patientId, onAlertCallback) {
  try {
    const alertsRef = ref(rtdb, `caregiver_alerts/${patientId}`);
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && onAlertCallback) {
        // If it's a collection of pushed alerts, pass the latest one or list
        if (typeof data === 'object') {
          const keys = Object.keys(data);
          const latestKey = keys[keys.length - 1];
          onAlertCallback(data[latestKey] || data);
        } else {
          onAlertCallback(data);
        }
      }
    }, (error) => {
      logNoticeOnce(`sub_alerts_${patientId}`, `Firebase alerts subscription notice: ${error.message}`);
    });

    return () => off(alertsRef);
  } catch (err) {
    logNoticeOnce(`sub_alerts_err_${patientId}`, `Firebase subscribeToCaregiverAlerts notice: ${err.message}`);
    return () => {};
  }
}

/**
 * 4. Subscribe to real-time patient status
 */
export function subscribeToPatientStatus(patientId, onStatusCallback) {
  try {
    const statusRef = ref(rtdb, `patients/${patientId}/status`);
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data && onStatusCallback) {
        onStatusCallback(data);
      }
    }, (error) => {
      logNoticeOnce(`sub_status_${patientId}`, `Firebase status subscription notice: ${error.message}`);
    });

    return () => off(statusRef);
  } catch (err) {
    logNoticeOnce(`sub_status_err_${patientId}`, `Firebase subscribeToPatientStatus notice: ${err.message}`);
    return () => {};
  }
}

/**
 * 5. Sync smart bottle inventory & cap status
 */
export async function syncBottleInventoryToFirebase(patientId, drugName, remainingPills, totalPills = 30) {
  try {
    const safeKey = drugName.replace(/[^a-zA-Z0-9]/g, '_');
    const bottleRef = ref(rtdb, `bottles/${patientId}/${safeKey}`);
    await set(bottleRef, {
      drug_name: drugName,
      remaining_pills: remainingPills,
      total_pills: totalPills,
      refill_needed: remainingPills <= 5,
      cap_locked: true,
      last_sync: new Date().toISOString()
    });
  } catch (err) {
    logNoticeOnce('bottle_sync', `Firebase bottle inventory sync notice: ${err.message}`);
  }
}

/**
 * 6. Subscribe to live bottle inventories & cap status
 */
export function subscribeToBottles(patientId, onBottlesCallback) {
  try {
    const bottlesRef = ref(rtdb, `bottles/${patientId}`);
    onValue(bottlesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && onBottlesCallback) {
        onBottlesCallback(data);
      }
    }, (error) => {
      logNoticeOnce(`sub_bottles_${patientId}`, `Firebase bottles subscription notice: ${error.message}`);
    });

    return () => off(bottlesRef);
  } catch (err) {
    logNoticeOnce(`sub_bottles_err_${patientId}`, `Firebase subscribeToBottles notice: ${err.message}`);
    return () => {};
  }
}

/**
 * 7. Sync active medication schedules to Firebase
 */
export async function syncScheduleToFirebase(patientId, schedules) {
  try {
    const schedRef = ref(rtdb, `patients/${patientId}/schedules`);
    await set(schedRef, {
      schedules,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firebase schedule sync notice:", err.message);
  }
}

export default app;
