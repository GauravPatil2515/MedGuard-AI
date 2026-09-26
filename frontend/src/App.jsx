import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, RefreshCw, Bell, AlertTriangle, 
  FileText, Lock, Volume2, Phone
} from 'lucide-react';

import Header from './components/Header';
import ScannerStudio from './components/ScannerStudio';
import SafetyStudio from './components/SafetyStudio';
import ScheduleManager from './ScheduleManager';
import AdherenceCalendar from './AdherenceCalendar';
import CaregiverDashboard from './CaregiverDashboard';
import CopilotChat from './CopilotChat';

const API_BASE = "http://localhost:5000/api";

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'adherence' | 'safety' | 'caregiver' | 'copilot'
  const [selectedPreset, setSelectedPreset] = useState('mrs_kulkarni_cardiac');
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [safetyAnalysis, setSafetyAnalysis] = useState(null);
  const [auditRecords, setAuditRecords] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [caregiverAlert, setCaregiverAlert] = useState(null);
  const [caregiverAlerts, setCaregiverAlerts] = useState([]);
  const [selectedLang, setSelectedLang] = useState('mr'); // 'mr' | 'hi' | 'en'
  const [doseUpdateCounter, setDoseUpdateCounter] = useState(0);
  const [isSseConnected, setIsSseConnected] = useState(false);

  // Initial data load
  useEffect(() => {
    fetchPreset(selectedPreset);
    fetchAuditTrail();
  }, [selectedPreset]);

  // Server-Sent Events (SSE) Live Telemetry Stream
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE}/caregiver/stream`);
    
    eventSource.onopen = () => setIsSseConnected(true);
    eventSource.onerror = () => setIsSseConnected(false);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CRITICAL_MISSED_DOSE_ALERT') {
          setCaregiverAlert(data);
          setCaregiverAlerts(prev => [data, ...prev.slice(0, 9)]);
          fetchAuditTrail();
          setDoseUpdateCounter(prev => prev + 1);
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };
    return () => eventSource.close();
  }, []);

  const fetchPreset = async (presetId) => {
    try {
      const res = await fetch(`${API_BASE}/rx/preset/${presetId}`);
      if (res.ok) {
        const data = await res.json();
        setPrescriptionData(data.prescription);
        setSafetyAnalysis(data.safety_analysis);
      }
    } catch (err) {
      console.error("Error loading preset", err);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit/trail`);
      if (res.ok) {
        const data = await res.json();
        setAuditRecords(data.records || []);
      }
    } catch (err) {
      console.error("Error fetching audit trail", err);
    }
  };

  const verifyAuditLedger = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit/verify`);
      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data);
      }
    } catch (err) {
      console.error("Error verifying audit trail", err);
    }
  };

  const playVernacularAudio = async (warningType) => {
    try {
      const res = await fetch(`${API_BASE}/tts/audio?warning_type=${warningType}&lang=${selectedLang}`);
      if (res.ok) {
        const data = await res.json();
        if (data.audio_base64) {
          const audio = new Audio(data.audio_base64);
          audio.play().catch(e => console.warn("Audio autoplay blocked", e));
        } else {
          // Browser speech synthesis fallback
          const msg = new SpeechSynthesisUtterance("Warning: Please take medications as advised by your doctor.");
          window.speechSynthesis.speak(msg);
        }
      }
    } catch (err) {
      console.warn("TTS fallback", err);
    }
  };

  const handleScanComplete = (scanData) => {
    if (scanData?.extracted_drugs) {
      const drugNames = scanData.extracted_drugs.map(d => d.generic || d.identified_name);
      fetch(`${API_BASE}/safety/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: drugNames })
      })
      .then(r => r.json())
      .then(safetyReport => setSafetyAnalysis(safetyReport))
      .catch(err => console.error("Error analyzing scanned drugs:", err));
    }
  };

  const handleDoseUpdated = () => {
    setDoseUpdateCounter(prev => prev + 1);
    fetchAuditTrail();
  };

  const criticalInteractionsCount = safetyAnalysis?.interactions?.filter(i => i.severity === 'CRITICAL').length || 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Sticky Modern Top Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        patientName={prescriptionData?.patient_name || 'Mrs. Sunita Kulkarni'}
        patientAge={prescriptionData?.age || 68}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        isSseConnected={isSseConnected}
        criticalAlertCount={criticalInteractionsCount}
      />

      {/* Main App Canvas */}
      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px', flex: 1 }}>
        
        {/* Real-time Caregiver Missed Dose Escalation Banner */}
        {caregiverAlert && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 8px 30px rgba(244, 63, 94, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: '#f43f5e', padding: '10px', borderRadius: '50%', color: '#fff', display: 'flex' }}>
                <Bell size={20} className="animate-pulse" />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
                  CRITICAL MISSED DOSE ALERT: {caregiverAlert.drug_name} ({caregiverAlert.criticality})
                </div>
                <div style={{ fontSize: '0.8rem', color: '#fda4af', marginTop: '2px' }}>
                  {caregiverAlert.action_required || "Immediate patient check recommended. High risk of therapeutic failure."}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="tel:+919820011223"
                style={{
                  background: '#10b981',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Phone size={14} /> Call Patient
              </a>
              <button
                onClick={() => setCaregiverAlert(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem'
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* View 1: Prescription Scanner & OCR Studio (Hero) */}
        {activeTab === 'scanner' && (
          <ScannerStudio 
            onScanComplete={handleScanComplete}
            onNavigateToSafety={() => setActiveTab('safety')}
            currentPrescription={prescriptionData}
            onLoadPreset={(pid, data) => {
              setSelectedPreset(pid);
              setPrescriptionData(data.prescription);
              setSafetyAnalysis(data.safety_analysis);
            }}
          />
        )}

        {/* View 2: Dose Adherence & Regimen Hub */}
        {activeTab === 'adherence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ScheduleManager 
              patientId="patient_mrs_kulkarni_01" 
              onDoseUpdated={handleDoseUpdated} 
            />
            <AdherenceCalendar 
              patientId="patient_mrs_kulkarni_01" 
              onDoseUpdated={doseUpdateCounter} 
            />
          </div>
        )}

        {/* View 3: Deep Molecular Toxicology & DDI Studio */}
        {activeTab === 'safety' && (
          <SafetyStudio 
            safetyAnalysis={safetyAnalysis}
            currentMeds={prescriptionData?.medications || []}
            selectedLang={selectedLang}
            onPlayVernacular={playVernacularAudio}
          />
        )}

        {/* View 4: Caregiver Guardian Hub & 21 CFR Part 11 Vault */}
        {activeTab === 'caregiver' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <CaregiverDashboard 
              caregiverId="cg_rahul_01"
              activeAlerts={caregiverAlerts}
              onClearAlert={(idx) => setCaregiverAlerts(prev => prev.filter((_, i) => i !== idx))}
            />

            {/* Regulatory 21 CFR Part 11 Cryptographic Audit Trail */}
            <div style={{
              background: 'rgba(15, 21, 35, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Lock size={20} color="#8b5cf6" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                      21 CFR Part 11 Cryptographic Audit Ledger
                    </h3>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Tamper-evident SQLite WAL ledger with SHA-256 hash chaining and HMAC integrity verification
                  </p>
                </div>

                <button
                  onClick={verifyAuditLedger}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <RefreshCw size={15} />
                  Verify Ledger Integrity
                </button>
              </div>

              {verificationResult && (
                <div style={{
                  background: verificationResult.valid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                  border: `1px solid ${verificationResult.valid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: verificationResult.valid ? '#10b981' : '#f43f5e', fontWeight: 700, fontSize: '0.9rem' }}>
                    <ShieldCheck size={18} />
                    {verificationResult.compliance || "Integrity Verification Complete"}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                    Status: {verificationResult.status} • Total Records Verified: {verificationResult.verified_records} • Cryptographic Hash Chain Intact.
                  </p>
                </div>
              )}

              {/* Audit Log Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Timestamp</th>
                      <th style={{ padding: '10px' }}>Medication</th>
                      <th style={{ padding: '10px' }}>Action</th>
                      <th style={{ padding: '10px' }}>SHA-256 Current Hash</th>
                      <th style={{ padding: '10px' }}>Previous Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditRecords.slice(0, 15).map((rec, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 700, color: '#8b5cf6' }}>#{rec.id}</td>
                        <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{new Date(rec.timestamp).toLocaleTimeString()}</td>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: '#f8fafc' }}>{rec.molecule_name}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            background: rec.details?.status === 'TAKEN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                            color: rec.details?.status === 'TAKEN' ? '#10b981' : '#f43f5e',
                            padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700
                          }}>
                            {rec.details?.status || rec.action}
                          </span>
                        </td>
                        <td className="mono-tag" style={{ padding: '12px 10px', color: '#38bdf8' }}>
                          {rec.record_hash?.substring(0, 16)}...
                        </td>
                        <td className="mono-tag" style={{ padding: '12px 10px', color: '#64748b' }}>
                          {rec.prev_record_hash?.substring(0, 16)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* View 5: MedGuard AI Copilot */}
        {activeTab === 'copilot' && (
          <CopilotChat currentRegimen={prescriptionData?.medications || []} />
        )}

      </main>

    </div>
  );
}
