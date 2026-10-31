import React from 'react';
import { 
  Smartphone, Grid3X3, Monitor, ShieldCheck, Leaf, 
  RefreshCw, CheckCircle2, Lock
} from 'lucide-react';

export default function TopControlBar({
  viewMode,
  setViewMode,
  currentScreen,
  setCurrentScreen,
  isBackendHealthy,
  isSseConnected,
  onOpenAuditModal
}) {
  const screenOptions = [
    { id: 'splash', label: '1. Splash' },
    { id: 'onboarding', label: '2. Onboarding' },
    { id: 'patient_home', label: '3. Dashboard' },
    { id: 'scanner', label: '4. Scanner' },
    { id: 'scan_results', label: '5. Scan Results' },
    { id: 'medication_detail', label: '6. Medication Detail' },
    { id: 'safety', label: '7. Safety & DDI' },
    { id: 'molecular', label: '8. Molecular GNN' },
    { id: 'adherence', label: '9. Adherence' },
    { id: 'caregiver', label: '10. Caregiver' },
    { id: 'copilot', label: '11. Copilot' },
    { id: 'fda_signals', label: '12. FDA Signals' }
  ];

  return (
    <header style={{
      background: '#07281f',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '10px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      color: '#ffffff'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(34, 197, 94, 0.4)'
          }}>
            <Leaf size={18} color="#05231a" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                MedGuard AI
              </span>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '1px 7px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                UI/UX Suite
              </span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher (Device vs Gallery vs Desktop) */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '3px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setViewMode('device')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: viewMode === 'device' ? '#14532d' : 'transparent',
              color: viewMode === 'device' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Smartphone size={15} />
            <span>Interactive Phone</span>
          </button>

          <button
            onClick={() => setViewMode('gallery')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: viewMode === 'gallery' ? '#14532d' : 'transparent',
              color: viewMode === 'gallery' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Grid3X3 size={15} />
            <span>All 12 Screens</span>
          </button>

          <button
            onClick={() => setViewMode('desktop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: viewMode === 'desktop' ? '#14532d' : 'transparent',
              color: viewMode === 'desktop' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Monitor size={15} />
            <span>Desktop Workspace</span>
          </button>
        </div>

        {/* Screen Quick Selector (When in Phone or Desktop mode) */}
        {viewMode !== 'gallery' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Jump to:</span>
            <select
              value={currentScreen}
              onChange={(e) => setCurrentScreen(e.target.value)}
              style={{
                background: '#0d382c',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {screenOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Right: Backend Status & 21 CFR Part 11 Audit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live Status Pill */}
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
              {isBackendHealthy ? 'Backend Live (:5000)' : 'Connecting...'}
            </span>
          </div>

          {/* Audit Trail Button */}
          <button
            onClick={onOpenAuditModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #15803d, #0b382c)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <Lock size={13} color="#4ade80" />
            <span>21 CFR Part 11</span>
          </button>
        </div>

      </div>
    </header>
  );
}
