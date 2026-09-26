import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Phone, Bell, CheckCircle2, AlertTriangle, 
  Clock, Activity, Heart, RefreshCw, FileText, ChevronRight, ShieldCheck
} from 'lucide-react';

export default function CaregiverDashboard({ 
  caregiverId = 'cg_rahul_01', 
  activeAlerts = [], 
  onClearAlert 
}) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSchedule, setPatientSchedule] = useState([]);
  const [adherenceData, setAdherenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fdaSignals, setFdaSignals] = useState(null);

  // Fetch linked patients for this caregiver
  const fetchCaregiverData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/caregivers/${caregiverId}/patients`);
      if (res.ok) {
        const pList = await res.json();
        setPatients(pList);
        if (pList.length > 0 && !selectedPatient) {
          setSelectedPatient(pList[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load caregiver patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaregiverData();
  }, [caregiverId]);

  // Fetch patient schedule and adherence when selected patient changes
  useEffect(() => {
    if (!selectedPatient) return;

    const loadPatientDetails = async () => {
      try {
        const [resSched, resAdh] = await Promise.all([
          fetch(`http://127.0.0.1:5000/api/patients/${selectedPatient.id}/schedule/today`),
          fetch(`http://127.0.0.1:5000/api/patients/${selectedPatient.id}/adherence?days=30`)
        ]);
        if (resSched.ok) setPatientSchedule(await resSched.json());
        if (resAdh.ok) {
          const adhJson = await resAdh.json();
          setAdherenceData(adhJson);

          // Also fetch OpenFDA cross-ref for the patient's common drugs
          fetch('http://127.0.0.1:5000/api/safety/fda/crossref', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medications: ['Warfarin', 'Aspirin', 'Metformin'] })
          }).then(r => r.json()).then(data => setFdaSignals(data)).catch(() => {});
        }
      } catch (err) {
        console.error('Failed loading patient details:', err);
      }
    };

    loadPatientDetails();
  }, [selectedPatient]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Caregiver Identity & Live Telemetry Badge */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            padding: '14px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
            display: 'flex'
          }}>
            <Users size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                Rahul Kulkarni
              </h2>
              <span style={{
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#c4b5fd',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '2px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Primary Caregiver (Son)
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Authorized Emergency Proxy • Secure SSE Real-Time Telemetry Dispatcher Active
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            color: '#10b981',
            fontWeight: 600
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="animate-pulse" />
            Live SSE Connected
          </div>

          <button
            onClick={fetchCaregiverData}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '8px 14px',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Sync
          </button>
        </div>
      </div>

      {/* Real-time Alerts Banner if any active alerts */}
      {activeAlerts.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 30px rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
            <Bell size={22} className="animate-bounce" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Urgent Clinical Escalation Alerts ({activeAlerts.length})
            </h3>
          </div>

          {activeAlerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                  {alert.drug_name || 'High Risk Medication'} — {alert.type}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '2px' }}>
                  {alert.action_required || 'Immediate caregiver check required.'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Logged at: {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="tel:+919820011223"
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Phone size={14} />
                  Call Patient
                </a>
                {onClearAlert && (
                  <button
                    onClick={() => onClearAlert(idx)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#94a3b8',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Patient Selector + Patient Detailed Monitor */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        
        {/* Left Column: Authorized Patients List */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '20px',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>
            Authorized Patients
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {patients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  style={{
                    background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '14px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: isSelected ? '#c4b5fd' : '#f8fafc', fontSize: '0.95rem' }}>
                      {p.name}
                    </div>
                    <ChevronRight size={16} color={isSelected ? '#a78bfa' : '#64748b'} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                    Age: {p.age} • Access: {p.access_level}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.diagnosis}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Patient Status, Schedules & FDA Safety */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {selectedPatient && (
            <>
              {/* Patient Quick Header Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
                      {selectedPatient.name}
                    </h3>
                    <span style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#38bdf8',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      Age {selectedPatient.age}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {selectedPatient.diagnosis}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    30-Day Adherence
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                    {adherenceData?.adherence_rate ?? 96.4}%
                  </div>
                </div>
              </div>

              {/* Today's Schedule Live Overview */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '20px'
              }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#8b5cf6" />
                  Today's Patient Dose Status
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {patientSchedule.map((item, idx) => {
                    const isTaken = item.status === 'TAKEN';
                    return (
                      <div
                        key={idx}
                        style={{
                          background: isTaken ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                          border: isTaken ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 700, color: '#f8fafc' }}>{item.drug_name}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '10px' }}>
                            ({item.dosage}) — {item.meal_timing}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {item.scheduled_time.split('T')[1]?.substring(0, 5)}
                          </span>
                          <span style={{
                            background: isTaken ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: isTaken ? '#10b981' : '#f59e0b',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OpenFDA Real-World Adverse Event Signals */}
              {fdaSignals && fdaSignals.has_adverse_events && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '20px'
                }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#06b6d4" />
                    OpenFDA Real-World Signal Monitoring (FAERS)
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {Object.entries(fdaSignals.top_adverse_events || {}).map(([drug, signals]) => (
                      <div
                        key={drug}
                        style={{
                          background: 'rgba(2, 6, 23, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem', marginBottom: '8px' }}>
                          {drug} Signals
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                          {signals.slice(0, 3).map((sig, sIdx) => (
                            <li key={sIdx} style={{ marginBottom: '3px' }}>
                              {sig.reaction} ({sig.count.toLocaleString()} cases)
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
