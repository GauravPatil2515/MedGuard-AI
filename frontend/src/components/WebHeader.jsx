import React from 'react';
import { 
  Leaf, ShieldCheck, Lock, Activity, Bell, 
  Home, Camera, Pill, Flame, Calendar, Users, Bot, BarChart3
} from 'lucide-react';

export default function WebHeader({
  activeTab,
  setActiveTab,
  patientData,
  selectedPreset,
  onSelectPreset,
  selectedLang,
  setSelectedLang,
  isBackendHealthy,
  isSseConnected,
  criticalAlertCount = 0,
  onOpenAuditModal
}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'scanner', label: 'Prescription Scanner', icon: Camera, badge: 'AI OCR' },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'safety', label: 'Safety & DDI', icon: Flame, badge: criticalAlertCount > 0 ? `${criticalAlertCount} Alerts` : null, alert: criticalAlertCount > 0 },
    { id: 'molecular', label: 'Molecular Toxicology', icon: Activity },
    { id: 'adherence', label: 'Adherence Hub', icon: Calendar },
    { id: 'caregiver', label: 'Caregiver Guardian', icon: Users },
    { id: 'copilot', label: 'Clinical Copilot', icon: Bot },
    { id: 'fda_signals', label: 'FDA Signals', icon: BarChart3 }
  ];

  return (
    <header style={{
      background: '#07281f',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      color: '#ffffff'
    }}>
      {/* Top Utility Bar */}
      <div style={{
        maxWidth: '1540px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)'
      }}>
        {/* Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)'
          }}>
            <Leaf size={22} color="#05231a" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-serif" style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                MedGuard AI
              </span>
              <span style={{
                background: 'rgba(34, 197, 94, 0.16)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                NEURO-SYMBOLIC
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Smarter Meds. Safer Lives.
            </div>
          </div>
        </div>

        {/* Patient Selection & Quick Preset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#f59e0b',
            color: '#78350f',
            fontWeight: 800,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            AT
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{patientData?.patient_name || 'Ms. Atharva'}</span>
              <span style={{ fontSize: '0.64rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>
                Active
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {patientData?.age || 68} yrs • {patientData?.diagnosis || 'Post-CABG • Atrial Fibrillation'}
            </div>
          </div>

          <select
            value={selectedPreset}
            onChange={(e) => onSelectPreset && onSelectPreset(e.target.value)}
            style={{
              background: '#0d382c',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            <option value="mrs_kulkarni_cardiac">Preset: Mrs. Kulkarni (Cardiac)</option>
            <option value="clash_regimen_bleeding">Preset: Bleeding Clash (Warfarin+NSAID)</option>
            <option value="diabetic_hypertension">Preset: Elderly Diabetic Nephropathy</option>
          </select>
        </div>

        {/* Vernacular Language Pills + Backend Telemetry + Audit Ledger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Vernacular TTS buttons */}
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.35)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {[
              { id: 'mr', label: 'मराठी' },
              { id: 'hi', label: 'हिंदी' },
              { id: 'en', label: 'English' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLang(l.id)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  background: selectedLang === l.id ? '#15803d' : 'transparent',
                  color: selectedLang === l.id ? '#ffffff' : '#94a3b8'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Backend Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '5px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isBackendHealthy ? '#22c55e' : '#f59e0b'
            }} className="animate-pulse" />
            <span style={{ color: '#cbd5e1' }}>
              {isBackendHealthy ? 'Backend :5000 Healthy' : 'Connecting...'}
            </span>
          </div>

          {/* 21 CFR Part 11 Audit Trail Button */}
          <button
            onClick={onOpenAuditModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #15803d, #0b382c)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              border: '1px solid rgba(34, 197, 94, 0.35)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <Lock size={13} color="#4ade80" />
            <span>21 CFR Part 11 Ledger</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div style={{
        maxWidth: '1540px',
        margin: '0 auto',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? '#14532d' : 'transparent',
                whiteSpace: 'nowrap',
                position: 'relative'
              }}
            >
              <Icon size={16} color={isActive ? '#4ade80' : '#94a3b8'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: tab.alert ? '#ef4444' : 'rgba(34, 197, 94, 0.25)',
                  color: tab.alert ? '#ffffff' : '#4ade80'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
