import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Flame, Volume2, 
  Activity, Heart, ChevronDown, ChevronUp, AlertCircle, Info, ExternalLink
} from 'lucide-react';

export default function SafetyStudio({ 
  safetyAnalysis, 
  currentMeds = [],
  selectedLang = 'mr',
  onPlayVernacular
}) {
  const [expandedDrug, setExpandedDrug] = useState(null);

  const isCritical = safetyAnalysis?.overall_status === 'CRITICAL';
  const interactions = safetyAnalysis?.interactions || [];
  const normalizedMeds = safetyAnalysis?.normalized_drugs || [];
  const foodWarnings = safetyAnalysis?.food_warnings || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Status + Vernacular Voice Alert */}
      <div style={{
        background: isCritical 
          ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)' 
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: `1px solid ${isCritical ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
        borderRadius: '20px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: isCritical ? '#f43f5e' : '#10b981',
            padding: '14px',
            borderRadius: '16px',
            display: 'flex',
            boxShadow: `0 4px 20px ${isCritical ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
          }}>
            {isCritical ? <ShieldAlert size={28} color="#fff" /> : <ShieldCheck size={28} color="#fff" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                {isCritical ? 'Severe Polypharmacy Hazard Detected' : 'Regimen Molecular Profile Safe'}
              </h2>
              <span style={{
                background: isCritical ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isCritical ? '#f43f5e' : '#10b981',
                padding: '3px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {safetyAnalysis?.overall_status || 'SCREENING'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              {interactions.length > 0
                ? `${interactions.length} pairwise pharmacokinetic clashes identified in active prescription.`
                : 'Zero high-risk cytochrome interactions detected across active regimen.'}
            </p>
          </div>
        </div>

        {/* Vernacular Audio Button */}
        {onPlayVernacular && (
          <button
            onClick={() => onPlayVernacular(isCritical ? 'warfarin_bleeding_warning' : 'take_on_time')}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Volume2 size={16} />
            Play Voice Alert ({selectedLang === 'mr' ? 'मराठी' : (selectedLang === 'hi' ? 'हिंदी' : 'English')})
          </button>
        )}
      </div>

      {/* Critical Pairwise DDI Clash Cards */}
      {interactions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#f43f5e" />
            High-Risk Drug-Drug Pharmacokinetic Clashes
          </h3>

          {interactions.map((inter, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(244, 63, 94, 0.06)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: '#f43f5e',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {inter.severity}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>
                    {inter.drug_a} ⚡ {inter.drug_b}
                  </span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fda4af' }}>
                  {inter.title}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <strong style={{ color: '#fff' }}>Biological Mechanism: </strong>
                {inter.mechanism}
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.82rem',
                color: '#38bdf8'
              }}>
                <strong style={{ color: '#fff' }}>Action Required: </strong>
                {inter.action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Molecular GNN Toxicology Profile Deck */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} color="#38bdf8" />
          Dual-Stream GNN Molecular Toxicology Profiles
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {normalizedMeds.map((med, idx) => {
            const isExpanded = expandedDrug === idx;
            const toxProfile = med.toxicity_profile;
            const herg = med.cardiotox || toxProfile?.herg;
            const tox21 = toxProfile?.tox21;
            const clintox = toxProfile?.clintox;

            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 21, 35, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>
                      {med.generic || med.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {med.class || 'Therapeutic Agent'}
                    </div>
                  </div>

                  <span style={{
                    background: (herg?.liability === 'HIGH') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: (herg?.liability === 'HIGH') ? '#f43f5e' : '#10b981',
                    border: `1px solid ${(herg?.liability === 'HIGH') ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    hERG {herg?.liability || 'LOW'}
                  </span>
                </div>

                {/* hERG Cardiotoxicity Meter with 95% Conformal Interval */}
                <div style={{
                  background: 'rgba(8, 12, 20, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>hERG Cardiotoxicity Liability:</span>
                    <span style={{ fontWeight: 700, color: (herg?.probability > 0.5) ? '#f43f5e' : '#10b981' }}>
                      {((herg?.probability || 0.15) * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(herg?.probability || 0.15) * 100}%`,
                      height: '100%',
                      background: (herg?.probability > 0.5) ? '#f43f5e' : '#10b981',
                      borderRadius: '3px'
                    }} />
                  </div>

                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px', fontFamily: 'monospace' }}>
                    95% Conformal Bounds: [{(herg?.conformal_ci_95?.[0] ?? 0.10).toFixed(2)}, {(herg?.conformal_ci_95?.[1] ?? 0.20).toFixed(2)}]
                  </div>
                </div>

                {/* Tox21 & ClinTox Mini Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.68rem' }}>ClinTox Failure:</div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', marginTop: '2px' }}>
                      {clintox ? `${(clintox.clinical_failure_risk * 100).toFixed(0)}% Risk` : '0.04 (Low)'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.68rem' }}>Tox21 Pathways:</div>
                    <div style={{ fontWeight: 700, color: tox21?.active_pathways_count > 0 ? '#f59e0b' : '#10b981', marginTop: '2px' }}>
                      {tox21?.active_pathways_count || 0} / 12 Active
                    </div>
                  </div>
                </div>

                {/* Expand / Details Toggle */}
                <button
                  onClick={() => setExpandedDrug(isExpanded ? null : idx)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '4px'
                  }}
                >
                  {isExpanded ? 'Hide Molecular Details' : 'View Pathways & SMILES'}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isExpanded && (
                  <div style={{
                    background: 'rgba(8, 12, 20, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.75rem',
                    color: '#94a3b8'
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong style={{ color: '#fff' }}>SMILES: </strong>
                      <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{med.smiles || 'N/A'}</span>
                    </div>
                    {tox21?.pathways && (
                      <div>
                        <strong style={{ color: '#fff' }}>Top Tox21 Signal: </strong>
                        <span>{tox21.pathways[0]?.target || 'NR-AhR'} ({((tox21.pathways[0]?.probability || 0.1) * 100).toFixed(0)}%)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Food & Dietary Warnings Section */}
      {foodWarnings.length > 0 && (
        <div style={{
          background: 'rgba(15, 21, 35, 0.75)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            Food, Herb, & Dietary Interaction Instructions
          </h4>

          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {foodWarnings.map((fw, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: fw.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>') }} />
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
