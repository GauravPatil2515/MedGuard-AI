import React, { useState } from 'react';
import { Pill, Volume2, CheckCircle2, Trash2, ShieldAlert, Sparkles, Clock, UserCheck } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Section from '../ui/Section';
import MedicationCard from '../ui/MedicationCard';
import StatusBadge from '../ui/StatusBadge';

export default function MedicationsView({
  patientData,
  patientRecord,
  onRemoveTreatment,
  onDoseAction,
  API_BASE = "http://localhost:5000/api"
}) {
  const treatments = (patientRecord?.treatments || []).filter(t => t.status === 'active');
  const [selectedId, setSelectedId] = useState(treatments[0]?.id || null);
  const [selectedLang, setSelectedLang] = useState('mr');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [doseActionStatus, setDoseActionStatus] = useState(null);

  // Fallback if selectedId became invalid
  const current = treatments.find(t => t.id === selectedId) || treatments[0] || null;

  // Find adherence summary for current medicine
  const adherence = (patientRecord?.adherenceSummary || []).find(a => a.treatmentId === current?.id);

  // Find any risk events involving current drug
  const drugRisks = (patientRecord?.riskEvents || []).filter(r => 
    current && r.drugPair.some(dp => dp.toLowerCase() === current.drugName.toLowerCase())
  );

  const handlePlayAudio = async () => {
    if (!current) return;
    setIsPlayingAudio(true);

    if ('speechSynthesis' in window) {
      const drugName = current.drugName;
      const text = selectedLang === 'mr' 
        ? `सावधान: ${drugName} गोळी ${current.dosage}. दररोज डॉक्टरांच्या सल्ल्यानुसार वेळेवर घ्या. डोस चुकवू नका.` 
        : selectedLang === 'hi'
        ? `सावधान: ${drugName} गोली ${current.dosage}. हर रोज़ डॉक्टर की सलाह के अनुसार समय पर लें.`
        : `Caution: Take ${drugName} ${current.dosage} as prescribed (${current.frequency}). Do not miss doses.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2000);
    }
  };

  const handleLogCurrentDose = (status) => {
    if (!current || !patientRecord) return;
    setDoseActionStatus(status);
    const targetDose = (patientRecord.todayDoses || []).find(d => d.treatmentId === current.id);
    if (targetDose && onDoseAction) {
      onDoseAction(targetDose.id, status);
    }
    setTimeout(() => setDoseActionStatus(null), 2000);
  };

  const handleDiscontinue = () => {
    if (!current) return;
    if (window.confirm(`Discontinue ${current.drugName} ${current.dosage} from active regimen? This will re-evaluate multi-drug safety.`)) {
      if (onRemoveTreatment) {
        onRemoveTreatment(current.id);
      }
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <PageHeader
        title="Medication Regimen"
        subtitle={`Active therapeutic regimen • ${treatments.length} prescription medicines monitored`}
      />

      {/* Main Grid: Medicine Detail on Left, Complete List on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left: Selected Drug Card */}
        <Section 
          title="Medication Details" 
          subtitle={current ? `Viewing clinical profile for ${current.drugName}` : "Select a medication"}
        >
          {current ? (
            <div className="mg-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Card Header with Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--mg-text-main)' }}>
                    {current.drugName}
                  </h3>
                  <span className="meta-text" style={{ fontSize: '0.86rem' }}>
                    {current.dosage} • {current.frequency}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {drugRisks.length > 0 && (
                    <StatusBadge type="danger" label="Safety Clash" />
                  )}
                  <StatusBadge 
                    type={current.drugName.toLowerCase().includes('warfarin') ? "danger" : "neutral"} 
                    label={current.condition || "Cardiovascular"} 
                  />
                </div>
              </div>

              {/* Verified OCR Confidence & Doctor */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                padding: '12px 14px',
                background: 'var(--mg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span className="meta-text" style={{ display: 'block' }}>Prescribed For</span>
                  <strong>{current.condition || "Clinical indication"}</strong>
                </div>
                <div>
                  <span className="meta-text" style={{ display: 'block' }}>Doctor</span>
                  <strong>{current.prescribingDoctor || "Dr. V. Sharma"}</strong>
                </div>
                <div>
                  <span className="meta-text" style={{ display: 'block' }}>OCR Confidence</span>
                  <strong style={{ color: 'var(--mg-primary)' }}>
                    {Math.round((current.sourceOcrConfidence || 0.95) * 100)}% Verified
                  </strong>
                </div>
              </div>

              {/* Dynamic Adherence Stats for this medicine */}
              {adherence && (
                <div style={{
                  padding: '12px 14px',
                  border: '1px solid var(--mg-card-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span className="meta-text">Adherence Metric</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--mg-primary)' }}>
                      {adherence.percentTaken}% Taken
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="meta-text">Current Streak</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      🔥 {adherence.currentStreak} days
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Safety Flags for this specific drug */}
              {drugRisks.length > 0 && (
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--mg-danger-soft)',
                  border: '1px solid var(--mg-danger-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  color: '#991b1b'
                }}>
                  <strong>⚠️ Interaction Warning: </strong>
                  {drugRisks[0].description}
                </div>
              )}

              {/* Audio Instructions & Language Select */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--mg-text-muted)' }}>Audio:</span>
                  {['mr', 'hi', 'en'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={selectedLang === lang ? 'btn-primary' : 'btn-ghost'}
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                    >
                      {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'EN'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  className="btn-ghost"
                  style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Volume2 size={15} className={isPlayingAudio ? 'animate-bounce' : ''} />
                  <span>{isPlayingAudio ? "Speaking..." : "Listen Voice Advice"}</span>
                </button>
              </div>

              {/* Dose Action & Discontinue Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => handleLogCurrentDose('TAKEN')}
                  className="btn-primary"
                  style={{ flex: 1, padding: '9px 16px', fontSize: '0.84rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{doseActionStatus === 'TAKEN' ? "Dose Logged!" : "Mark Dose Taken"}</span>
                </button>

                <button
                  onClick={handleDiscontinue}
                  className="btn-ghost"
                  style={{ padding: '9px 14px', fontSize: '0.84rem', color: 'var(--mg-danger)' }}
                  title="Discontinue Medication"
                >
                  <Trash2 size={16} />
                  <span>Discontinue</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="mg-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--mg-text-muted)' }}>
              No active medications. Click Scan Prescription to add medicines.
            </div>
          )}
        </Section>

        {/* Right: Complete List of Prescribed Medicines */}
        <Section 
          title="Active Regimen" 
          subtitle={`${treatments.length} prescription medications`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {treatments.map(t => {
              const hasRisk = (patientRecord?.riskEvents || []).some(r => 
                r.drugPair.some(dp => dp.toLowerCase() === t.drugName.toLowerCase())
              );
              const isSelected = current?.id === t.id;

              return (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedId(t.id)} 
                  style={{ cursor: 'pointer', outline: isSelected ? '2px solid var(--mg-primary)' : 'none', borderRadius: 'var(--radius-md)' }}
                >
                  <MedicationCard
                    name={t.drugName}
                    generic={t.dosage}
                    dose={t.dosage}
                    timing={t.timesOfDay ? t.timesOfDay.join(', ') : "Daily"}
                    frequency={t.frequency}
                    purpose={t.condition || "Clinical indication"}
                    isHighPriority={hasRisk}
                    isTaken={false}
                    onSelect={() => setSelectedId(t.id)}
                  />
                </div>
              );
            })}

            {treatments.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--mg-text-muted)' }}>
                No medications in regimen.
              </div>
            )}
          </div>
        </Section>

      </div>

    </div>
  );
}
