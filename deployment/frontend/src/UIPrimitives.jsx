import React from 'react';

/**
 * ============================================================================
 * Shared Clinical UI Primitives
 * ============================================================================
 */

// 1. Button Primitive
export function Button({ 
  children, 
  variant = 'secondary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  disabled = false,
  onClick,
  className = '',
  style = {},
  ...props 
}) {
  const baseStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    borderRadius: 'var(--radius)',
    minHeight: size === 'sm' ? '30px' : '36px',
    padding: size === 'sm' ? '4px 10px' : '8px 14px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
    ...style
  };

  const variants = {
    primary: {
      background: 'var(--accent-primary)',
      color: 'var(--accent-primary-text)',
      borderColor: 'transparent',
    },
    secondary: {
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-strong)',
    },
    danger: {
      background: 'var(--status-critical-bg)',
      color: 'var(--status-critical-text)',
      borderColor: 'var(--status-critical-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'transparent',
    }
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      style={{ ...baseStyle, ...variants[variant] }}
      className={className}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}

// 2. Card Primitive
export function Card({ 
  children, 
  title, 
  subtitle, 
  action, 
  style = {}, 
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`clinical-card ${className}`} 
      style={{ ...style }}
      {...props}
    >
      {(title || action) && (
        <div className="clinical-card-header">
          <div>
            {title && (
              <h3 style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-semibold)', 
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--text-muted)', 
                marginTop: '2px',
                margin: 0
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// 3. Badge Primitive (Strictly Semantic)
export function Badge({ 
  children, 
  variant = 'neutral', // 'critical' | 'warning' | 'safe' | 'info' | 'neutral'
  size = 'sm',
  style = {} 
}) {
  const styles = {
    critical: {
      background: 'var(--status-critical-bg)',
      border: '1px solid var(--status-critical-border)',
      color: 'var(--status-critical-text)'
    },
    warning: {
      background: 'var(--status-warning-bg)',
      border: '1px solid var(--status-warning-border)',
      color: 'var(--status-warning-text)'
    },
    safe: {
      background: 'var(--status-safe-bg)',
      border: '1px solid var(--status-safe-border)',
      color: 'var(--status-safe-text)'
    },
    info: {
      background: 'var(--status-info-bg)',
      border: '1px solid var(--status-info-border)',
      color: 'var(--status-info-text)'
    },
    neutral: {
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border-default)',
      color: 'var(--text-secondary)'
    }
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
      fontWeight: 'var(--font-medium)',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: 'var(--radius)',
      lineHeight: 1.4,
      ...styles[variant],
      ...style
    }}>
      {children}
    </span>
  );
}

// 4. Input Primitive
export function Input({ 
  label, 
  error, 
  style = {}, 
  ...props 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {label && (
        <label style={{ 
          fontSize: 'var(--text-xs)', 
          fontWeight: 'var(--font-medium)', 
          color: 'var(--text-secondary)' 
        }}>
          {label}
        </label>
      )}
      <input 
        className="clinical-input" 
        style={{ ...style }}
        {...props} 
      />
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--status-critical-solid)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
