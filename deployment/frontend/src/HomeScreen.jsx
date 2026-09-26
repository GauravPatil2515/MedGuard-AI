import React, { useState } from 'react';
import { 
  Check, X, Clock, AlertOctagon, ShieldAlert, Pill, 
  ChevronRight, Calendar, Stethoscope, AlertTriangle, ShieldCheck, Download
} from 'lucide-react';
import { Card, Button, Badge } from './UIPrimitives';
import { logDoseStatus, updateRiskStatus } from './lib/patientRecordStore';

export default function HomeScreen({ 
  patientRecord, 
  downloadStatus, 
  onOpenSetupModal, 
  onRecordUpdated, 
  onNavigateToScan, 
  onNavigateToRecord 
}) {
  const [loadingDoseId, setLoadingDoseId] = useState(null);
  const [riskActionLoading, setRiskActionLoading] = useState(false);

  if (!patientRecord) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading patient record...</div>;
  }

  // Find the highest severity unresolved risk event, if any exists
  const unresolvedRisks = (patientRecord.riskEvents || []).filter(r => r.status === 'unresolved');
  const activeRisk = unresolvedRisks.length > 0 ? unresolvedRisks[0] : null;

  const todayDoses = patientRecord.todayDoses || [];
  const activeTreatmentsCount = (patientRecord.treatments || []).filter(t => t.status === 'active').length;

  const handleDoseAction = async (doseId, status) => {
    setLoadingDoseId(doseId);
    try {
      const updated = await logDoseStatus(patientRecord, doseId, status);
      if (onRecordUpdated) onRecordUpdated(updated);
    } catch (err) {
      console.error('Error recording dose action:', err);
    } finally {
      setLoadingDoseId(null);
    }
  };

  const handleAcknowledgeRisk = async (riskId) => {
    setRiskActionLoading(true);
    try {
      const updated = await updateRiskStatus(patientRecord, riskId, 'acknowledged');
      if (onRecordUpdated) onRecordUpdated(updated);
    } catch (err) {
      console.error('Error acknowledging risk:', err);
    } finally {
      setRiskActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Auto-Download Banner upon refresh if downloading */}
      {downloadStatus && downloadStatus.overall < 100 && (
        <div 
          onClick={onOpenSetupModal}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={16} className="animate-pulse" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Auto-downloading on-device models ({downloadStatus.overall}%)
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                Caching Qwen2.5, TrOCR & CatBoost locally for offline private inference
              </div>
            </div>
          </div>
          <Badge variant="warning">
            View Progress
          </Badge>
        </div>
      )}
      
      {/* 1. EXACTLY ONE Dominant Risk Card if an unresolved risk exists (no risk = no card, no noise) */}
      {activeRisk && (
        <Card style={{
          borderLeft: '4px solid var(--status-critical-text)',
          background: 'var(--status-critical-bg)',
          borderColor: 'var(--status-critical-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--status-critical-border)',
                color: 'var(--status-critical-text)',
                padding: '8px',
                borderRadius: 'var(--radius)',
                display: 'flex',
                marginTop: '2px'
              }}>
                <AlertOctagon size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--status-critical-text)' }}>
                    Safety Warning: {activeRisk.drugPair[0]} ↔ {activeRisk.drugPair[1]}
                  </span>
                  <Badge variant="critical">
                    {activeRisk.severity.toUpperCase()} RISK
                  </Badge>
                </div>
                
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {activeRisk.description}
                </p>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Flagged during cross-treatment verification on {new Date(activeRisk.dateRaised).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Single Clear Action */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAcknowledgeRisk(activeRisk.id)}
                disabled={riskActionLoading}
              >
                {riskActionLoading ? 'Saving...' : 'Acknowledge Risk'}
              </Button>
              <a
                href="tel:+919820011223"
                style={{
                  background: 'var(--status-critical-text)',
                  color: '#ffffff',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Stethoscope size={13} />
                Contact Doctor
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* 2. Today's Medication Schedule (What to take now/next) with 1-Tap Logging */}
      <Card 
        title="Today's Schedule" 
        subtitle="One-tap verification logs directly to your encrypted local patient record"
        action={
          <Badge variant="neutral">
            {todayDoses.filter(d => d.status === 'TAKEN').length}/{todayDoses.length} Taken
          </Badge>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {todayDoses.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No medication doses scheduled for today.
            </div>
          ) : (
            todayDoses.map((dose) => {
              const isTaken = dose.status === 'TAKEN';
              const isMissed = dose.status === 'MISSED';
              const isWarfarin = dose.drugName.toLowerCase().includes('warfarin');

              return (
                <div
                  key={dose.id}
                  style={{
                    background: isTaken ? 'var(--status-safe-bg)' : (isMissed ? 'var(--status-critical-bg)' : 'var(--bg-app)'),
                    border: `1px solid ${isTaken ? 'var(--status-safe-border)' : (isMissed ? 'var(--status-critical-border)' : 'var(--border-subtle)')}`,
                    borderRadius: 'var(--radius)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                    <div style={{
                      background: isTaken ? 'var(--status-safe-border)' : (isMissed ? 'var(--status-critical-border)' : 'var(--border-subtle)'),
                      color: isTaken ? 'var(--status-safe-text)' : (isMissed ? 'var(--status-critical-text)' : 'var(--text-secondary)'),
                      padding: '8px',
                      borderRadius: '6px',
                      display: 'flex'
                    }}>
                      <Pill size={16} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {dose.drugName}
                        </span>
                        <Badge variant="neutral">{dose.dosage}</Badge>
                        {isWarfarin && <Badge variant="critical">CRITICAL</Badge>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', gap: '10px' }}>
                        <span>Scheduled: <strong style={{ color: 'var(--text-primary)' }}>{dose.scheduledTime}</strong></span>
                        <span>{dose.timing}</span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isTaken ? (
                      <Badge variant="safe" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                        <Check size={13} style={{ marginRight: '4px' }} /> Taken
                      </Badge>
                    ) : isMissed ? (
                      <Badge variant="critical" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                        <X size={13} style={{ marginRight: '4px' }} /> Missed
                      </Badge>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={loadingDoseId === dose.id}
                          onClick={() => handleDoseAction(dose.id, 'TAKEN')}
                        >
                          <Check size={14} />
                          Take
                        </Button>
                        <Button
                          variant="critical"
                          size="sm"
                          disabled={loadingDoseId === dose.id}
                          onClick={() => handleDoseAction(dose.id, 'MISSED')}
                        >
                          <X size={14} />
                          Missed
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* 3. Quick Navigation & Status Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        <div 
          onClick={onNavigateToScan}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.15s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Scan New Prescription
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              On-device OCR, NER & automatic DDI cross-check
            </div>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div 
          onClick={onNavigateToRecord}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.15s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              View Patient Record
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {activeTreatmentsCount} active treatments • Adherence summary
            </div>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

    </div>
  );
}
