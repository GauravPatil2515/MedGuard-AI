import React from 'react';
import { Shield, Activity, Camera, Calendar, Flame, Users, Bot, Volume2 } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  patientName = 'Mrs. Sunita Kulkarni', 
  patientAge = 68,
  selectedLang,
  setSelectedLang,
  isSseConnected = true,
  criticalAlertCount = 0
}) {
  const tabs = [
    { id: 'scanner', label: 'Prescription Scanner', icon: Camera, badge: 'AI OCR' },
    { id: 'adherence', label: 'Dose Adherence', icon: Calendar },
    { id: 'safety', label: 'Molecular Safety', icon: Flame, alertBadge: criticalAlertCount > 0 },
    { id: 'caregiver', label: 'Caregiver Hub', icon: Users },
    { id: 'copilot', label: 'AI Copilot', icon: Bot }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(8, 12, 20, 0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
            padding: '9px',
            borderRadius: '12px',
            display: 'flex',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)'
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                MedGuard<span style={{ color: '#38bdf8' }}>.AI</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: 600
              }}>
                NEURO-SYMBOLIC
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Personalized Medication Safety & Adherence
            </span>
          </div>
        </div>

        {/* Central Segmented Tab Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 14px',
                  borderRadius: '9px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  background: isActive ? 'rgba(30, 41, 59, 0.85)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={isActive ? '#38bdf8' : '#64748b'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '0.62rem',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
                {tab.alertBadge && (
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#f43f5e',
                    boxShadow: '0 0 8px #f43f5e'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Patient Badge, Vernacular, & Live Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Vernacular Language Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '3px 6px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <Volume2 size={13} color="#94a3b8" />
            {['mr', 'hi', 'en'].map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                style={{
                  background: selectedLang === lang ? '#0284c7' : 'transparent',
                  color: selectedLang === lang ? '#fff' : '#64748b',
                  border: 'none',
                  padding: '3px 7px',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {lang === 'mr' ? 'मराठी' : (lang === 'hi' ? 'हिंदी' : 'EN')}
              </button>
            ))}
          </div>

          {/* Active Patient Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 12px',
            borderRadius: '10px'
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                {patientName}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                Age {patientAge} • Cardiac Regimen
              </div>
            </div>
          </div>

          {/* SSE Live Telemetry Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.72rem',
            color: isSseConnected ? '#10b981' : '#f59e0b',
            background: isSseConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: isSseConnected ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
            padding: '5px 10px',
            borderRadius: '8px',
            fontWeight: 600
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isSseConnected ? '#10b981' : '#f59e0b'
            }} className="animate-pulse" />
            {isSseConnected ? 'Live' : 'Syncing'}
          </div>

        </div>
      </div>
    </header>
  );
}
