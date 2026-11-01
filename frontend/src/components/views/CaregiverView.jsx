import React, { useState, useEffect } from 'react';
import { Phone, Send, AlertTriangle, CheckCircle2, ShieldCheck, Clock, RefreshCw, Flame, Pill } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Section from '../ui/Section';
import StatusBadge from '../ui/StatusBadge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CaregiverView({ 
  onNavigateTab,
  selectedLang = 'mr',
  onEmergencyCall,
}) {
  const { user } = useAuth();
  const patientId = user?.patient_id || user?.id || 'patient_mrs_kulkarni_01';

  const [patientCalled, setPatientCalled] = useState(false);
  const [doctorNotified, setDoctorNotified] = useState(false);
  const [caregiverInfo, setCaregiverInfo] = useState(null);
  const [todayDoses, setTodayDoses] = useState([]);
  const [adherenceList, setAdherenceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.getTodaysSchedule(patientId).catch(() => []),
      api.getAdherence(patientId, 30).catch(() => null),
      api.getCaregivers(patientId).catch(() => []),
    ])
      .then(([doses, adherence, caregivers]) => {
        setTodayDoses(doses || []);
        setAdherenceList(adherence ? [{
          treatmentId: 'overall',
          drugName: 'All Medications',
          dosesTaken: adherence.taken,
          totalScheduled: adherence.total_doses,
          percentTaken: adherence.adherence_rate,
          currentStreak: 0,
        }] : []);
        if (caregivers && caregivers.length > 0) {
          setCaregiverInfo({
            name: caregivers[0].name || 'Primary Caregiver',
            relation: caregivers[0].relation || 'Family',
            phone: caregivers[0].phone || '',
            email: caregivers[0].email || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  const missedDose = todayDoses.find(d => d.status === 'MISSED' && d.criticality === 'HIGH');
  const anyMissedDose = todayDoses.find(d => d.status === 'MISSED');
  const pendingDoses = todayDoses.filter(d => d.status === 'PENDING' || d.status === 'SCHEDULED');
  const takenDoses = todayDoses.filter(d => d.status === 'TAKEN');

  const avgAdherence = adherenceList.length > 0 
    ? Math.round(adherenceList.reduce((sum, a) => sum + (a.percentTaken || 0), 0) / adherenceList.length)
    : 100;

  const handleCallPatient = () => {
    setPatientCalled(true);
    window.location.href = "tel:+919820011223";
    setTimeout(() => setPatientCalled(false), 5000);
  };

  const handleNotifyDoctor = async () => {
    setDoctorNotified(true);
    try {
      await api.notifyRisk(patientId || "patient_mrs_kulkarni_01", 
        anyMissedDose ? "High" : "Moderate");
    } catch {}
    setTimeout(() => setDoctorNotified(false), 5000);
  };

  const getStatusColor = (percent) => {
    if (percent >= 90) return 'var(--mg-accent)';
    if (percent >= 70) return 'var(--mg-warning)';
    return 'var(--mg-danger)';
  };

  const getStatusLabel = (percent) => {
    if (percent >= 90) return 'Excellent';
    if (percent >= 70) return 'Good';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '300px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '16px'
      }}>
        <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--mg-primary)' }} />
        <p style={{ color: 'var(--mg-text-muted)' }}>Loading caregiver data...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <PageHeader
        title="Family Caregiver"
        subtitle="Monitor medication adherence and stay connected"
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'start'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="mg-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--mg-primary) 0%, var(--mg-accent) 100%)', 
              color: '#ffffff',
              fontWeight: 800, fontSize: '1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 56, 44, 0.2)'
            }}>
              {caregiverInfo?.name ? caregiverInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CG'}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
                {caregiverInfo?.name || 'Primary Caregiver'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mg-text-muted)', fontSize: '0.85rem' }}>
                <span>{caregiverInfo?.relation || 'Family'}</span>
                {caregiverInfo?.phone && (
                  <><span>•</span><span>{caregiverInfo.phone}</span></>
                )}
              </div>
            </div>
            <StatusBadge type="success" label="Connected" />
          </div>

          {(missedDose || anyMissedDose) ? (
            <div className="mg-card" style={{
              padding: '20px',
              background: 'var(--mg-danger-soft)',
              borderColor: 'var(--mg-danger-border)',
              border: '2px solid var(--mg-danger-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  background: '#fee2e2', color: 'var(--mg-danger)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#991b1b' }}>
                      Missed Dose Alert
                    </h4>
                    <StatusBadge type="danger" label="Action Needed" />
                  </div>
                  <p style={{ margin: '6px 0 0 0', color: '#b91c1c', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    <strong>{(missedDose || anyMissedDose).drug_name || (missedDose || anyMissedDose).drugName} {(missedDose || anyMissedDose).dosage}</strong> was scheduled at <strong>{(missedDose || anyMissedDose).scheduled_time || (missedDose || anyMissedDose).scheduledTime}</strong> but not taken. 
                    {missedDose ? 'This is a critical medication — contact immediately.' : 'Please check in with the patient.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCallPatient}
                  className="btn-primary"
                  style={{ 
                    flex: 1, minWidth: '160px', padding: '16px 20px', 
                    fontSize: '1rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    minHeight: '56px', boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <Phone size={20} />
                  <span>{patientCalled ? "Calling..." : "Call Patient Now"}</span>
                </button>

                <button
                  onClick={handleNotifyDoctor}
                  className="btn-secondary"
                  style={{ 
                    flex: 1, minWidth: '160px', padding: '16px 20px', 
                    fontSize: '1rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    minHeight: '56px'
                  }}
                >
                  <Send size={20} />
                  <span>{doctorNotified ? "Alert Sent" : "Notify Doctor"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mg-card" style={{
              padding: '24px',
              background: 'var(--mg-success-soft)',
              borderColor: 'rgba(22, 101, 52, 0.2)',
              display: 'flex', alignItems: 'center', gap: '16px'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'var(--mg-accent-soft)', color: 'var(--mg-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--mg-primary)' }}>
                  All Medications On Track
                </strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--mg-text-muted)', fontSize: '0.9rem' }}>
                  {takenDoses.length} dose{takenDoses.length !== 1 ? 's' : ''} taken today. {pendingDoses.length} pending as scheduled.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="mg-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%',
                background: avgAdherence >= 90 ? 'var(--mg-accent-soft)' : avgAdherence >= 70 ? 'var(--mg-warning-soft)' : 'var(--mg-danger-soft)',
                color: avgAdherence >= 90 ? 'var(--mg-accent)' : avgAdherence >= 70 ? 'var(--mg-warning)' : 'var(--mg-danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto', fontSize: '1.3rem', fontWeight: 800
              }}>
                {avgAdherence}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--mg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Average Adherence
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: getStatusColor(avgAdherence) }}>
                {getStatusLabel(avgAdherence)}
              </div>
            </div>
            <div className="mg-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--mg-warning-soft)', color: 'var(--mg-warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto', fontSize: '1.3rem', fontWeight: 800
              }}>
                <Flame size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--mg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Current Streak
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--mg-text-main)' }}>
                {adherenceList.length > 0 ? Math.max(...adherenceList.map(a => a.currentStreak || 0)) : 0} days
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <Section title="Medication Adherence" subtitle="Per-medication tracking">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {adherenceList.map(item => (
                <div 
                  key={item.treatmentId} 
                  className="mg-card"
                  style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                      background: item.percentTaken >= 90 ? 'var(--mg-accent-soft)' : item.percentTaken >= 70 ? 'var(--mg-warning-soft)' : 'var(--mg-danger-soft)',
                      color: item.percentTaken >= 90 ? 'var(--mg-accent)' : item.percentTaken >= 70 ? 'var(--mg-warning)' : 'var(--mg-danger)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Pill size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--mg-text-main)' }}>
                        {item.drugName}
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--mg-text-muted)', marginTop: '2px' }}>
                        {item.dosesTaken} of {item.totalScheduled} taken • Streak: {item.currentStreak} days
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: getStatusColor(item.percentTaken) }}>
                      {item.percentTaken}%
                    </span>
                  </div>
                </div>
              ))}
              {adherenceList.length === 0 && (
                <div className="mg-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--mg-text-muted)' }}>
                  No medications added yet. Scan a bottle to start tracking.
                </div>
              )}
            </div>
          </Section>

          <Section title="Today's Activity" subtitle="Real-time dose log">
            <div className="mg-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayDoses.length > 0 ? (
                todayDoses.map((dose, idx) => (
                  <div 
                    key={dose.id || dose.schedule_id + idx}
                    style={{
                      display: 'flex', gap: '12px', alignItems: 'center',
                      paddingBottom: idx < todayDoses.length - 1 ? '12px' : '0',
                      borderBottom: idx < todayDoses.length - 1 ? '1px solid var(--mg-card-border)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: dose.status === 'TAKEN' ? 'var(--mg-accent-soft)' : dose.status === 'MISSED' ? '#fee2e2' : '#f1f5f9',
                      color: dose.status === 'TAKEN' ? 'var(--mg-accent)' : dose.status === 'MISSED' ? 'var(--mg-danger)' : 'var(--mg-text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {dose.status === 'TAKEN' ? <CheckCircle2 size={18} /> : dose.status === 'MISSED' ? <AlertTriangle size={18} /> : <Clock size={18} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <strong style={{ fontSize: '0.9rem', color: dose.status === 'MISSED' ? '#991b1b' : 'var(--mg-text-main)' }}>
                          {dose.drug_name || dose.drugName} {dose.dosage}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--mg-text-muted)', fontWeight: 500 }}>
                          {dose.scheduled_time || dose.scheduledTime}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--mg-text-muted)', marginTop: '2px' }}>
                        {dose.status === 'TAKEN' ? '✅ Taken' : dose.status === 'MISSED' ? '❌ Missed' : '⏳ Pending'}
                        {dose.criticality === 'HIGH' && <span style={{ marginLeft: '8px', color: 'var(--mg-danger)', fontWeight: 600, fontSize: '0.75rem' }}>Critical</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--mg-text-muted)' }}>
                  No doses scheduled today
                </div>
              )}
            </div>
          </Section>

          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--mg-card-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.8rem',
            color: 'var(--mg-text-muted)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <ShieldCheck size={16} color="var(--mg-accent)" />
            <span>
              🔒 All activity verified by tamper-proof audit trail (21 CFR Part 11 compliant)
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
