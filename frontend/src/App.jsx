import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Unified UI System Components
import AppHeader from './components/ui/AppHeader';
import BottomNav from './components/ui/BottomNav';
import AuditLedgerModal from './components/AuditLedgerModal';

// Views (SAFE CAP+ Complete Clinical Suite)
import DashboardView from './components/views/DashboardView';
import ScannerView from './components/views/ScannerView';
import CaregiverView from './components/views/CaregiverView';
import CopilotView from './components/views/CopilotView';
import SafetyView from './components/views/SafetyView';
import AdherenceView from './components/views/AdherenceView';
import MedicationsView from './components/views/MedicationsView';
import MolecularView from './components/views/MolecularView';
import FdaSignalsView from './components/views/FdaSignalsView';
import LandingView from './components/views/LandingView';
import AdminScannerView from './components/views/AdminScannerView';
import LoginPage from './components/LoginPage';

// Unified Reactive Store (On-Device + AES-GCM Encrypted)
import { 
  loadPatientRecord, 
  logDoseStatus, 
  addTreatment
} from './lib/patientRecordStore';

const API_BASE = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : "http://localhost:5000/api";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Public Route (redirects if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
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
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Main App Component with Auth
function AppContent() {
  const { user, isAuthenticated, login, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLang, setSelectedLang] = useState('mr');
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [caregiverAlert, setCaregiverAlert] = useState(null);

  // Synchronize activeTab with URL pathname
  useEffect(() => {
    const rawPath = location.pathname.replace(/^\//, '');
    setActiveTab(rawPath || 'home');
  }, [location.pathname]);

  const handleNavigateTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      navigate('/');
    } else {
      navigate(`/${tab}`);
    }
  };

  // Emergency call handler
  const handleEmergencyCall = () => {
    window.location.href = "tel:+919820011223";
  };

  // Load patient record from local store (for backward compat)
  const [patientRecord, setPatientRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  // Patient Demographic Metadata
  const [patientData, setPatientData] = useState({
    patient_name: "Mrs. Sumitra Kulkarni",
    age: 68,
    diagnosis: "Post-CABG • Atrial Fibrillation"
  });

  // Check URL for role parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    // Note: Role switching now happens via login, not URL param
  }, []);

  // 1. Initial Load: Load local encrypted record and sync backend if available
  useEffect(() => {
    async function init() {
      try {
        const record = await loadPatientRecord('patient_mrs_kulkarni_01');
        setPatientRecord(record);
      } catch (e) {
        console.error("Failed to load patient record:", e);
      } finally {
        setLoadingRecord(false);
      }
      checkHealth();
      loadBackendPreset('mrs_kulkarni_cardiac');
    }
    init();
  }, []);

  // 2. Server-Sent Events (SSE) Live Telemetry Stream
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
    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

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

      const targetDose = (patientRecord.todayDoses || []).find(d => d.id === doseId);
      if (targetDose) {
        fetch(`${API_BASE}/schedules/dose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: patientRecord.patientId || "patient_mrs_kulkarni_01",
            drug_name: targetDose.drugName,
            status: status,
            criticality: targetDose.criticality || "HIGH"
          })
        }).catch(() => {});
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
    if (!isAuthenticated) return null;
    
    return (
      <div style={{
        display: 'flex', gap: '8px', padding: '6px 10px',
        background: '#f1f5f9', borderRadius: 'var(--radius-full)',
        alignItems: 'center', flexShrink: 0
      }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--mg-text-muted)', fontWeight: 600 }}>Mode:</span>
        <button
          onClick={() => window.location.href = '/?role=admin'}
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
          onClick={() => window.location.href = '/?role=user'}
          style={{
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem', fontWeight: 700,
            background: !isAdmin ? 'var(--mg-primary)' : 'transparent',
            color: !isAdmin ? '#fff' : 'var(--mg-text-muted)',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Patient
        </button>
      </div>
    );
  };

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

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <PublicRoute>
        <LoginPage onLoginSuccess={() => window.location.reload()} />
      </PublicRoute>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Reusable Clean App Header */}
      <AppHeader
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        patientName={patientData.patient_name}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        isBackendHealthy={isBackendHealthy}
        criticalAlertCount={criticalAlertCount}
        onEmergencyCall={handleEmergencyCall}
        roleSelector={<RoleSelector />}
        onOpenAuditLedger={() => setIsAuditModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-shell">
        
        {/* Real-time Caregiver Escalation Banner */}
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
                onClick={() => { handleNavigateTab('caregiver'); setCaregiverAlert(null); }}
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
          <ProtectedRoute allowedRoles={['ADMIN', 'CLINICIAN']}>
            <AdminScannerView
              onNavigateTab={handleNavigateTab}
              selectedLang={selectedLang}
              onAddTreatment={handleAddTreatment}
              API_BASE={API_BASE}
            />
          </ProtectedRoute>
        )}

        {/* User Views - General Clinical Suite */}
        {!isAdmin && (
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<DashboardView
                patientData={patientData}
                patientRecord={patientRecord}
                onNavigateTab={handleNavigateTab}
                onDoseAction={handleDoseAction}
                selectedLang={selectedLang}
                onEmergencyCall={handleEmergencyCall}
                API_BASE={API_BASE}
              />} />
              <Route path="/scanner" element={<ScannerView
                onNavigateTab={handleNavigateTab}
              />} />
              <Route path="/caregiver" element={<CaregiverView
                onNavigateTab={handleNavigateTab}
                selectedLang={selectedLang}
                onEmergencyCall={handleEmergencyCall}
              />} />
              <Route path="/copilot" element={<CopilotView
                patientRecord={patientRecord}
                API_BASE={API_BASE}
              />} />
              <Route path="/safety" element={<SafetyView
                patientRecord={patientRecord}
                onAcknowledgeRisk={() => {}}
                onNavigateTab={handleNavigateTab}
                selectedLang={selectedLang}
                onEmergencyCall={handleEmergencyCall}
                API_BASE={API_BASE}
              />} />
              <Route path="/adherence" element={<AdherenceView
                onNavigateTab={handleNavigateTab}
              />} />
              <Route path="/medications" element={<MedicationsView
                patientData={patientData}
                patientRecord={patientRecord}
                onDoseAction={handleDoseAction}
                API_BASE={API_BASE}
              />} />
              <Route path="/molecular" element={<MolecularView
                onNavigateTab={handleNavigateTab}
              />} />
              <Route path="/fda" element={<FdaSignalsView
                API_BASE={API_BASE}
              />} />
              <Route path="/landing" element={<LandingView
                onNavigateTab={handleNavigateTab}
              />} />
              <Route path="/admin" element={<AdminScannerView
                onNavigateTab={handleNavigateTab}
                selectedLang={selectedLang}
                onAddTreatment={handleAddTreatment}
                API_BASE={API_BASE}
              />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ProtectedRoute>
        )}

      </main>

      {/* Mobile Bottom Dock Navigation - Only for non-admin users */}
      {!isAdmin && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          selectedLang={selectedLang}
          onOpenAuditLedger={() => setIsAuditModalOpen(true)}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}