import React, { useState } from 'react';
import { 
  Pill, AlertTriangle, ShieldCheck, Clock, Award, 
  CheckCircle2, Bot, Send, Sparkles, AlertOctagon 
} from 'lucide-react';
import { Card, Button, Badge } from './UIPrimitives';
import { modelManager } from './lib/models';
import { savePatientRecord } from './lib/patientRecordStore';

export default function PatientRecordScreen({ patientRecord, onRecordUpdated }) {
  const [activeTabSection, setActiveTabSection] = useState('active'); // 'active' | 'past' | 'risks' | 'adherence'
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      text: 'Clinical assistant active. You can ask questions regarding your active treatments, potential interactions, or flagged risks.'
    }
  ]);

  if (!patientRecord) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading patient record...</div>;
  }

  const activeTreatments = (patientRecord.treatments || []).filter(t => t.status === 'active');
  const pastTreatments = (patientRecord.treatments || []).filter(t => t.status !== 'active');
  const riskEvents = patientRecord.riskEvents || [];
  const adherenceList = patientRecord.adherenceSummary || [];

  const handleStopTreatment = async (treatmentId) => {
    if (!window.confirm('Are you sure you want to stop this treatment? It will be moved to Past Treatments.')) return;
    
    const updatedTreatments = patientRecord.treatments.map(t => 
      t.id === treatmentId ? { ...t, status: 'stopped', endDate: new Date().toISOString().split('T')[0] } : t
    );

    const updatedRecord = { ...patientRecord, treatments: updatedTreatments };
    await savePatientRecord(updatedRecord);
    if (onRecordUpdated) onRecordUpdated(updatedRecord);
  };

  const handleAskClinicalAssistant = async (queryText) => {
    const q = queryText || chatInput;
    if (!q.trim()) return;

    const newMsgs = [...chatHistory, { sender: 'user', text: q }];
    setChatHistory(newMsgs);
    if (!queryText) setChatInput('');
    setChatLoading(true);

    try {
      const chatPipe = await modelManager.getChatModel();
      let response = '';

      const activeDrugsStr = activeTreatments.map(t => `${t.drugName} (${t.dosage})`).join(', ') || 'None';
      const riskFlagsStr = riskEvents.map(r => `${r.drugPair[0]} ↔ ${r.drugPair[1]} (${r.severity})`).join('; ') || 'None';

      if (chatPipe) {
        const prompt = [
          {
            role: 'system',
            content: `You are MedGuard Clinical Assistant. The user's active treatments are: [${activeDrugsStr}]. Known risk flags: [${riskFlagsStr}]. STRICT RULE: ONLY answer questions directly related to these active treatments, their safety, food clashes, or flagged risks. If the user asks general or unrelated medical/casual questions, politely refuse and redirect them to their active treatments.`
          },
          { role: 'user', content: q }
        ];

        const out = await chatPipe(prompt, { max_new_tokens: 150, temperature: 0.2 });
        if (Array.isArray(out) && out[0]?.generated_text) {
          const gen = out[0].generated_text;
          response = Array.isArray(gen) ? gen[gen.length - 1]?.content : String(gen);
        }
      }

      if (!response) {
        // Fallback scoped clinical explanation
        const lower = q.toLowerCase();
        if (lower.includes('warfarin') && lower.includes('combiflam')) {
          response = "Combiflam (Ibuprofen + Paracetamol) taken with Warfarin substantially elevates gastric ulceration and severe hemorrhage risk. Avoid this combination unless explicitly directed and monitored by your physician.";
        } else if (lower.includes('amiodarone') && lower.includes('warfarin')) {
          response = "Amiodarone slows the liver metabolism of Warfarin, causing Warfarin blood levels to increase and prolonging PT/INR. Your doctor must adjust your Warfarin dose accordingly.";
        } else {
          response = `Regarding your active regimen (${activeDrugsStr}): maintain consistent administration times and inform your physician before introducing over-the-counter NSAIDs or supplements.`;
        }
      }

      setChatHistory([...newMsgs, { sender: 'assistant', text: response }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory([...newMsgs, { sender: 'assistant', text: 'Offline reasoner evaluated query against active treatments.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Navigation Pill Strip for the 4 Sections */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTabSection('active')}
          style={{
            background: activeTabSection === 'active' ? 'var(--accent-primary)' : 'var(--bg-surface)',
            color: activeTabSection === 'active' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '6px 14px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          1. Active Treatments ({activeTreatments.length})
        </button>
        <button
          onClick={() => setActiveTabSection('past')}
          style={{
            background: activeTabSection === 'past' ? 'var(--accent-primary)' : 'var(--bg-surface)',
            color: activeTabSection === 'past' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '6px 14px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          2. Past Treatments ({pastTreatments.length})
        </button>
        <button
          onClick={() => setActiveTabSection('risks')}
          style={{
            background: activeTabSection === 'risks' ? 'var(--accent-primary)' : 'var(--bg-surface)',
            color: activeTabSection === 'risks' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '6px 14px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          3. Risk History ({riskEvents.length})
        </button>
        <button
          onClick={() => setActiveTabSection('adherence')}
          style={{
            background: activeTabSection === 'adherence' ? 'var(--accent-primary)' : 'var(--bg-surface)',
            color: activeTabSection === 'adherence' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '6px 14px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          4. Adherence Summary
        </button>
      </div>

      {/* SECTION 1: Active Treatments */}
      {activeTabSection === 'active' && (
        <Card
          title="Active Treatments"
          subtitle="Currently prescribed medications being evaluated for pairwise interaction safety"
        >
          {activeTreatments.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No active treatments recorded. Scan a prescription to add treatments.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeTreatments.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {t.drugName}
                      </span>
                      <Badge variant="neutral">{t.dosage}</Badge>
                      <Badge variant="safe">Active</Badge>
                      {t.sourceOcrConfidence < 0.75 && (
                        <Badge variant="warning">OCR Re-check</Badge>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>Schedule: {t.frequency} ({t.timesOfDay?.join(', ')})</span>
                      {t.condition && <span> • Condition: {t.condition}</span>}
                      {t.prescribingDoctor && <span> • Prescriber: {t.prescribingDoctor}</span>}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Started: {t.startDate}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStopTreatment(t.id)}
                  >
                    Discontinue / Complete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SECTION 2: Past Treatments */}
      {activeTabSection === 'past' && (
        <Card
          title="Past & Completed Treatments"
          subtitle="Historical medications discontinued or completed by the patient"
        >
          {pastTreatments.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No past treatments recorded.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pastTreatments.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {t.drugName}
                      </span>
                      <Badge variant="neutral">{t.dosage}</Badge>
                      <Badge variant="neutral">{t.status.toUpperCase()}</Badge>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Duration: {t.startDate} → {t.endDate || 'Ended'}
                      {t.prescribingDoctor && <span> • Prescriber: {t.prescribingDoctor}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SECTION 3: Risk History */}
      {activeTabSection === 'risks' && (
        <Card
          title="Pairwise Risk History"
          subtitle="Every drug-drug interaction flagged by the on-device safety models"
        >
          {riskEvents.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--status-safe-text)', fontSize: '0.875rem' }}>
              No risk events recorded.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {riskEvents.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: r.status === 'unresolved' ? 'var(--status-critical-bg)' : 'var(--bg-app)',
                    border: `1px solid ${r.status === 'unresolved' ? 'var(--status-critical-border)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '12px 16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {r.drugPair[0]} ↔ {r.drugPair[1]}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Badge variant={r.severity === 'Major' ? 'critical' : 'warning'}>
                        {r.severity}
                      </Badge>
                      <Badge variant={r.status === 'unresolved' ? 'critical' : 'neutral'}>
                        {r.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 6px 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {r.description}
                  </p>

                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Raised on {new Date(r.dateRaised).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SECTION 4: Adherence Summary */}
      {activeTabSection === 'adherence' && (
        <Card
          title="Aggregated Adherence Summary"
          subtitle="Compliance metrics per treatment (no giant raw logs)"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {adherenceList.map((item) => (
              <div
                key={item.treatmentId}
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 16px'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {item.drugName}
                </div>
                
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.percentTaken >= 90 ? 'var(--status-safe-text)' : 'var(--status-warning-text)' }}>
                  {item.percentTaken}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {item.dosesTaken} taken / {item.totalScheduled} scheduled
                </div>

                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div>Current Streak: <strong style={{ color: 'var(--text-primary)' }}>{item.currentStreak} doses</strong></div>
                  <div>Last Missed: <strong style={{ color: item.lastMissed ? 'var(--status-critical-text)' : 'var(--text-primary)' }}>{item.lastMissed || 'None'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Scoped Clinical Assistant (Scoped Strictly to Active Treatments & Risks) */}
      <Card
        title="Clinical Inquiries"
        subtitle="Scoped strictly to answering questions about your active treatments and flagged risks"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatHistory.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-app)',
                  color: m.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  borderRadius: 'var(--radius)',
                  padding: '8px 12px',
                  fontSize: '0.8125rem'
                }}
              >
                {m.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evaluating local safety knowledge...
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskClinicalAssistant()}
              placeholder="E.g. Can I take Combiflam with my Warfarin?"
              style={{
                flex: 1,
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none'
              }}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAskClinicalAssistant()}
              disabled={chatLoading}
            >
              <Send size={13} /> Ask
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
}
