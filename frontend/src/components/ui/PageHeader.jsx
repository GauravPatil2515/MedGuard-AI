import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div>
        <h1 className="page-title" style={{ margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="meta-text" style={{ marginTop: '4px', fontSize: '0.86rem', color: 'var(--mg-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {action}
        </div>
      )}
    </div>
  );
}
