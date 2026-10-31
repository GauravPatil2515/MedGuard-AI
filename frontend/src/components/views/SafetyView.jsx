import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, AlertTriangle, Volume2, Phone, ArrowRight } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Section from '../ui/Section';
import StatusBadge from '../ui/StatusBadge';

const API_BASE = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : "http://localhost:5000/api";

export default function SafetyView({ 
  patientRecord, 
  onAcknowledgeRisk, 
  onNavigateTab, 
  selectedLang = 'mr',
  onEmergencyCall
}) {
  const [playingRiskId, setPlayingRiskId] = useState(null);

  const riskEvents = patientRecord?.riskEvents || [];
  const activeTreatments = (patientRecord?.treatments || []).filter(t => t.status === 'active');

  // Plain-language warning messages
  const getPlainWarning = (risk) => {
    const pair = risk.drugPair?.join(' + ') || 'These medications';
    const drugA = risk.drugPair?.[0]?.toLowerCase() || '';
    const drugB = risk.drugPair?.[1]?.toLowerCase() || '';
    
    // Specific known dangerous combinations
    if ((drugA.includes('warfarin') && drugB.includes('combiflam')) || 
        (drugA.includes('combiflam') && drugB.includes('warfarin'))) {
      return {
        title: 'DO NOT TAKE TOGETHER',
        message: 'Combiflam (ibuprofen) + Warfarin can cause dangerous internal stomach bleeding.',
        action: 'Call your doctor immediately. Use plain Paracetamol (Crocin/Dolo) for pain instead.',
        severity: 'critical'
      };
    }
    if ((drugA.includes('warfarin') && drugB.includes('amiodarone')) || 
        (drugA.includes('amiodarone') && drugB.includes('warfarin'))) {
      return {
        title: 'CLOSE MONITORING REQUIRED',
        message: 'Amiodarone can double Warfarin\'s blood-thinning effect, raising bleed risk.',
        action: 'Your doctor must check your INR (blood test) every week. Do not change doses.',
        severity: 'high'
      };
    }
    // Generic fallback
    return {
      title: 'CAUTION ADVISED',
      message: `${pair} may interact. This could reduce effectiveness or increase side effects.`,
      action: 'Speak with your doctor or pharmacist before taking both together.',
      severity: 'moderate'
    };
  };

  const handleListen = async (risk) => {
    setPlayingRiskId(risk.id);
    try {
      const plainWarning = getPlainWarning(risk);
      const warningType = risk.drugPair?.some(d => d.toLowerCase().includes('warfarin')) && 
                          risk.drugPair?.some(d => d.toLowerCase().includes('combiflam')) 
        ? 'warfarin_bleeding_warning' 
        : 'missed_dose_warning';
      
      const res = await fetch(`${API_BASE}/tts/audio?warning_type=${warningType}&lang=${selectedLang}`);
      const data = await res.json();
      
      if (data.success && data.audio_base64) {
        const audio = new Audio(data.audio_base64);
        audio.onended = () => setPlayingRiskId(null);
        audio.onerror = () => setPlayingRiskId(null);
        await audio.play();
      } else {
        // Fallback to browser speech synthesis with plain language
        const text = `${plainWarning.title}. ${plainWarning.message} ${plainWarning.action}`;
        if ('speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance(text);
          msg.lang = selectedLang === 'mr' ? 'mr-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-US';
          msg.rate = 0.9;
          msg.onend = () => setPlayingRiskId(null);
          msg.onerror = () => setPlayingRiskId(null);
          window.speechSynthesis.speak(msg);
        } else {
          setTimeout(() => setPlayingRiskId(null), 3000);
        }
      }
    } catch (err) {
      console.error('TTS error:', err);
      setPlayingRiskId(null);
    }
  };

  if (riskEvents.length === 0) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <PageHeader title="Medication Safety" subtitle="All your medications checked for interactions" />
        
        <Section title="Safety Check Results">
          <div className="mg-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--mg-accent-soft)', color: 'var(--mg-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <ShieldCheck size={40} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: 'var(--mg-text-main)' }}>
              All Clear — No Safety Concerns
            </h3>
            <p style={{ color: 'var(--mg-text-muted)', marginBottom: '20px', fontSize: '1rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              Your {activeTreatments.length} medications have been checked. No harmful combinations were found.
            </p>
            <button
              onClick={() => onNavigateTab && onNavigateTab('home')}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              Back to Today's Pills
            </button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <PageHeader
        title="Safety Warnings"
        subtitle={`${riskEvents.length} medication combination${riskEvents.length > 1 ? 's' : ''} need your attention`}
      />

      {/* Safety Warnings List - Plain Language */}
      <Section title="⚠️ Important Safety Alerts" subtitle="Read carefully and follow the recommended actions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {riskEvents.map(risk => {
            const plainWarning = getPlainWarning(risk);
            const isAcknowledged = risk.status === 'acknowledged';
            const isCritical = plainWarning.severity === 'critical';
            const isHigh = plainWarning.severity === 'high';

            return (
              <div key={risk.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div 
                  className="mg-card fade-in"
                  style={{
                    padding: '20px',
                    borderLeft: `5px solid ${isCritical ? 'var(--mg-danger)' : isHigh ? 'var(--mg-warning)' : 'var(--mg-primary)'}`,
                    background: isCritical ? 'var(--mg-danger-soft)' : isHigh ? 'var(--mg-warning-soft)' : 'var(--mg-card)',
                    borderColor: isCritical ? 'var(--mg-danger-border)' : isHigh ? 'var(--mg-warning-border)' : 'var(--mg-card-border)'
                  }}
                >
                  {/* Warning Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                        background: isCritical ? 'var(--mg-danger)' : isHigh ? 'var(--mg-warning)' : 'var(--mg-primary)',
                        color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <AlertTriangle size={22} />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: isCritical ? '#991b1b' : isHigh ? '#b45309' : 'var(--mg-text-main)' }}>
                          {plainWarning.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: isCritical ? '#b91c1c' : isHigh ? '#92400e' : 'var(--mg-text-body)', fontWeight: 500 }}>
                          {risk.drugPair?.join(' + ') || 'Medication combination'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <StatusBadge 
                        type={isCritical ? 'danger' : isHigh ? 'warning' : 'info'} 
                        label={isCritical ? 'URGENT' : isHigh ? 'HIGH PRIORITY' : 'REVIEW'} 
                        style={{ fontSize: '0.7rem', padding: '5px 12px' }}
                      />
                      <button
                        onClick={() => handleListen(risk)}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        title="Listen to warning in your language"
                        aria-label="Listen to safety warning"
                      >
                        <Volume2 size={16} className={playingRiskId === risk.id ? 'animate-pulse' : ''} />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>

                  {/* Plain Language Message */}
                  <div style={{ 
                    padding: '16px', 
                    background: '#ffffff', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--mg-card-border)'
                  }}>
                    <div style={{ marginBottom: '12px', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--mg-text-main)', fontSize: '0.95rem' }}>What this means: </strong>
                      <span style={{ color: 'var(--mg-text-body)', fontSize: '0.95rem' }}>{plainWarning.message}</span>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: isCritical ? '#fef2f2' : isHigh ? '#fefce8' : '#f0fdf4',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: `3px solid ${isCritical ? 'var(--mg-danger)' : isHigh ? 'var(--mg-warning)' : 'var(--mg-accent)'}`
                    }}>
                      <strong style={{ color: isCritical ? '#991b1b' : isHigh ? '#92400e' : '#166534', fontSize: '0.95rem', display: 'block', marginBottom: '4px' }}>
                        👉 What to do:
                      </strong>
                      <span style={{ color: isCritical ? '#b91c1c' : isHigh ? '#b45309' : '#166534', fontSize: '0.95rem', fontWeight: 500 }}>
                        {plainWarning.action}
                      </span>
                    </div>
                  </div>

                  {/* Acknowledge Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onAcknowledgeRisk && onAcknowledgeRisk(risk.id)}
                      className={isAcknowledged ? 'btn-secondary' : 'btn-ghost'}
                      style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      disabled={isAcknowledged}
                    >
                      <CheckCircle2 size={16} />
                      <span>{isAcknowledged ? 'Acknowledged' : 'Mark as Read & Understood'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Emergency Quick Actions */}
      <Section title="Need Help Right Now?">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button
            onClick={onEmergencyCall}
            className="mg-card"
            style={{ 
              padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', gap: '8px', textAlign: 'center',
              border: '2px solid var(--mg-danger-border)', background: 'var(--mg-danger-soft)',
              transition: 'all 0.15s ease'
            }}
          >
            <Phone size={28} color="var(--mg-danger)" />
            <strong style={{ fontSize: '1rem', color: '#991b1b' }}>Call Caregiver</strong>
            <span style={{ fontSize: '0.85rem', color: '#b91c1c' }}>Emergency contact</span>
          </button>
          <button
            onClick={() => window.location.href = 'tel:108'}
            className="mg-card"
            style={{ 
              padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', gap: '8px', textAlign: 'center',
              border: '2px solid var(--mg-primary)', background: 'var(--mg-accent-soft)',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertTriangle size={28} color="var(--mg-primary)" />
            <strong style={{ fontSize: '1rem', color: 'var(--mg-primary)' }}>Call Ambulance (108)</strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--mg-text-muted)' }}>Medical emergency</span>
          </button>
        </div>
      </Section>

    </div>
  );
}