import React from 'react';

export default function ScanAnimation({ isScanning = true }) {
  return (
    <div style={{
      width: '100%',
      height: '240px',
      background: '#1e293b',
      borderRadius: 'var(--radius-lg)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Prescription Document Mock */}
      <div style={{
        width: '84%',
        height: '88%',
        background: '#f8fafc',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.74rem',
        color: '#334155',
        lineHeight: 1.5,
        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        transform: 'rotate(-0.5deg)',
        position: 'relative'
      }}>
        <div style={{ fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px', color: '#0f172a' }}>
          DR. R.K. SHARMA, MD (CARDIOLOGY)
        </div>
        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Pt: Mrs. Sumitra Kulkarni (68F) • Date: 26/09/2026</div>
        <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 600 }}>
          Rx:<br />
          1. Tab Ecosprin 75mg OD (breakfast)<br />
          2. Tab Met-XL 50mg OD (breakfast)<br />
          3. Tab Warfarin 5mg OD (dinner)<br />
          4. Tab Amiodarone 200mg OD (dinner)<br />
          5. Tab Pantocid 40mg OD (before food)
        </div>
        <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontStyle: 'italic', color: '#94a3b8' }}>
          Sign: R.K. Sharma
        </div>
      </div>

      {/* Laser Scanning Beam */}
      {isScanning && <div className="laser-beam" />}

      {/* Corner Registration Markers */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', width: '16px', height: '16px', borderTop: '2.5px solid #22c55e', borderLeft: '2.5px solid #22c55e' }} />
      <div style={{ position: 'absolute', top: '12px', right: '12px', width: '16px', height: '16px', borderTop: '2.5px solid #22c55e', borderRight: '2.5px solid #22c55e' }} />
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '16px', height: '16px', borderBottom: '2.5px solid #22c55e', borderLeft: '2.5px solid #22c55e' }} />
      <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '16px', height: '16px', borderBottom: '2.5px solid #22c55e', borderRight: '2.5px solid #22c55e' }} />
    </div>
  );
}
