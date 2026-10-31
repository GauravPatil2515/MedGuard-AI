import React, { useState } from 'react';
import { ChevronLeft, Info, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ScreenMolecularSafety({ onBack, onNavigateTab }) {
  const [activeModel, setActiveModel] = useState('herg');
  const [showMeaning, setShowMeaning] = useState(false);

  const modelData = {
    herg: {
      title: "hERG Cardiotoxicity",
      score: 88,
      riskLabel: "High Risk",
      riskBg: "#fee2e2",
      riskColor: "#dc2626",
      intervalLow: 79,
      intervalHigh: 98,
      modelType: "Random Forest (v1.0)",
      dataset: "TDC / FDA CiPA",
      explanation: "hERG (human Ether-à-go-go-Related Gene) potassium channels mediate cardiac repolarization (I_Kr). High risk prediction signifies severe potential for QT interval prolongation and lethal Torsades de Pointes."
    },
    tox21: {
      title: "Tox21 Nuclear Receptors",
      score: 64,
      riskLabel: "Moderate",
      riskBg: "#fef3c7",
      riskColor: "#b45309",
      intervalLow: 52,
      intervalHigh: 73,
      modelType: "GNN (Message Passing)",
      dataset: "NIH Tox21 Challenge",
      explanation: "Assesses binding promiscuity to aryl hydrocarbon and androgen receptors, indicating hepatic metabolic activation pathways."
    },
    clintox: {
      title: "ClinTox Clinical Failure",
      score: 72,
      riskLabel: "High Risk",
      riskBg: "#fee2e2",
      riskColor: "#dc2626",
      intervalLow: 65,
      intervalHigh: 81,
      modelType: "Graph Convolutional Network",
      dataset: "FDA Clinical Toxicity DB",
      explanation: "Predicts clinical trial attrition due to post-market adverse events or organ toxicities."
    },
    bbbp: {
      title: "BBBP Blood-Brain Penetration",
      score: 35,
      riskLabel: "Low Permeability",
      riskBg: "#dcfce7",
      riskColor: "#15803d",
      intervalLow: 28,
      intervalHigh: 44,
      modelType: "Attentive FP (GNN)",
      dataset: "MoleculeNet BBBP",
      explanation: "Low blood-brain barrier penetration signifies minimal central nervous system sedative side effects."
    }
  };

  const current = modelData[activeModel];

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
          Molecular Safety Analysis
        </h2>
      </div>

      {/* Model Selection Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: '#eafaf1',
        padding: '4px',
        borderRadius: '999px',
        marginBottom: '18px',
        border: '1px solid #d1fae5'
      }}>
        {['herg', 'tox21', 'clintox', 'bbbp'].map(m => (
          <button
            key={m}
            onClick={() => setActiveModel(m)}
            style={{
              flex: 1,
              padding: '7px 8px',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: activeModel === m ? '#0b382c' : 'transparent',
              color: activeModel === m ? '#ffffff' : '#166534',
              transition: 'all 0.15s ease'
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Scrollable Main Area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Main Risk Score Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e8ede8',
          borderRadius: '20px',
          padding: '18px',
          boxShadow: '0 4px 16px rgba(11, 56, 44, 0.04)'
        }}>
          {/* Card Title & Risk Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
                {current.title}
              </span>
              <Info size={15} color="#94a3b8" />
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '999px',
              background: current.riskBg,
              color: current.riskColor
            }}>
              {current.riskLabel}
            </span>
          </div>

          {/* Risk Score Big Number */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Risk Score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: current.riskColor, lineHeight: 1 }}>
                {current.score}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8' }}>
                / 100
              </span>
            </div>
          </div>

          {/* Gradient Risk Meter Bar */}
          <div style={{
            width: '100%',
            height: '10px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 85%, #991b1b 100%)',
            position: 'relative',
            marginBottom: '16px'
          }}>
            {/* Position indicator */}
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: `${current.score}%`,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#ffffff',
              border: `3px solid ${current.riskColor}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              transform: 'translateX(-50%)'
            }} />
          </div>

          {/* 95% Prediction Interval */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #edf2f7',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                95% Prediction Interval
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                {current.intervalLow}% — {current.intervalHigh}%
              </span>
            </div>
            {/* Range visualization */}
            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '999px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: `${current.intervalLow}%`,
                width: `${current.intervalHigh - current.intervalLow}%`,
                height: '100%',
                background: current.riskColor,
                borderRadius: '999px'
              }} />
            </div>
          </div>

          {/* Model Meta Details */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Model: </span>
              <strong style={{ color: '#334155' }}>{current.modelType}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Dataset: </span>
              <strong style={{ color: '#334155' }}>{current.dataset}</strong>
            </div>
          </div>

          {/* Accordion: What does this mean? */}
          <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <button
              onClick={() => setShowMeaning(!showMeaning)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#15803d',
                padding: '4px 0'
              }}
            >
              <span>What does this mean?</span>
              {showMeaning ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showMeaning && (
              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45, marginTop: '6px' }}>
                {current.explanation}
              </div>
            )}
          </div>
        </div>

        {/* Molecular Structure Graphic Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e8ede8',
          borderRadius: '20px',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(11, 56, 44, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Molecular Structure
            </span>
            <button style={{ color: '#64748b', padding: '4px' }}>
              <Maximize2 size={16} />
            </button>
          </div>

          {/* 2D/3D Chemical Molecule Graph SVG */}
          <div style={{
            width: '100%',
            height: '140px',
            background: '#fafcfb',
            borderRadius: '14px',
            border: '1px solid #f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <svg viewBox="0 0 240 120" style={{ width: '90%', height: '90%' }}>
              {/* Benzene ring bonds */}
              <polygon points="60,35 90,35 105,60 90,85 60,85 45,60" fill="none" stroke="#0f172a" strokeWidth="2.5" />
              <polygon points="65,42 85,42 95,60 85,78 65,78 55,60" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
              {/* Connecting chain */}
              <line x1="105" y1="60" x2="135" y2="60" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="135" y1="60" x2="155" y2="35" stroke="#0f172a" strokeWidth="2.5" />
              <line x1="135" y1="60" x2="155" y2="85" stroke="#0f172a" strokeWidth="2.5" />
              {/* Oxygen double bond */}
              <line x1="153" y1="33" x2="183" y2="33" stroke="#dc2626" strokeWidth="2" />
              <line x1="153" y1="37" x2="183" y2="37" stroke="#dc2626" strokeWidth="2" />
              <text x="188" y="38" fill="#dc2626" fontSize="12" fontWeight="bold">O</text>
              {/* Lactone / phenyl group */}
              <polygon points="155,85 185,85 200,105 185,115 155,115 140,105" fill="none" stroke="#0f172a" strokeWidth="2" />
              {/* 3D Atom Nodes */}
              <circle cx="60" cy="35" r="4.5" fill="#334155" />
              <circle cx="90" cy="35" r="4.5" fill="#334155" />
              <circle cx="105" cy="60" r="4.5" fill="#334155" />
              <circle cx="90" cy="85" r="4.5" fill="#334155" />
              <circle cx="60" cy="85" r="4.5" fill="#334155" />
              <circle cx="45" cy="60" r="4.5" fill="#334155" />
              <circle cx="135" cy="60" r="5" fill="#15803d" />
              <circle cx="155" cy="35" r="4.5" fill="#dc2626" />
            </svg>

            <span style={{
              position: 'absolute',
              bottom: '8px',
              right: '12px',
              fontSize: '0.68rem',
              color: '#94a3b8',
              fontFamily: 'monospace'
            }}>
              C19H16O4 (Warfarin)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
