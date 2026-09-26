import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Heart, AlertTriangle, Volume2, 
  CheckCircle2, XCircle, Clock, FileText, Lock, RefreshCw, 
  User, Shield, Activity, Bell, Info, Bot
} from 'lucide-react';
import CopilotChat from './CopilotChat';
import AdherenceCalendar from './AdherenceCalendar';
import ScheduleManager from './ScheduleManager';
import CaregiverDashboard from './CaregiverDashboard';

const API_BASE = "http://localhost:5000/api";

export default function App() {
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'caregiver' | 'copilot'
  const [selectedPreset, setSelectedPreset] = useState('mrs_kulkarni_cardiac');
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [safetyAnalysis, setSafetyAnalysis] = useState(null);
  const [auditRecords, setAuditRecords] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [caregiverAlert, setCaregiverAlert] = useState(null);
  const [caregiverAlerts, setCaregiverAlerts] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [selectedLang, setSelectedLang] = useState('mr'); // 'mr' | 'hi' | 'en'
  const [takenStatus, setTakenStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [doseUpdateCounter, setDoseUpdateCounter] = useState(0);

  const handleDoseUpdated = () => {
    setDoseUpdateCounter(prev => prev + 1);
    fetchAuditTrail();
  };

  // Fetch Preset on load or change
  useEffect(() => {
    fetchPreset(selectedPreset);
    fetchAuditTrail();
  }, [selectedPreset]);

  // Setup Server-Sent Events (SSE) for Caregiver Live Alerts
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE}/caregiver/stream`);
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
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rx/preset/${presetId}`);
      const data = await res.json();
      setPrescriptionData(data.prescription);
      setSafetyAnalysis(data.safety_analysis);
      setTakenStatus({});
    } catch (err) {
      console.error("Error loading preset", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit/trail`);
      const data = await res.json();
      setAuditRecords(data.records || []);
    } catch (err) {
      console.error("Error fetching audit trail", err);
    }
  };

  const verifyAuditLedger = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit/verify`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error("Error verifying audit trail", err);
    }
  };

  const handleLogDose = async (drugName, dosage, status, criticality) => {
    try {
      const res = await fetch(`${API_BASE}/adherence/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: prescriptionData ? prescriptionData.patient_name : "patient_01",
          drug_name: drugName,
          dosage: dosage,
          status: status,
          verification_type: "1-CLICK",
          criticality: criticality
        })
      });
      const data = await res.json();
      setTakenStatus(prev => ({ ...prev, [drugName]: status }));
      fetchAuditTrail();
      if (data.critical_alert_triggered) {
        setCaregiverAlert({
          type: "CRITICAL_MISSED_DOSE_ALERT",
          drug_name: drugName,
          dosage: dosage,
          criticality: criticality,
          timestamp: data.timestamp,
          action_required: "Immediate caregiver call or check-in required.",
          audit_hash: data.current_hash
        });
      }
    } catch (err) {
      console.error("Error logging dose", err);
    }
  };

  const playVernacularAudio = async (warningType) => {
    setPlayingAudio(true);
    try {
      const res = await fetch(`${API_BASE}/tts/audio?warning_type=${warningType}&lang=${selectedLang}`);
      const data = await res.json();
      if (data.success && data.audio_base64) {
        const audio = new Audio(data.audio_base64);
        audio.play();
      } else {
        // Fallback to Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.text);
          utterance.lang = selectedLang === 'mr' ? 'mr-IN' : (selectedLang === 'hi' ? 'hi-IN' : 'en-US');
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error("TTS playback error", err);
    } finally {
      setPlayingAudio(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Header & Dual Persona Switcher */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '10px', borderRadius: '12px' }}>
              <ShieldAlert size={28} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MedGuard AI
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Neuro-Symbolic Medication Safety & 21 CFR Part 11 Caregiver Guardian Platform
              </p>
            </div>
          </div>
        </div>

        {/* Persona Switcher Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => setActiveTab('patient')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s',
              background: activeTab === 'patient' ? '#3b82f6' : 'transparent',
              color: activeTab === 'patient' ? '#ffffff' : '#94a3b8'
            }}
          >
            <User size={18} />
            <span>Patient Portal</span>
          </button>
          <button 
            onClick={() => setActiveTab('caregiver')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s',
              background: activeTab === 'caregiver' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'caregiver' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Shield size={18} />
            <span>Caregiver Guardian</span>
            {caregiverAlert && (
              <span style={{ background: '#f43f5e', color: '#fff', borderRadius: '50%', width: '8px', height: '8px', display: 'inline-block' }} />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('copilot')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s',
              background: activeTab === 'copilot' ? '#06b6d4' : 'transparent',
              color: activeTab === 'copilot' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Bot size={18} />
            <span>Copilot & OCR</span>
          </button>
        </div>
      </header>

      {/* Preset Patient Scenario Selector */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={18} color="#06b6d4" />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
            Clinical Persona:
          </span>
          <select 
            value={selectedPreset} 
            onChange={(e) => setSelectedPreset(e.target.value)}
            style={{ background: '#111827', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}
          >
            <option value="mrs_kulkarni_cardiac">Mrs. Sunita Kulkarni (68y, Post-CABG Polypharmacy)</option>
            <option value="mr_sharma_diabetic">Mr. Ramesh Sharma (62y, T2D & HTN Polypharmacy)</option>
          </select>
        </div>

        {/* Vernacular Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={18} color="#3b82f6" />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Voice Vernacular:</span>
          {['mr', 'hi', 'en'].map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              style={{
                background: selectedLang === lang ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                color: selectedLang === lang ? '#fff' : '#94a3b8',
                border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
              }}
            >
              {lang === 'mr' ? 'मराठी' : (lang === 'hi' ? 'हिंदी' : 'EN')}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Caregiver Alert Banner (if critical missed dose) */}
      {caregiverAlert && (
        <div className="glass-panel glass-panel-glow-rose" style={{ padding: '18px 24px', marginBottom: '24px', background: 'rgba(244, 63, 94, 0.12)', borderLeft: '6px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: '#f43f5e', padding: '8px', borderRadius: '50%', color: '#fff' }}>
                <Bell size={24} className="animate-pulse-subtle" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fda4af' }}>
                  CRITICAL DOSE ESCALATION: {caregiverAlert.drug_name} ({caregiverAlert.dosage})
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  {caregiverAlert.action_required} • Logged to 21 CFR Part 11 Hash: <span className="mono-tag" style={{ color: '#06b6d4' }}>{caregiverAlert.audit_hash.substring(0, 16)}...</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setCaregiverAlert(null)}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      {activeTab === 'patient' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          
          {/* Column 1: Daily Dose Schedule & 1-Click Verification */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Today's Medication Schedule</h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tap "Took It" when taken, or simulate a missed dose</p>
              </div>
              <Clock size={22} color="#06b6d4" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {prescriptionData && prescriptionData.medications.map((med, idx) => {
                const status = takenStatus[med.raw_name];
                return (
                  <div key={idx} style={{ 
                    background: status === 'TAKEN' ? 'rgba(16, 185, 129, 0.1)' : (status === 'MISSED' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.03)'),
                    border: `1px solid ${status === 'TAKEN' ? 'rgba(16, 185, 129, 0.3)' : (status === 'MISSED' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255,255,255,0.08)')}`,
                    borderRadius: '12px', padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>{med.raw_name}</span>
                        <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: '#06b6d4', fontWeight: '600' }}>{med.dosage}</span>
                      </div>
                      <span style={{
                        background: med.criticality === 'HIGH' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: med.criticality === 'HIGH' ? '#f43f5e' : '#60a5fa',
                        padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700'
                      }}>
                        {med.criticality} CRITICALITY
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', display: 'flex', gap: '14px' }}>
                      <span>🕒 {med.timing}</span>
                      <span>🔄 {med.frequency}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleLogDose(med.raw_name, med.dosage, 'TAKEN', med.criticality)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: status === 'TAKEN' ? '#10b981' : 'rgba(16, 185, 129, 0.2)',
                          color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                          fontWeight: '700', fontSize: '0.85rem'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Took It</span>
                      </button>
                      <button
                        onClick={() => handleLogDose(med.raw_name, med.dosage, 'MISSED', med.criticality)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: status === 'MISSED' ? '#f43f5e' : 'rgba(244, 63, 94, 0.2)',
                          color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                          fontWeight: '700', fontSize: '0.85rem'
                        }}
                      >
                        <XCircle size={16} />
                        <span>Missed Dose</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Clinical Safety Warnings & Vernacular Voice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Severe Interaction Warning Box */}
            {safetyAnalysis && safetyAnalysis.interactions.length > 0 && (
              <div className="glass-panel glass-panel-glow-rose" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={22} color="#f43f5e" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fda4af' }}>
                      Critical Safety Hazard Detected
                    </h3>
                  </div>
                  <button
                    onClick={() => playVernacularAudio('warfarin_bleeding_warning')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: '#fff',
                      border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem'
                    }}
                  >
                    <Volume2 size={16} />
                    <span>{selectedLang === 'mr' ? 'मराठीत ऐका' : (selectedLang === 'hi' ? 'हिंदी में सुनें' : 'Listen')}</span>
                  </button>
                </div>

                {safetyAnalysis.interactions.map((inter, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#f43f5e', marginBottom: '4px' }}>
                      ⚠️ {inter.drug_a} + {inter.drug_b}: {inter.title}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>
                      {inter.mechanism}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: '600' }}>
                      👉 Action: {inter.action}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Molecular Cardiotoxicity & Conformal Confidence Interval */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Heart size={22} color="#f43f5e" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
                  Molecular hERG Cardiotoxicity & Conformal Bounds
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {safetyAnalysis && safetyAnalysis.drugs.map((drug, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{drug.generic}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Class: {drug.class}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: drug.cardiotox.liability === 'HIGH' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: drug.cardiotox.liability === 'HIGH' ? '#f43f5e' : '#10b981',
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700'
                      }}>
                        hERG: {Math.round(drug.cardiotox.probability * 100)}% ({drug.cardiotox.liability})
                      </span>
                      <div className="mono-tag" style={{ color: '#06b6d4', marginTop: '4px', fontSize: '0.7rem' }}>
                        95% CI: [{Math.round(drug.cardiotox.conformal_ci_95[0] * 100)}% - {Math.round(drug.cardiotox.conformal_ci_95[1] * 100)}%]
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Food-Drug Warnings */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <AlertTriangle size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Food & Dietary Warnings</h3>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {safetyAnalysis && safetyAnalysis.food_warnings.map((fw, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: fw.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f8fafc">$1</strong>') }} />
                ))}
              </ul>
            </div>

          </div>
          </div>

          {/* 30-Day Adherence Calendar & Live Schedule Manager */}
          <ScheduleManager onDoseUpdated={handleDoseUpdated} />
          <AdherenceCalendar onDoseUpdated={doseUpdateCounter} />

        </div>
      )}

      {/* CAREGIVER GUARDIAN MODE */}
      {activeTab === 'caregiver' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <CaregiverDashboard 
            caregiverId="cg_rahul_01" 
            activeAlerts={caregiverAlerts}
            onClearAlert={(idx) => setCaregiverAlerts(prev => prev.filter((_, i) => i !== idx))}
          />
          
          {/* Caregiver Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Patient Under Care</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '6px', color: '#f8fafc' }}>
                {prescriptionData ? prescriptionData.patient_name : "Loading..."}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4', marginTop: '4px' }}>
                {prescriptionData ? prescriptionData.diagnosis : ""}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Polypharmacy Safety Status</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '6px', color: safetyAnalysis?.overall_status === 'CRITICAL' ? '#f43f5e' : '#10b981' }}>
                {safetyAnalysis ? safetyAnalysis.overall_status : "CHECKING..."}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                {safetyAnalysis?.interactions.length || 0} Critical Interactions Identified
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>21 CFR Part 11 Ledger Status</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '6px', color: '#10b981' }}>
                IMMUTABLE & AUDITABLE
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                {auditRecords.length} Cryptographically Chained Records
              </div>
            </div>
          </div>

          {/* 21 CFR Part 11 Cryptographic Audit Trail Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={22} color="#8b5cf6" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    21 CFR Part 11 Tamper-Evident Audit Trail
                  </h2>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                  Append-only SQLite WAL ledger with SHA-256 hash chaining and HMAC digital signatures
                </p>
              </div>

              <button
                onClick={verifyAuditLedger}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem'
                }}
              >
                <RefreshCw size={16} />
                <span>Verify Ledger Integrity</span>
              </button>
            </div>

            {verificationResult && (
              <div style={{
                background: verificationResult.valid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                border: `1px solid ${verificationResult.valid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                borderRadius: '10px', padding: '14px 18px', marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: verificationResult.valid ? '#10b981' : '#f43f5e', fontWeight: '700' }}>
                  <ShieldCheck size={20} />
                  <span>{verificationResult.compliance || "Integrity Verification Complete"}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
                  Status: {verificationResult.status} • Total Records Verified: {verificationResult.verified_records} • Cryptographic Checksum Passed.
                </p>
              </div>
            )}

            {/* Audit Log Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                    <th style={{ padding: '10px' }}>Medication</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>SHA-256 Current Hash</th>
                    <th style={{ padding: '10px' }}>Previous Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {auditRecords.map((rec, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '700', color: '#8b5cf6' }}>#{rec.id}</td>
                      <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{new Date(rec.timestamp).toLocaleTimeString()}</td>
                      <td style={{ padding: '12px 10px', fontWeight: '600' }}>{rec.molecule_name}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          background: rec.details?.status === 'TAKEN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: rec.details?.status === 'TAKEN' ? '#10b981' : '#f43f5e',
                          padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700'
                        }}>
                          {rec.details?.status || 'LOGGED'}
                        </span>
                      </td>
                      <td className="mono-tag" style={{ padding: '12px 10px', color: '#06b6d4' }}>
                        {rec.record_hash?.substring(0, 16)}...
                      </td>
                      <td className="mono-tag" style={{ padding: '12px 10px', color: '#64748b' }}>
                        {rec.prev_record_hash?.substring(0, 16)}...
                      </td>
                    </tr>
                  ))}
                  {auditRecords.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        No adherence records logged yet. Switch to Patient Portal to record doses.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Persona View: MedGuard Copilot & OCR */}
      {activeTab === 'copilot' && (
        <CopilotChat currentRegimen={prescriptionData?.medications || []} />
      )}

    </div>
  );
}
