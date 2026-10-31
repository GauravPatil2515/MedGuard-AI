// SAFE CAP⁺ — Firebase Client Configuration & Service Initializer
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, off } from "firebase/database";

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

/**
 * Sync real-time patient adherence and status to Firebase RTDB
 */
export async function syncDoseToFirebase(patientId, doseData) {
  try {
    const statusRef = ref(rtdb, `patients/${patientId}/status`);
    await set(statusRef, {
      ...doseData,
      lastUpdated: new Date().toISOString(),
      timestamp: Date.now()
    });
  } catch (err) {
    console.warn("Firebase RTDB status sync notice:", err);
  }
}

/**
 * Subscribe to live caregiver alerts for a patient
 */
export function subscribeToCaregiverAlerts(patientId, onAlertCallback) {
  const alertsRef = ref(rtdb, `caregiver_alerts/${patientId}`);
  onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    if (data && onAlertCallback) {
      onAlertCallback(data);
    }
  });

  return () => off(alertsRef);
}

export default app;
