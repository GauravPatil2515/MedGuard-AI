import React from 'react';

export default function Section({ title, subtitle, action, children, style = {} }) {
  return (
    <section style={{ marginBottom: '24px', ...style }}>
      {(title || action) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '12px'
        }}>
          <div>
            {title && <h2 className="section-title" style={{ margin: 0 }}>{title}</h2>}
            {subtitle && <p className="meta-text" style={{ marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
