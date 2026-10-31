import React, { useState, useEffect } from 'react';

// Auth Context
import { useAuth, ROLES } from './context/AuthContext.jsx';

// Unified UI System Components
import AppHeader from './components/ui/AppHeader';
import BottomNav from './components/ui/BottomNav';
import AuditLedgerModal from './components/AuditLedgerModal';

// Views (SAFE CAP+)
import DashboardView from './components/views/DashboardView';
import ScannerView from './components/views/ScannerView';
import CaregiverView from './components/views/CaregiverView';
import SafetyView from './components/views/SafetyView';
import AdminScannerView from './components/views/AdminScannerView';


// Unified Reactive Store (On-Device + AES-GCM Encrypted)
import { 
  loadPatientRecord, 
  logDoseStatus, 
  addTreatment
} from './lib/patientRecordStore';

// Firebase Realtime Service
import { subscribeToCaregiverAlerts, syncDoseToFirebase } from './lib/firebase';


const API_BASE = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : "http://localhost:5000/api";

export default function App() {
  const { user, login, logout, switchRole, isAdmin, isUser, isLoggedIn } = useAuth();
  
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLang, setSelectedLang] = useState('mr'); // 'mr' | 'hi' | 'en'
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Single Source of Truth: Unified Reactive Patient Record
  const [patientRecord, setPatientRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  // Patient Demographic Metadata
  const [patientData, setPatientData] = useState({
    patient_name: "Mrs. Kulkarni",
    age: 68,
    diagnosis: "Post-CABG • Atrial Fibrillation"
  });

  const [caregiverAlert, setCaregiverAlert] = useState(null);

  // Emergency call handler
  const handleEmergencyCall = () => {
    window.location.href = "tel:+919820011223";
  };

  // Check URL for role parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam === 'admin' && !isLoggedIn) {
      login(ROLES.ADMIN, { name: 'Pharmacist Admin' });
    } else if (!isLoggedIn) {
      login(ROLES.USER, { name: 'Patient' });
    }
  }, []);

  // 1. Initial Load: Load from backend API with fallback to local encrypted record
  useEffect(() => {
    async function init() {
      const pid = 'patient_mrs_kulkarni_01';
      try {
        // Fetch real patient profile from backend
        const pRes = await fetch(`${API_BASE}/patients/${pid}`);
        if (pRes.ok) {
          const pInfo = await pRes.json();
          if (pInfo && pInfo.name) {
            setPatientData({
              patient_name: pInfo.name,
              age: pInfo.age || 68,
              diagnosis: pInfo.diagnosis || "Cardiovascular Health Management"
            });
          }
        }
      } catch (err) {
        console.warn("Backend patient fetch notice:", err.message);
      }

      try {
        const record = await loadPatientRecord(pid);
        setPatientRecord(record);
      } catch (e) {
        console.error("Failed to load patient record:", e);
      } finally {
        setLoadingRecord(false);
      }
      checkHealth();
    }
    init();
  }, []);


  // 2. Dual Real-Time Telemetry: SSE + Firebase Realtime Database
  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource(`${API_BASE}/caregiver/stream`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CRITICAL_MISSED_DOSE_ALERT') {
            setCaregiverAlert(data);
          }
        } catch (e) {
          console.warn("SSE parse error", e);
        }
      };
    } catch (e) {
      console.warn("SSE connection error", e);
    }

    // Firebase Realtime Database listener for caregiver alerts
    const unsubscribeFirebase = subscribeToCaregiverAlerts(
      patientRecord?.patientId || 'patient_mrs_kulkarni_01',
      (firebaseAlert) => {
        if (firebaseAlert && (firebaseAlert.type === 'CRITICAL_MISSED_DOSE_ALERT' || firebaseAlert.action_required)) {
          setCaregiverAlert(firebaseAlert);
        }
      }
    );

    return () => {
      if (eventSource) eventSource.close();
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }, [patientRecord?.patientId]);


  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) setIsBackendHealthy(true);
      else setIsBackendHealthy(false);
    } catch {
      setIsBackendHealthy(false);
    }
  };

  const loadBackendPreset = async (presetId) => {
    try {
      const res = await fetch(`${API_BASE}/rx/preset/${presetId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.prescription) {
          setPatientData({
            patient_name: data.prescription.patient_name || "Mrs. Kulkarni",
            age: data.prescription.age || 68,
            diagnosis: data.prescription.diagnosis || "Post-CABG • Atrial Fibrillation"
          });
        }
      }
    } catch (err) {
      console.warn("Preset sync notice:", err.message);
    }
  };

  // 3. Central Reactive Action: Dose Taken / Missed
  const handleDoseAction = async (doseId, status) => {
    if (!patientRecord) return;
    try {
      const updated = await logDoseStatus(patientRecord, doseId, status);
      setPatientRecord(updated);

      // Inform backend if connected
      const targetDose = (patientRecord.todayDoses || []).find(d => d.id === doseId);
      if (targetDose) {
        const payload = {
          patient_id: patientRecord.patientId || "patient_mrs_kulkarni_01",
          drug_name: targetDose.drugName,
          status: status,
          criticality: targetDose.criticality || "HIGH"
        };
        fetch(`${API_BASE}/schedules/dose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});

        // Direct Firebase Realtime Database sync
        syncDoseToFirebase(payload.patient_id, payload);
      }
    } catch (err) {
      console.error("Dose action error:", err);
    }

  };

  // 4. Central Reactive Action: Add Prescribed Medication & Run Pairwise DDI
  const handleAddTreatment = async (treatmentData) => {
    if (!patientRecord) return null;
    try {
      const updated = await addTreatment(patientRecord, treatmentData);
      setPatientRecord(updated);
      return updated;
    } catch (err) {
      console.error("Add treatment error:", err);
      return null;
    }
  };

  // Dynamically compute unresolved critical risk count
  const criticalAlertCount = (patientRecord?.riskEvents || []).filter(
    r => r.status === 'unresolved' && (r.severity === 'Major' || r.severity === 'High Risk')
  ).length;

  // Role Selector Component
  const RoleSelector = () => {
    if (!isLoggedIn) return null;
    
    return (
      <div style={{
        display: 'flex', gap: '8px', padding: '6px 10px',
        background: '#f1f5f9', borderRadius: 'var(--radius-full)',
        alignItems: 'center', flexShrink: 0
      }}>
        <span className="meta-text" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Mode:</span>
        <button
          onClick={() => switchRole(ROLES.ADMIN)}
          style={{
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem', fontWeight: 700,
            background: isAdmin ? 'var(--mg-primary)' : 'transparent',
            color: isAdmin ? '#fff' : 'var(--mg-text-muted)',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Admin
        </button>
        <button
          onClick={() => switchRole(ROLES.USER)}
          style={{
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem', fontWeight: 700,
            background: isUser ? 'var(--mg-primary)' : 'transparent',
            color: isUser ? '#fff' : 'var(--mg-text-muted)',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Patient
        </button>
      </div>
    );
  };

  // Show loading state
  if (loadingRecord) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--mg-canvas)'
      }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid var(--mg-primary)', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: 'var(--mg-text-muted)', fontSize: '0.95rem' }}>
          Loading your medications...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Reusable Clean App Header */}
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patientName={patientData.patient_name}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        isBackendHealthy={isBackendHealthy}
        criticalAlertCount={criticalAlertCount}
        onEmergencyCall={handleEmergencyCall}
        roleSelector={<RoleSelector />}
      />

      {/* Main Content Area */}
      <main className="app-shell">
        
        {/* Real-time Caregiver Escalation Banner (when an SSE event arrives) */}
        {caregiverAlert && (
          <div 
            className="mg-card fade-in"
            style={{
              padding: '16px 20px',
              background: 'var(--mg-danger-soft)',
              borderColor: 'var(--mg-danger-border)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              border: '2px solid var(--mg-danger-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--mg-danger)' }} className="pulse-dot" />
              <strong style={{ fontSize: '0.95rem', color: '#991b1b' }}>
                ⚠️ Caregiver Alert: Missed {caregiverAlert.drug_name} dose
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setActiveTab('caregiver'); setCaregiverAlert(null); }}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                View Details
              </button>
              <button
                onClick={() => setCaregiverAlert(null)}
                className="btn-ghost"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Admin Scanner View - Only visible in Admin mode */}
        {isAdmin && (
          <AdminScannerView
            onNavigateTab={setActiveTab}
            selectedLang={selectedLang}
            onAddTreatment={handleAddTreatment}
            API_BASE={API_BASE}
          />
        )}

        {/* User Views - General User mode */}
        {!isAdmin && (
          <>
            {/* Tab 1: Today's Pills (Home) */}
            {activeTab === 'home' && (
              <DashboardView
                patientData={patientData}
                patientRecord={patientRecord}
                onNavigateTab={setActiveTab}
                onDoseAction={handleDoseAction}
                selectedLang={selectedLang}
                onEmergencyCall={handleEmergencyCall}
                API_BASE={API_BASE}
              />
            )}

            {/* Tab 2: Scan Bottle */}
            {activeTab === 'scanner' && (
              <ScannerView
                patientRecord={patientRecord}
                onAddTreatment={handleAddTreatment}
                onNavigateTab={setActiveTab}
                selectedLang={selectedLang}
                API_BASE={API_BASE}
              />
            )}

            {/* Tab 3: Family Caregiver */}
            {activeTab === 'caregiver' && (
              <CaregiverView
                patientRecord={patientRecord}
                onNavigateTab={setActiveTab}
                selectedLang={selectedLang}
                onEmergencyCall={handleEmergencyCall}
                API_BASE={API_BASE}
              />
            )}

            {/* Sub-view: Plain Language Drug Safety */}
            {activeTab === 'safety' && (
              <SafetyView
                patientRecord={patientRecord}
                onNavigateTab={setActiveTab}
                selectedLang={selectedLang}
                onEmergencyCall={handleEmergencyCall}
                API_BASE={API_BASE}
              />
            )}
          </>
        )}


      </main>

      {/* Mobile Bottom Dock Navigation - Only for non-admin users */}
      {!isAdmin && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          selectedLang={selectedLang}
        />
      )}

      {/* 21 CFR Part 11 Audit Ledger Modal */}
      <AuditLedgerModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        API_BASE={API_BASE}
      />

    </div>
  );
}