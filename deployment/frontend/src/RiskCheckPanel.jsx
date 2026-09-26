import React from 'react';
import { 
  AlertTriangle, ShieldAlert, ShieldCheck, Pill, Stethoscope, 
  Info, Activity, AlertOctagon, X
} from 'lucide-react';
import { Card, Badge } from './UIPrimitives';

export default function RiskCheckPanel({ riskData, onClose }) {
  if (!riskData) return null;

  const { drugs = [], conditions = [], interactions = [], side_effects = [], needs_review = false, disclaimer } = riskData;

  const getSeverityBadgeVariant = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'major':
      case 'critical':
        return 'critical';
      case 'moderate':
      case 'high':
        return 'warning';
      default:
        return 'safe';
    }
  };

  return (
    <Card style={{ marginTop: '16px', borderLeft: needs_review ? '3px solid var(--status-critical-text)' : '1px solid var(--border-subtle)' }}>
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: needs_review ? 'var(--status-critical-bg)' : 'var(--bg-app)',
            border: `1px solid ${needs_review ? 'var(--status-critical-border)' : 'var(--border-subtle)'}`,
            padding: '8px',
            borderRadius: 'var(--radius)',
            display: 'flex',
            color: needs_review ? 'var(--status-critical-text)' : 'var(--accent-primary)'
          }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Clinical Risk Check Analysis
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Inference verification (PharmaNER, DiseaseNER, CatBoost DDI, OpenFDA)
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close risk panel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Persistent Needs Review Alert Banner */}
      {needs_review && (
        <div style={{
          background: 'var(--status-critical-bg)',
          border: '1px solid var(--status-critical-border)',
          borderRadius: 'var(--radius)',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <AlertOctagon size={18} style={{ color: 'var(--status-critical-text)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-critical-text)' }}>
              Clinical Review Required Prior to Administration
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
              High-priority drug-drug interaction flagged. Caregiver notification logged.
            </div>
          </div>
        </div>
      )}

      {/* Extracted Entities: Drugs & Conditions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {/* Drugs Found */}
        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Pill size={14} /> Extracted Drug Entities ({drugs.length})
          </div>
          {drugs.length === 0 ? (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No medications detected</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {drugs.map((d, idx) => (
                <Badge key={idx} variant="neutral">
                  {d.name} <span style={{ opacity: 0.65, fontSize: '0.6875rem' }}>({Math.round((d.confidence || 0.9) * 100)}%)</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Conditions Found */}
        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Stethoscope size={14} /> Detected Health Conditions ({conditions.length})
          </div>
          {conditions.length === 0 ? (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No medical conditions mentioned</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {conditions.map((c, idx) => (
                <Badge key={idx} variant="info">
                  {c.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drug-Drug Interaction Warnings */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>
          <Activity size={15} style={{ color: 'var(--status-warning-text)' }} /> Pairwise Interaction Triage ({interactions.length})
        </div>

        {interactions.length === 0 ? (
          <div style={{
            background: 'var(--status-safe-bg)',
            border: '1px solid var(--status-safe-border)',
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            fontSize: '0.8125rem',
            color: 'var(--status-safe-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={16} /> No critical drug-drug interactions detected between prescribed pairs.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {interactions.map((inter, idx) => {
              const variant = getSeverityBadgeVariant(inter.risk_label);
              return (
                <div
                  key={idx}
                  style={{
                    background: variant === 'critical' ? 'var(--status-critical-bg)' : (variant === 'warning' ? 'var(--status-warning-bg)' : 'var(--status-safe-bg)'),
                    border: `1px solid ${variant === 'critical' ? 'var(--status-critical-border)' : (variant === 'warning' ? 'var(--status-warning-border)' : 'var(--status-safe-border)')}`,
                    borderRadius: 'var(--radius)',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {inter.drug_a} ↔ {inter.drug_b}
                    </div>
                    <Badge variant={variant}>
                      {inter.risk_label?.toUpperCase() || 'EVALUATED'} ({Math.round((inter.confidence || 0.85) * 100)}%)
                    </Badge>
                  </div>
                  {inter.description && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {inter.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OpenFDA Adverse Reactions & Side Effects */}
      {side_effects.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Info size={15} style={{ color: 'var(--accent-primary)' }} /> OpenFDA Adverse Event Signals
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
            {side_effects.map((se, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius)',
                  padding: '10px 12px'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {se.drug}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(se.reactions || []).slice(0, 5).map((reaction, rIdx) => (
                    <Badge key={rIdx} variant="neutral" style={{ fontSize: '0.6875rem' }}>
                      {reaction}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory & Clinical Disclaimer */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '10px',
        marginTop: '12px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <AlertTriangle size={13} style={{ color: 'var(--status-warning-text)', flexShrink: 0 }} />
        <span>{disclaimer || "AI-generated clinical decision support, not a substitute for professional medical advice."}</span>
      </div>
    </Card>
  );
}
