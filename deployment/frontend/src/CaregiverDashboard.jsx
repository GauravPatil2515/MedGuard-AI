import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Phone, Bell, CheckCircle2, AlertTriangle, 
  Clock, Activity, RefreshCw, FileText, ChevronRight, ShieldCheck
} from 'lucide-react';
import { Card, Button, Badge } from './UIPrimitives';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Banner: Caregiver Identity */}
      <Card style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            padding: '10px',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            display: 'flex'
          }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Rahul Kulkarni
              </h2>
              <Badge variant="neutral">Authorized Primary Proxy (Son)</Badge>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Emergency Proxy • SSE Real-Time Telemetry Dispatcher Active
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="safe">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-safe-text)', display: 'inline-block', marginRight: 4 }} />
            Telemetry Live
          </Badge>

          <Button
            onClick={fetchCaregiverData}
            variant="outline"
            size="sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Sync
          </Button>
        </div>
      </Card>

      {/* Real-time Alerts Banner if any active alerts */}
      {activeAlerts.length > 0 && (
        <div style={{
          background: 'var(--status-critical-bg)',
          border: '1px solid var(--status-critical-border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-critical-text)' }}>
            <Bell size={18} />
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
              Urgent Clinical Escalation Alerts ({activeAlerts.length})
            </h3>
          </div>

          {activeAlerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {alert.type === 'PRESCRIPTION_RISK_ALERT'
                    ? `Prescription Interaction Flagged (${alert.max_severity || 'Major'})`
                    : `${alert.drug_name || 'High Risk Medication'} — Critical Missed Dose`}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--status-critical-text)', marginTop: '2px' }}>
                  {alert.action_required || 'Immediate caregiver check required.'}
                </div>
                {alert.interactions && alert.interactions.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Interactions: {alert.interactions.map(i => `${i.drug_a} ↔ ${i.drug_b} (${i.risk_label})`).join(', ')}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Logged at: {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="tel:+919820011223"
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius)',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Phone size={13} />
                  Call Patient
                </a>
                {onClearAlert && (
                  <Button
                    onClick={() => onClearAlert(idx)}
                    variant="outline"
                    size="sm"
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Patient Selector + Patient Detailed Monitor */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        
        {/* Left Column: Authorized Patients List */}
        <Card style={{ height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Authorized Patients
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {patients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  style={{
                    background: isSelected ? 'var(--bg-app)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {p.name}
                    </div>
                    <ChevronRight size={14} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Age: {p.age} • Access: {p.access_level}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.diagnosis}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Selected Patient Status, Schedules & FDA Safety */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {selectedPatient && (
            <>
              {/* Patient Quick Header Card */}
              <Card style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedPatient.name}
                    </h3>
                    <Badge variant="neutral">Age {selectedPatient.age}</Badge>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {selectedPatient.diagnosis}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    30-Day Adherence
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-safe-text)' }}>
                    {adherenceData?.adherence_rate ?? 96.4}%
                  </div>
                </div>
              </Card>

              {/* Today's Schedule Live Overview */}
              <Card>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                  Today's Patient Dose Status
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {patientSchedule.map((item, idx) => {
                    const isTaken = item.status === 'TAKEN';
                    return (
                      <div
                        key={idx}
                        style={{
                          background: isTaken ? 'var(--status-safe-bg)' : 'var(--bg-app)',
                          border: `1px solid ${isTaken ? 'var(--status-safe-border)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius)',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{item.drug_name}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '8px' }}>
                            ({item.dosage}) — {item.meal_timing}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {item.scheduled_time.split('T')[1]?.substring(0, 5)}
                          </span>
                          <Badge variant={isTaken ? 'safe' : 'warning'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* OpenFDA Real-World Adverse Event Signals */}
              {fdaSignals && fdaSignals.has_adverse_events && (
                <Card>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--accent-primary)' }} />
                    OpenFDA Real-World Signal Monitoring (FAERS)
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {Object.entries(fdaSignals.top_adverse_events || {}).map(([drug, signals]) => (
                      <div
                        key={drug}
                        style={{
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius)',
                          padding: '10px'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem', marginBottom: '6px' }}>
                          {drug} Signals
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {signals.slice(0, 3).map((sig, sIdx) => (
                            <li key={sIdx} style={{ marginBottom: '2px' }}>
                              {sig.reaction} ({sig.count.toLocaleString()} cases)
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
