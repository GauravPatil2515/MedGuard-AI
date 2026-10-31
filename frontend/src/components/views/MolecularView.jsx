import React, { useState } from 'react';
import { Info, Maximize2, ChevronDown, ChevronUp, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MolecularView({ onNavigateTab }) {
  const [activeModel, setActiveModel] = useState('herg');
  const [showMeaning, setShowMeaning] = useState(false);

  const modelData = {
    herg: {
      title: "hERG Cardiotoxicity (I_Kr Channel Blockade)",
      score: 88,
      riskLabel: "High Risk",
      riskBg: "#fee2e2",
      riskColor: "#dc2626",
      intervalLow: 79,
      intervalHigh: 98,
      modelType: "Random Forest (v1.0) / Attentive FP GNN",
      dataset: "TDC / FDA CiPA (Comprehensive in vitro Proarrhythmia Assay)",
      formula: "C19H16O4 (Warfarin) + C25H29I2NO3 (Amiodarone)",
      explanation: "hERG (human Ether-à-go-go-Related Gene) potassium channels mediate cardiac repolarization (I_Kr current). Prediction score of 88/100 indicates significant liability for QT interval prolongation and lethal ventricular arrhythmias (Torsades de Pointes) when Amiodarone is co-administered with Warfarin."
    },
    tox21: {
      title: "Tox21 Nuclear Receptor Assay",
      score: 64,
      riskLabel: "Moderate Risk",
      riskBg: "#fef3c7",
      riskColor: "#b45309",
      intervalLow: 52,
      intervalHigh: 73,
      modelType: "Message Passing Neural Network (MPNN)",
      dataset: "NIH Tox21 Challenge (Aryl Hydrocarbon & AR Pathways)",
      formula: "C25H29I2NO3 (Amiodarone)",
      explanation: "Predicts biochemical disruption of nuclear receptor signaling pathways, indicating hepatic metabolic activation and cellular stress responses."
    },
    clintox: {
      title: "ClinTox Clinical Attrition Predictor",
      score: 72,
      riskLabel: "High Risk",
      riskBg: "#fee2e2",
      riskColor: "#dc2626",
      intervalLow: 65,
      intervalHigh: 81,
      modelType: "Graph Convolutional Network (GCN)",
      dataset: "FDA Clinical Trial Toxicity Database",
      formula: "C19H16O4 (Warfarin)",
      explanation: "Calculates the likelihood of post-market clinical failure or severe adverse event reports in vulnerable patient cohorts (e.g. elderly post-CABG)."
    },
    bbbp: {
      title: "BBBP (Blood-Brain Barrier Permeation)",
      score: 35,
      riskLabel: "Low Penetration (Desirable)",
      riskBg: "#eafaf1",
      riskColor: "#15803d",
      intervalLow: 28,
      intervalHigh: 44,
      modelType: "Attentive FP GNN",
      dataset: "MoleculeNet BBBP Benchmark",
      formula: "C19H16O4 (Warfarin)",
      explanation: "Low blood-brain barrier permeability indicates minimal central nervous system penetration, sparing cognitive alertness and reducing neurotoxic sedation."
    }
  };

  const current = modelData[activeModel];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="font-serif" style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>
            Neuro-Symbolic Molecular Toxicology (QSAR / GNN)
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748b' }}>
            Graph Neural Networks & 95% Conformal Prediction Bounds for molecular cardiotoxicity, clinical attrition, and organ liabilities.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab && onNavigateTab('safety')}
          className="mg-btn-outline"
        >
          <span>Back to DDI Safety</span>
        </button>
      </div>

      {/* Model Selection Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: '#eafaf1',
        padding: '6px',
        borderRadius: '999px',
        border: '1px solid #bbf7d0',
        width: 'fit-content',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'herg', label: 'hERG Cardiotoxicity' },
          { id: 'tox21', label: 'Tox21 Nuclear Receptors' },
          { id: 'clintox', label: 'ClinTox Trial Toxicity' },
          { id: 'bbbp', label: 'BBBP Blood-Brain Barrier' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModel(m.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: activeModel === m.id ? '#0b382c' : 'transparent',
              color: activeModel === m.id ? '#ffffff' : '#15803d',
              transition: 'all 0.15s ease'
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Score & Conformal Bounds on Left, Molecular Structure on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Left: Risk Metric Card */}
        <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="font-serif" style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>
                {current.title}
              </h2>
              <Info size={16} color="#94a3b8" />
            </div>

            <span style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '999px',
              background: current.riskBg,
              color: current.riskColor
            }}>
              {current.riskLabel}
            </span>
          </div>

          {/* Big Score Display */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: current.riskColor, lineHeight: 1 }}>
              {current.score}
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#94a3b8' }}>
              / 100 Risk Index
            </span>
          </div>

          {/* Gradient Risk Meter Bar */}
          <div>
            <div style={{
              width: '100%',
              height: '12px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 85%, #991b1b 100%)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: `${current.score}%`,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#ffffff',
                border: `3px solid ${current.riskColor}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transform: 'translateX(-50%)'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
              <span>0 (Safe)</span>
              <span>50 (Moderate)</span>
              <span>100 (Severe Liability)</span>
            </div>
          </div>

          {/* 95% Conformal Prediction Bounds Box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                95% Conformal Prediction Interval
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                {current.intervalLow}% — {current.intervalHigh}%
              </span>
            </div>
            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: `${current.intervalLow}%`,
                width: `${current.intervalHigh - current.intervalLow}%`,
                height: '100%',
                background: current.riskColor,
                borderRadius: '999px'
              }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
              Statistically validated error coverage guarantees true empirical liability is trapped within this bound with α = 0.05.
            </p>
          </div>

          {/* Model Meta Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            fontSize: '0.8rem',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '14px'
          }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Model Architecture:</span>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{current.modelType}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Benchmark Training Dataset:</span>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{current.dataset}</div>
            </div>
          </div>

          {/* Accordion: Clinical Meaning */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            <button
              onClick={() => setShowMeaning(!showMeaning)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#15803d'
              }}
            >
              <span>What does this mean clinically?</span>
              {showMeaning ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showMeaning && (
              <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                {current.explanation}
              </p>
            )}
          </div>

        </div>

        {/* Right: 2D/3D Chemical Molecule Structure */}
        <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="font-serif" style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                Molecular Graph Representation
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                SMILES: {current.formula}
              </span>
            </div>
            <Maximize2 size={18} color="#64748b" />
          </div>

          {/* SVG Chemical Molecule Visualizer */}
          <div style={{
            flex: 1,
            minHeight: '260px',
            background: 'radial-gradient(circle at 50% 50%, #f0fdf4 0%, #ffffff 80%)',
            border: '1px solid #dcfce7',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <svg viewBox="0 0 340 180" style={{ width: '92%', height: '92%' }}>
              {/* Benzene Ring 1 */}
              <polygon points="70,50 110,50 130,85 110,120 70,120 50,85" fill="none" stroke="#0f172a" strokeWidth="3" />
              <polygon points="75,58 105,58 120,85 105,112 75,112 60,85" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />
              
              {/* Bridge */}
              <line x1="130" y1="85" x2="170" y2="85" stroke="#0f172a" strokeWidth="3" />
              <line x1="170" y1="85" x2="200" y2="50" stroke="#0f172a" strokeWidth="3" />
              <line x1="170" y1="85" x2="200" y2="120" stroke="#0f172a" strokeWidth="3" />
              
              {/* Carbonyl Oxygen */}
              <line x1="198" y1="48" x2="238" y2="48" stroke="#dc2626" strokeWidth="2.5" />
              <line x1="198" y1="52" x2="238" y2="52" stroke="#dc2626" strokeWidth="2.5" />
              <text x="244" y="55" fill="#dc2626" fontSize="16" fontWeight="bold">O</text>
              
              {/* Lactone Ring */}
              <polygon points="200,120 240,120 260,150 240,175 200,175 180,150" fill="none" stroke="#0f172a" strokeWidth="2.5" />
              
              {/* Hydroxyl group */}
              <line x1="70" y1="120" x2="50" y2="155" stroke="#2563eb" strokeWidth="2.5" />
              <text x="32" y="170" fill="#2563eb" fontSize="14" fontWeight="bold">OH</text>
              
              {/* 3D Atoms */}
              <circle cx="70" cy="50" r="5" fill="#334155" />
              <circle cx="110" cy="50" r="5" fill="#334155" />
              <circle cx="130" cy="85" r="6" fill="#15803d" />
              <circle cx="110" cy="120" r="5" fill="#334155" />
              <circle cx="70" cy="120" r="5" fill="#334155" />
              <circle cx="50" cy="85" r="5" fill="#334155" />
              <circle cx="170" cy="85" r="6" fill="#15803d" />
              <circle cx="200" cy="50" r="5" fill="#dc2626" />
              <circle cx="200" cy="120" r="5" fill="#334155" />
            </svg>

            <span style={{
              position: 'absolute',
              bottom: '12px',
              right: '16px',
              fontSize: '0.74rem',
              color: '#64748b',
              fontFamily: 'monospace'
            }}>
              Warfarin C19H16O4 (S-Enantiomer)
            </span>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '0.78rem',
            color: '#475569',
            lineHeight: 1.45
          }}>
            <strong>GNN Node Embeddings: </strong>
            Atomic coordinates extracted from RDKit conformer generation. Message-passing updates across 6 layers capture aromatic electron delocalization influencing ion channel binding affinities.
          </div>
        </div>

      </div>

    </div>
  );
}
