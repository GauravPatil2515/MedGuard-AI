import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function LoadingState({
  currentStageIndex = 0,
  stages = [
    "Reading prescription...",
    "Identifying medicines...",
    "Checking interactions...",
    "Running molecular analysis...",
    "Preparing your medication plan..."
  ]
}) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--mg-card-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
          {stages[currentStageIndex] || "Processing..."}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--mg-accent)', fontWeight: 600 }}>
          Step {Math.min(currentStageIndex + 1, stages.length)} of {stages.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '4px',
        background: '#f1f5f9',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
          height: '100%',
          background: 'var(--mg-primary)',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Stages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        {stages.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isDone ? (
                <CheckCircle2 size={16} color="var(--mg-accent)" />
              ) : isCurrent ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '2px solid var(--mg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--mg-primary)'
                  }} className="pulse-dot" />
                </div>
              ) : (
                <Circle size={16} color="var(--mg-text-dim)" />
              )}
              <span style={{
                fontSize: '0.84rem',
                color: isDone ? 'var(--mg-text-body)' : isCurrent ? 'var(--mg-primary)' : 'var(--mg-text-dim)',
                fontWeight: isCurrent ? 600 : 400
              }}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
