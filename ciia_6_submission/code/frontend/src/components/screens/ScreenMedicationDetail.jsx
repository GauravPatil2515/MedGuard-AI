import React, { useState } from 'react';
import { 
  ChevronLeft, MoreHorizontal, ShieldAlert, Clock, Calendar, 
  HelpCircle, AlertCircle, Volume2, CheckCircle2, XCircle
} from 'lucide-react';

export default function ScreenMedicationDetail({ 
  medName = "Warfarin",
  dosage = "5 mg • Tablet",
  onBack,
  onDoseLogged,
  API_BASE = "http://localhost:5000/api"
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'safety' | 'instructions'
  const [selectedLang, setSelectedLang] = useState('mr'); // 'mr' | 'hi' | 'en'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [doseActionStatus, setDoseActionStatus] = useState(null);

  const handlePlayAudio = async () => {
    setIsPlayingAudio(true);
    try {
      const res = await fetch(`${API_BASE}/tts/audio?warning_type=warfarin_bleeding_warning&lang=${selectedLang}`);
      if (res.ok) {
        const data = await res.json();
        if (data.audio_base64) {
          const audio = new Audio(data.audio_base64);
          audio.onended = () => setIsPlayingAudio(false);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Audio playback fallback", e);
    }
    // Web speech fallback
    if ('speechSynthesis' in window) {
      const text = selectedLang === 'mr' 
        ? "सावधान: वॉर्फरिन गोळी दररोज रात्री जेवणानंतर वेळेवर घ्या. डोस चुकवू नका." 
        : selectedLang === 'hi'
        ? "सावधान: वॉर्फरिन गोली हर रोज़ रात के खाने के बाद समय पर लें. खुराक न छोड़ें."
        : "Warning: Take Warfarin consistently after dinner every night. Missing doses increases risk.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handleLogDose = async (status) => {
    setDoseActionStatus(status);
    try {
      await fetch(`${API_BASE}/adherence/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: "patient_mrs_kulkarni_01",
          drug_name: "Warfarin",
          dosage: "5 mg",
          status: status,
          criticality: "HIGH"
        })
      });
      if (onDoseLogged) onDoseLogged(status);
    } catch (e) {
      console.error("Error logging dose", e);
    }
  };

  return (
    <div style={{
      flex: 1,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 20px 24px 20px',
      position: 'relative'
    }}>
      {/* Scrollable Container */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <button 
            onClick={onBack}
            style={{ color: '#0f172a', padding: '6px', marginLeft: '-6px' }}
          >
            <ChevronLeft size={24} />
          </button>
          <button style={{ color: '#64748b', padding: '6px' }}>
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Hero Drug Presentation with 3D Pill Illustration */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px'
        }}>
          <div>
            <h2 className="font-serif" style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 2px 0'
            }}>
              {medName}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
              {dosage}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#fee2e2',
              color: '#dc2626',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              <span>⚡ High Priority</span>
            </div>
          </div>

          {/* 3D Realistic Pill Graphic */}
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #f1f5f9 0%, #cbd5e1 55%, #94a3b8 100%)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15), inset -2px -2px 6px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Pill center score line */}
            <div style={{
              width: '42px',
              height: '2px',
              background: '#64748b',
              transform: 'rotate(-45deg)',
              opacity: 0.6
            }} />
            <span style={{
              position: 'absolute',
              bottom: '12px',
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#475569'
            }}>
              5
            </span>
          </div>
        </div>

        {/* Segmented Control */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: '#f8fafc',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #edf2f7'
        }}>
          {['overview', 'safety', 'instructions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                background: activeTab === tab ? '#ffffff' : 'transparent',
                color: activeTab === tab ? '#0f172a' : '#64748b',
                boxShadow: activeTab === tab ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Attribute List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: '#15803d', marginTop: '2px' }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Dose</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>5 mg (1 tablet)</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: '#15803d', marginTop: '2px' }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Frequency</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Once daily (OD)</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: '#15803d', marginTop: '2px' }}>
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Time</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>After dinner (8:00 PM)</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: '#15803d', marginTop: '2px' }}>
              <HelpCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Purpose</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Prevents blood clots</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: '#dc2626', marginTop: '2px' }}>
              <AlertCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600 }}>Why important</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>
                Requires consistent intake. Missing doses can be risky.
              </div>
            </div>
          </div>

        </div>

        {/* Vernacular Audio Box */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
            Listen to instructions
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'mr', label: 'मराठी' },
                { id: 'hi', label: 'हिंदी' },
                { id: 'en', label: 'English' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLang(l.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: selectedLang === l.id ? '#0b382c' : '#ffffff',
                    color: selectedLang === l.id ? '#ffffff' : '#475569',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#0b382c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(11, 56, 44, 0.25)'
              }}
            >
              <Volume2 size={18} className={isPlayingAudio ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => handleLogDose('TAKEN')}
          style={{
            width: '100%',
            height: '50px',
            borderRadius: '999px',
            background: doseActionStatus === 'TAKEN' ? '#15803d' : '#0b382c',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.96rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 18px rgba(11, 56, 44, 0.2)'
          }}
        >
          {doseActionStatus === 'TAKEN' ? <CheckCircle2 size={18} /> : null}
          <span>{doseActionStatus === 'TAKEN' ? 'Dose Logged: Taken' : 'I Took It'}</span>
        </button>

        <button
          onClick={() => handleLogDose('MISSED')}
          style={{
            width: '100%',
            height: '46px',
            borderRadius: '999px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: doseActionStatus === 'MISSED' ? '#dc2626' : '#64748b',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {doseActionStatus === 'MISSED' ? <XCircle size={16} /> : null}
          <span>{doseActionStatus === 'MISSED' ? 'Marked as Missed' : 'Mark as Missed'}</span>
        </button>
      </div>

    </div>
  );
}
