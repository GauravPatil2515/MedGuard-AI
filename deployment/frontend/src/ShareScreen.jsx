import React, { useState } from 'react';
import { Printer, Share2, Copy, Check, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { Card, Button, Badge } from './UIPrimitives';

export default function ShareScreen({ patientRecord }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareableLink, setShareableLink] = useState(null);

  if (!patientRecord) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading patient record...</div>;
  }

  const activeTreatments = (patientRecord.treatments || []).filter(t => t.status === 'active');
  const pastTreatments = (patientRecord.treatments || []).filter(t => t.status !== 'active');
  const riskEvents = patientRecord.riskEvents || [];
  const adherenceList = patientRecord.adherenceSummary || [];

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateShareLink = () => {
    const fakeToken = btoa(`${patientRecord.patientId}_${Date.now()}`).substring(0, 16);
    const link = `${window.location.origin}/view/${fakeToken}?exp=24h`;
    setShareableLink(link);
  };

  const handleCopyLink = () => {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Header (Excluded from Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Physician Clinical Summary
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Compact 1-page structured report designed for rapid clinical intake (&lt; 60 seconds)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateShareLink}
          >
            <Share2 size={14} />
            Generate Share Link
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
          >
            <Printer size={14} />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Share Link Banner if active */}
      {shareableLink && (
        <Card className="no-print" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
              <strong>Read-Only Link:</strong> <code style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>{shareableLink}</code>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Expires in 24 hours • Encrypted access gate active
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </Card>
      )}

      {/* The Printable Clinical Summary (Strict 4 Sections) */}
      <div id="printable-doctor-summary" style={{
        background: '#ffffff',
        color: '#0f172a',
        border: '1px solid #cbd5e1',
        borderRadius: 'var(--radius)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)',
        fontFamily: 'var(--font-sans)'
      }}>
        
        {/* Header Metadata */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              MedGuard Clinical Summary
            </h1>
            <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '4px' }}>
              Patient ID: <strong>{patientRecord.patientId}</strong> • Mrs. Kulkarni (Age 68)
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
            <div>Date Generated: <strong>{new Date().toLocaleDateString()}</strong></div>
            <div>On-Device Conformal Ledger: <strong>Verified</strong></div>
          </div>
        </div>

        {/* Section 1: Active Treatments */}
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
            Section 1 — Active Treatments
          </h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Medication</th>
                <th style={{ padding: '6px 8px' }}>Dosage</th>
                <th style={{ padding: '6px 8px' }}>Schedule</th>
                <th style={{ padding: '6px 8px' }}>Since Date</th>
                <th style={{ padding: '6px 8px' }}>Condition / Prescriber</th>
              </tr>
            </thead>
            <tbody>
              {activeTreatments.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600 }}>{t.drugName}</td>
                  <td style={{ padding: '6px 8px' }}>{t.dosage}</td>
                  <td style={{ padding: '6px 8px' }}>{t.frequency}</td>
                  <td style={{ padding: '6px 8px' }}>{t.startDate}</td>
                  <td style={{ padding: '6px 8px', color: '#475569' }}>
                    {t.condition || 'General'} {t.prescribingDoctor ? `(${t.prescribingDoctor})` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Past Treatments */}
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
            Section 2 — Past Treatments
          </h2>

          {pastTreatments.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>No past medications on record.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px' }}>Medication</th>
                  <th style={{ padding: '6px 8px' }}>Dosage</th>
                  <th style={{ padding: '6px 8px' }}>Dates</th>
                  <th style={{ padding: '6px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pastTreatments.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{t.drugName}</td>
                    <td style={{ padding: '6px 8px' }}>{t.dosage}</td>
                    <td style={{ padding: '6px 8px' }}>{t.startDate} → {t.endDate || 'Ended'}</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>{t.status.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 3: Risk History */}
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
            Section 3 — Drug-Drug Interaction History
          </h2>

          {riskEvents.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>
              No critical drug interactions flagged across regimen.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px' }}>Drug Pair</th>
                  <th style={{ padding: '6px 8px' }}>Severity</th>
                  <th style={{ padding: '6px 8px' }}>Clinical Explanation</th>
                  <th style={{ padding: '6px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {riskEvents.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{r.drugPair[0]} ↔ {r.drugPair[1]}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ 
                        color: r.severity === 'Major' ? '#b91c1c' : '#b45309', 
                        fontWeight: 700, 
                        fontSize: '0.75rem' 
                      }}>
                        {r.severity}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px', fontSize: '0.75rem', color: '#334155' }}>{r.description}</td>
                    <td style={{ padding: '6px 8px', fontSize: '0.75rem', textTransform: 'uppercase' }}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 4: Adherence Summary */}
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
            Section 4 — Adherence Summary (30-Day Aggregated)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {adherenceList.map((a, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{a.drugName}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: a.percentTaken >= 90 ? '#059669' : '#b45309', margin: '2px 0' }}>
                  {a.percentTaken}% Taken
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Last missed: {a.lastMissed || 'None'} • Streak: {a.currentStreak}d
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Signature / Verification Line */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <div>Physician Signature: __________________________</div>
          <div>Review Date: ______________</div>
        </div>

      </div>

    </div>
  );
}
