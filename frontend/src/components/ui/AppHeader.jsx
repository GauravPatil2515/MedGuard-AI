import React from 'react';
import { Leaf, Phone } from 'lucide-react';

export default function AppHeader({
  activeTab,
  setActiveTab,
  patientName = "Mrs. Kulkarni",
  selectedLang = "mr",
  setSelectedLang,
  isBackendHealthy = true,
  criticalAlertCount = 0,
  onEmergencyCall,
  roleSelector = null
}) {
  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--mg-card-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        
        {/* Left: SAFE CAP⁺ Brand Identity */}
        <div 
          onClick={() => setActiveTab && setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--mg-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(13, 56, 44, 0.25)'
          }}>
            <Leaf size={18} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--mg-text-main)',
            whiteSpace: 'nowrap'
          }}>
            SAFE CAP⁺
          </span>
        </div>

        {/* Center: Role Selector */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {roleSelector}
        </div>

        {/* Right: Language Pills + Emergency + Patient Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          
          {/* Vernacular Language Selector - Full Word Pills */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            gap: '2px'
          }}>
            {[
              { id: 'mr', label: 'मराठी' },
              { id: 'hi', label: 'हिंदी' },
              { id: 'en', label: 'English' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLang && setSelectedLang(l.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: selectedLang === l.id ? '#ffffff' : 'transparent',
                  color: selectedLang === l.id ? 'var(--mg-text-main)' : 'var(--mg-text-muted)',
                  boxShadow: selectedLang === l.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Emergency Quick-Call Button */}
          <button
            onClick={onEmergencyCall}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#ffffff',
              background: 'var(--mg-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.16s ease',
              whiteSpace: 'nowrap'
            }}
            title="Call Caregiver Emergency"
            aria-label="Call Caregiver Emergency"
          >
            <Phone size={16} />
            <span>Emergency</span>
          </button>

          {/* Compact Patient Indicator with Active Pulse Dot */}
          <div 
            onClick={() => setActiveTab && setActiveTab('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: '#f8faf8',
              border: '1px solid var(--mg-card-border)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer'
            }}
          >
            <span 
              className={isBackendHealthy ? 'pulse-dot' : ''}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isBackendHealthy ? 'var(--mg-accent)' : '#f59e0b',
                flexShrink: 0
              }} 
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)', whiteSpace: 'nowrap' }}>
              {patientName}
            </span>
          </div>

        </div>

      </div>
    </header>
  );
}