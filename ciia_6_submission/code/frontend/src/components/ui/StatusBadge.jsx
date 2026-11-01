import React from 'react';

export default function StatusBadge({ type = 'neutral', label, icon: Icon, style = {} }) {
  const styles = {
    success: {
      background: 'var(--mg-accent-soft)',
      color: 'var(--mg-accent)',
      border: '1px solid var(--mg-accent-border)'
    },
    danger: {
      background: 'var(--mg-danger-soft)',
      color: 'var(--mg-danger)',
      border: '1px solid var(--mg-danger-border)'
    },
    warning: {
      background: 'var(--mg-warning-soft)',
      color: 'var(--mg-warning)',
      border: '1px solid var(--mg-warning-border)'
    },
    neutral: {
      background: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0'
    }
  };

  const current = styles[type] || styles.neutral;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.74rem',
      fontWeight: 600,
      ...current,
      ...style
    }}>
      {Icon && <Icon size={12} />}
      <span>{label}</span>
    </span>
  );
}
