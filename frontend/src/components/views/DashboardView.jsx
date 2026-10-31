import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, ShieldCheck, Volume2, Bell } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Section from '../ui/Section';
import MedicationCard from '../ui/MedicationCard';
import StatusBadge from '../ui/StatusBadge';

const API_BASE = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : "http://localhost:5000/api";

export default function DashboardView({
  patientData,
  patientRecord,
  onNavigateTab,
  onDoseAction,
  selectedLang = 'mr',
  onEmergencyCall
}) {

  // Dynamically derived from single source of truth (patientRecord)
  const doses = patientRecord?.todayDoses || [];
  const activeTreatments = (patientRecord?.treatments || []).filter(t => t.status === 'active');
  const riskEvents = patientRecord?.riskEvents || [];
  const unresolvedRisks = riskEvents.filter(r => r.status === 'unresolved');
  const takenCount = doses.filter(d => d.status === 'TAKEN').length;
  const adherenceRate = doses.length > 0 ? Math.round((takenCount / doses.length) * 100) : 100;

  // Bottle inventory data (mock - in real app would come from backend)
  const bottleInventory = {
    'Warfarin': { remaining: 24, total: 30 },
    'Amiodarone': { remaining: 18, total: 30 },
    'Pantoprazole': { remaining: 26, total: 30 },
    'Glimepiride': { remaining: 22, total: 30 },
    'Combiflam': { remaining: 8, total: 15 }
  };

  const [playingDoseId, setPlayingDoseId] = useState(null);

  const handleTakeDoseClick = (doseId) => {
    if (onDoseAction) {
      onDoseAction(doseId, 'TAKEN');
    }
  };

  const handlePlayAudio = async (dose) => {
    setPlayingDoseId(dose.id);
    try {
      // Determine warning type based on drug
      let warningType = 'missed_dose_warning';
      const drugLower = dose.drugName.toLowerCase();
      if (drugLower.includes('warfarin') || drugLower.includes('combiflam')) {
        warningType = 'warfarin_bleeding_warning';
      }
      
      const res = await fetch(`${API_BASE}/tts/audio?warning_type=${warningType}&lang=${selectedLang}`);
      const data = await res.json();
      
      if (data.success && data.audio_base64) {
        const audio = new Audio(data.audio_base64);
        audio.onended = () => setPlayingDoseId(null);
        audio.onerror = () => setPlayingDoseId(null);
        await audio.play();
      } else {
        // Fallback to browser speech synthesis
        const text = dose.drugName === 'Warfarin' 
          ? 'Take Warfarin 5 milligrams after dinner. This is a critical blood thinner. Do not skip doses.'
          : `Take ${dose.drugName} ${dose.dosage} ${dose.timing.toLowerCase()}.`;
        
        if ('speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance(text);
          msg.lang = selectedLang === 'mr' ? 'mr-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-US';
          msg.onend = () => setPlayingDoseId(null);
          msg.onerror = () => setPlayingDoseId(null);
          window.speechSynthesis.speak(msg);
        } else {
          setTimeout(() => setPlayingDoseId(null), 2500);
        }
      }
    } catch (err) {
      console.error('TTS error:', err);
      setPlayingDoseId(null);
    }
  };

  const getTimeBadge = (scheduledTime) => {
    const hour = parseInt(scheduledTime?.split(':')[0] || '0');
    if (hour < 12) return 'Morning Dose';
    if (hour < 17) return 'Afternoon Dose';
    return 'Evening Dose';
  };

  const getFoodInstruction = (timing) => {
    const t = timing?.toLowerCase() || '';
    if (t.includes('breakfast')) return 'Take with breakfast';
    if (t.includes('dinner') || t.includes('evening')) return 'Take with dinner';
    if (t.includes('lunch') || t.includes('afternoon')) return 'Take with lunch';
    if (t.includes('before')) return 'Take before meal';
    return 'Take with food';
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header - Simplified */}
      <PageHeader
        title="Today's Pills"
        subtitle={`${doses.filter(d => d.status === 'PENDING').length} dose${doses.filter(d => d.status === 'PENDING').length !== 1 ? 's' : ''} due • ${adherenceRate}% taken today`}
        action={
          <button 
            onClick={() => onNavigateTab && onNavigateTab('scanner')}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <span>Scan Bottle</span>
            <ArrowRight size={15} />
          </button>
        }
      />

      {/* Safety Alert Banner - Plain Language */}
      {unresolvedRisks.length > 0 && (
        <div 
          onClick={() => onNavigateTab && onNavigateTab('safety')}
          className="mg-card"
          style={{
            padding: '16px 20px',
            background: 'var(--mg-danger-soft)',
            borderColor: 'var(--mg-danger-border)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: '#fee2e2',
              color: 'var(--mg-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991b1b' }}>
                  Safety Warning
                </span>
                <StatusBadge type="danger" label={`${unresolvedRisks.length} clash${unresolvedRisks.length > 1 ? 'es' : ''} detected`} />
              </div>
              <p style={{ color: '#b91c1c', marginTop: '4px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {unresolvedRisks.map((r, i) => (
                  <React.Fragment key={r.id}>
                    <strong>{r.drugPair?.join(' + ')}</strong>: {r.description?.slice(0, 150)}
                    {i < unresolvedRisks.length - 1 && '; '}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigateTab && onNavigateTab('safety'); }}
            className="btn-ghost"
            style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-danger)', borderColor: 'var(--mg-danger)' }}
          >
            View Details & What to Do
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* All Clear Banner */}
      {unresolvedRisks.length === 0 && doses.length > 0 && (
        <div className="mg-card" style={{
          padding: '14px 20px',
          background: 'var(--mg-success-soft)',
          borderColor: 'rgba(22, 101, 52, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--mg-accent-soft)',
            color: 'var(--mg-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '1rem', color: 'var(--mg-primary)' }}>
              All Medications Safe Today
            </strong>
            <span style={{ marginLeft: '8px', color: 'var(--mg-text-muted)', fontSize: '0.9rem' }}>
              No harmful combinations detected among {activeTreatments.length} medications
            </span>
          </div>
        </div>
      )}

      {/* Today's Doses - Main Content */}
      <Section 
        title="Doses Due" 
        subtitle={`${doses.filter(d => d.status === 'PENDING').length} pending • ${takenCount} taken`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {doses.map(dose => {
            const isTaken = dose.status === 'TAKEN';
            const isPending = dose.status === 'PENDING';
            const bottle = bottleInventory[dose.drugName] || { remaining: 0, total: 0 };
            
            return (
              <MedicationCard
                key={dose.id}
                name={dose.drugName}
                generic={dose.dosage}
                dose={dose.dosage}
                timing={`${getTimeBadge(dose.scheduledTime)} • ${dose.scheduledTime}`}
                frequency={getFoodInstruction(dose.timing)}
                purpose={dose.criticality === 'HIGH' ? "Critical medication — do not skip" : "Daily maintenance"}
                isHighPriority={dose.criticality === 'HIGH'}
                isTaken={isTaken}
                onTake={isPending ? () => handleTakeDoseClick(dose.id) : null}
                onPlayAudio={() => handlePlayAudio(dose)}
                bottleCount={bottle.remaining}
                totalPills={bottle.total}
              />
            );
          })}

          {doses.length === 0 && (
            <div className="mg-card" style={{ padding: '32px', textAlign: 'center' }}>
              <Bell size={48} style={{ color: 'var(--mg-text-dim)', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--mg-text-main)' }}>
                No Doses Scheduled
              </h3>
              <p style={{ color: 'var(--mg-text-muted)', marginBottom: '16px' }}>
                Scan a medicine bottle to add your prescriptions
              </p>
              <button
                onClick={() => onNavigateTab && onNavigateTab('scanner')}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
              >
                Scan Bottle
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Adherence Summary - Simple */}
      {doses.length > 0 && (
        <Section title="Today's Progress" subtitle="Your medication adherence">
          <div className="mg-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: adherenceRate >= 90 ? 'var(--mg-accent-soft)' : adherenceRate >= 70 ? 'var(--mg-warning-soft)' : 'var(--mg-danger-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: adherenceRate >= 90 ? 'var(--mg-accent)' : adherenceRate >= 70 ? 'var(--mg-warning)' : 'var(--mg-danger)'
                  }}>
                    {adherenceRate}%
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
                    {takenCount} of {doses.length} doses taken
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--mg-text-muted)' }}>
                    {adherenceRate >= 90 ? 'Excellent! Keep it up' : adherenceRate >= 70 ? 'Good — try not to miss any more' : '⚠️ Several doses missed today'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('caregiver')}
                className="btn-ghost"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                View Full History
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Section>
      )}

    </div>
  );
}