import React from 'react';
import { AlertTriangle, Volume2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function SafetyCard({
  drugs,
  severity = "High Risk",
  summary,
  mechanism,
  recommendation,
  onListen,
  isPlayingAudio = false
}) {
  const isHigh = severity.toLowerCase().includes('high');

  return (
    <div 
      className="mg-card fade-in"
      style={{
        padding: '20px 22px',
        borderLeft: isHigh ? '3px solid var(--mg-danger)' : '3px solid var(--mg-warning)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: isHigh ? 'var(--mg-danger-soft)' : 'var(--mg-warning-soft)',
            color: isHigh ? 'var(--mg-danger)' : 'var(--mg-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
              {drugs}
            </h3>
            <p className="meta-text" style={{ marginTop: '2px' }}>
              {summary}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge 
            type={isHigh ? 'danger' : 'warning'} 
            label={severity} 
          />

          {onListen && (
            <button
              onClick={onListen}
              className="btn-ghost"
              style={{ padding: '5px 10px', fontSize: '0.74rem' }}
              title="Hear clinical explanation in Marathi/Hindi"
            >
              <Volume2 size={13} className={isPlayingAudio ? 'animate-pulse' : ''} />
              <span>Audio</span>
            </button>
          )}
        </div>
      </div>

      {(mechanism || recommendation) && (
        <div style={{
          marginTop: '12px',
          padding: '12px 14px',
          background: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.82rem',
          lineHeight: 1.45
        }}>
          {mechanism && (
            <div>
              <strong style={{ color: 'var(--mg-text-main)' }}>Mechanism: </strong>
              <span style={{ color: 'var(--mg-text-body)' }}>{mechanism}</span>
            </div>
          )}
          {recommendation && (
            <div>
              <strong style={{ color: 'var(--mg-accent)' }}>Guidance: </strong>
              <span style={{ color: 'var(--mg-text-body)' }}>{recommendation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
