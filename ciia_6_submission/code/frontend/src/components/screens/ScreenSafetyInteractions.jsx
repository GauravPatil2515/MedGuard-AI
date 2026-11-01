import React, { useState } from 'react';
import { ChevronLeft, AlertTriangle, Volume2, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ScreenSafetyInteractions({
  onBack,
  onNavigateTab,
  API_BASE = "http://localhost:5000/api"
}) {
  const [activeSubTab, setActiveSubTab] = useState('interactions');
  const [playingId, setPlayingId] = useState(null);

  const interactions = [
    {
      id: "warfarin_amiodarone",
      drugs: "Warfarin + Amiodarone",
      severity: "High Risk",
      severityBg: "#fee2e2",
      severityColor: "#dc2626",
      summary: "May increase anticoagulant effect and risk of serious bleeding.",
      whyMatters: "Amiodarone can alter how warfarin is processed in the body, potentially increasing blood levels and bleeding risk."
    },
    {
      id: "warfarin_ibuprofen",
      drugs: "Warfarin + Ibuprofen",
      severity: "High",
      severityBg: "#fee2e2",
      severityColor: "#dc2626",
      summary: "Increased risk of gastrointestinal bleeding.",
      whyMatters: "NSAIDs inhibit platelet aggregation and may damage gastric mucosa when combined with vitamin K antagonists."
    },
    {
      id: "amiodarone_metoprolol",
      drugs: "Amiodarone + Metoprolol",
      severity: "Moderate",
      severityBg: "#fef3c7",
      severityColor: "#b45309",
      summary: "May cause excessive reduction in heart rate.",
      whyMatters: "Both agents depress AV nodal conduction and chronotropic sinus rate, risking severe bradycardia."
    }
  ];

  const handleListen = async (item) => {
    setPlayingId(item.id);
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`${item.drugs}. ${item.summary} ${item.whyMatters}`);
      msg.onend = () => setPlayingId(null);
      window.speechSynthesis.speak(msg);
    } else {
      setTimeout(() => setPlayingId(null), 2500);
    }
  };

  return (
    <div style={{
      flex: 1,
      background: '#f8faf8',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px 24px 20px',
      position: 'relative'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
        <button 
          onClick={onBack}
          style={{ color: '#0f172a', padding: '6px', marginLeft: '-6px' }}
        >
          <ChevronLeft size={24} />
        </button>
        <h2 style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: 0,
          marginRight: '24px'
        }}>
          Medication Safety
        </h2>
      </div>

      {/* Sub Tabs Pill Row */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: '#eafaf1',
        padding: '4px',
        borderRadius: '999px',
        marginBottom: '18px',
        border: '1px solid #d1fae5'
      }}>
        <button
          onClick={() => setActiveSubTab('interactions')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            background: activeSubTab === 'interactions' ? '#0b382c' : 'transparent',
            color: activeSubTab === 'interactions' ? '#ffffff' : '#166534',
            transition: 'all 0.15s ease'
          }}
        >
          Interactions
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('molecular')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            background: 'transparent',
            color: '#166534'
          }}
        >
          Molecular Analysis
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('fda_signals')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            background: 'transparent',
            color: '#166534'
          }}
        >
          FDA Signals
        </button>
      </div>

      {/* Interactions List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {interactions.map((item, idx) => (
          <div
            key={item.id}
            style={{
              background: '#ffffff',
              border: idx === 0 ? '1px solid #fee2e2' : '1px solid #e8ede8',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: idx === 0 ? '0 4px 14px rgba(239, 68, 68, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}
          >
            {/* Header: Title and Severity Badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: item.severityBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.severityColor,
                flexShrink: 0
              }}>
                <AlertTriangle size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.drugs}
                  </h4>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: item.severityBg,
                    color: item.severityColor
                  }}>
                    {item.severity}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>
                  {item.summary}
                </p>
              </div>
            </div>

            {/* Why This Matters (Accordion/Expanded) */}
            {item.whyMatters && (
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '10px 12px',
                marginTop: '10px',
                fontSize: '0.76rem',
                color: '#475569',
                lineHeight: 1.45
              }}>
                <strong style={{ color: '#0f172a' }}>Why this matters: </strong>
                {item.whyMatters}
              </div>
            )}

            {/* Action Buttons for Card 1 */}
            {idx === 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('molecular')}
                  style={{
                    flex: 1,
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#334155'
                  }}
                >
                  View Full Details
                </button>
                <button
                  onClick={() => handleListen(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#334155'
                  }}
                >
                  <Volume2 size={14} className={playingId === item.id ? 'animate-pulse' : ''} />
                  <span>Listen</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
