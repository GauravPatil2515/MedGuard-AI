import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, Camera, Sparkles, Activity, Lock, 
  AlertTriangle, HeartPulse, FileText, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export default function LandingView({ onNavigateTab }) {
  const [selectedDemoPair, setSelectedDemoPair] = useState('warfarin_amiodarone');

  const demoScenarios = {
    warfarin_amiodarone: {
      drugs: "Warfarin (5mg) + Amiodarone (200mg)",
      severity: "CRITICAL",
      mechanism: "Amiodarone inhibits hepatic CYP2C9 and CYP3A4 enzymes, reducing S-warfarin clearance by 45%. This markedly elevates INR (> 5.0), causing severe internal bleeding risk combined with additive hERG cardiac toxicity.",
      action: "Reduce Warfarin dose by 35%–50% upon Amiodarone initiation. Monitor INR twice weekly."
    },
    warfarin_combiflam: {
      drugs: "Warfarin (5mg) + Combiflam (Ibuprofen + Paracetamol)",
      severity: "CRITICAL",
      mechanism: "NSAIDs inhibit COX-1 and suppress platelet aggregation while eroding gastric mucosa. Combined with Warfarin, the hazard ratio for major gastrointestinal hemorrhage increases 300% to 500%.",
      action: "Avoid OTC NSAIDs (Combiflam, Brufen). Prescribe plain Paracetamol (500mg) for fever or headache."
    },
    amiodarone_azithromycin: {
      drugs: "Amiodarone (200mg) + Azithromycin (500mg)",
      severity: "HIGH RISK",
      mechanism: "Both medications block the hERG potassium ion channel, synergistically delaying ventricular repolarization and predisposing to fatal Torsades de Pointes arrhythmia.",
      action: "Contraindicated combination. Select alternative antibiotic (e.g. Amoxicillin) with neutral electrophysiology."
    },
    pantoprazole_metoprolol: {
      drugs: "Pantoprazole (40mg) + Met-XL (50mg)",
      severity: "SAFE",
      mechanism: "No significant pharmacokinetic inhibition or pharmacodynamic competition. Safe concurrent administration for cardiovascular and gastroprotection regimen.",
      action: "Approved regimen. Take Pantoprazole 30 min before breakfast and Met-XL after meals."
    }
  };

  const activeScenario = demoScenarios[selectedDemoPair];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '40px' }}>
      
      {/* ── Top Hero Section ──────────────────────────────────────────────── */}
      <section style={{
        textAlign: 'center',
        padding: '36px 12px 10px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        
        {/* Futuristic Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'var(--mg-primary-light)',
          borderRadius: '999px',
          border: '1px solid rgba(22, 101, 52, 0.2)',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--mg-primary)'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mg-primary)' }} className="pulse-dot" />
          <span>Privacy-First • 100% In-Browser Clinical Safety Copilot</span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: 'var(--mg-text-main)',
          maxWidth: '850px',
          margin: 0
        }}>
          Prevent Fatal Medication Clashes <br />
          <span style={{ color: 'var(--mg-primary)' }}>Before The First Dose.</span>
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: 'clamp(0.98rem, 1.8vw, 1.15rem)',
          lineHeight: 1.55,
          color: 'var(--mg-text-muted)',
          maxWidth: '680px',
          margin: 0
        }}>
          Runs 100% of handwritten OCR, molecular cardiotoxicity GNNs, and multi-drug interaction screening directly on-device in your web browser — zero patient health information ever leaves your hardware.
        </p>

        {/* Primary Call to Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '8px'
        }}>
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.96rem', boxShadow: '0 4px 14px rgba(22, 101, 52, 0.25)' }}
          >
            <span>Enter Patient Portal</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => onNavigateTab('scanner')}
            className="btn-ghost"
            style={{ padding: '12px 20px', fontSize: '0.96rem' }}
          >
            <Camera size={16} />
            <span>Scan Prescription</span>
          </button>

          <button
            onClick={() => onNavigateTab('safety')}
            className="btn-ghost"
            style={{ padding: '12px 20px', fontSize: '0.96rem' }}
          >
            <ShieldCheck size={16} />
            <span>Safety Studio</span>
          </button>
        </div>

      </section>

      {/* ── Hero Showcase Visual ─────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--mg-card-border)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
        background: '#0f172a'
      }}>
        <img 
          src="/assets/landing_hero.jpg" 
          alt="MedGuard AI Clinical Intelligence Engine"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '480px',
            objectFit: 'cover',
            display: 'block',
            opacity: 0.95
          }}
        />

        {/* Floating Trust Pills Overlay (Desktop) */}
        <div className="desktop-only" style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '999px',
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Lock size={14} style={{ color: '#4ade80' }} />
            <span>AES-GCM (256-bit) In-Browser Encrypted Vault</span>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '999px',
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <HeartPulse size={14} style={{ color: '#f87171' }} />
            <span>hERG Ion Channel QSAR GNN Prediction</span>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '999px',
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={14} style={{ color: '#60a5fa' }} />
            <span>21 CFR Part 11 Tamper-Evident SHA-256 Ledger</span>
          </div>
        </div>
      </section>

      {/* ── 4 Core Pillars Grid ───────────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--mg-text-main)', margin: '0 0 6px 0' }}>
            Built for High-Stakes Clinical Safety
          </h2>
          <p className="meta-text" style={{ fontSize: '0.9rem' }}>
            Traditional LLM wrappers leak private medical notes to cloud APIs. MedGuard flips the architecture by keeping all computation on-device.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          
          <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--mg-primary-light)',
              color: 'var(--mg-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
              Zero-Server PHI Privacy
            </h3>
            <p className="meta-text" style={{ lineHeight: 1.5, margin: 0 }}>
              All prescription images, extracted drug names, and diagnostic notes are encrypted with 256-bit AES-GCM and stored in browser IndexedDB. Zero medical data leaves the device.
            </p>
          </div>

          <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HeartPulse size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
              Molecular Cardiotoxicity
            </h3>
            <p className="meta-text" style={{ lineHeight: 1.5, margin: 0 }}>
              Attentive FP Graph Neural Network evaluates hERG potassium channel binding affinity, predicting drug-induced QT prolongation with 95% conformal prediction intervals.
            </p>
          </div>

          <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
              Caregiver Live Escalation
            </h3>
            <p className="meta-text" style={{ lineHeight: 1.5, margin: 0 }}>
              Real-time Server-Sent Events (SSE) telemetry stream dispatches urgent notifications to family caregivers when high-criticality medications like Warfarin are missed.
            </p>
          </div>

          <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: '#e0e7ff',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
              21 CFR Part 11 Ledger
            </h3>
            <p className="meta-text" style={{ lineHeight: 1.5, margin: 0 }}>
              Tamper-evident cryptographic Write-Ahead Log records every dose verification, prescription scan, and clinical query using SHA-256 hash chaining and HMAC integrity.
            </p>
          </div>

        </div>
      </section>

      {/* ── Interactive DDI Sandbox ──────────────────────────────────────── */}
      <section className="mg-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: 'var(--mg-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--mg-text-main)' }}>
                Live Interaction Triage Sandbox
              </h3>
            </div>
            <p className="meta-text" style={{ marginTop: '4px' }}>
              Select a drug pair to test in-browser clinical pharmacology analysis:
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('safety')}
            className="btn-ghost"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <span>Open Safety Studio</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Demo Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0 20px 0' }}>
          {[
            { id: 'warfarin_amiodarone', label: 'Warfarin + Amiodarone' },
            { id: 'warfarin_combiflam', label: 'Warfarin + Combiflam' },
            { id: 'amiodarone_azithromycin', label: 'Amiodarone + Azithromycin' },
            { id: 'pantoprazole_metoprolol', label: 'Pantoprazole + Metoprolol' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedDemoPair(tab.id)}
              className={selectedDemoPair === tab.id ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Readout Card */}
        <div style={{
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          background: activeScenario.severity === 'CRITICAL' ? 'var(--mg-danger-soft)' : activeScenario.severity === 'HIGH RISK' ? '#fff7ed' : 'var(--mg-success-soft)',
          border: activeScenario.severity === 'CRITICAL' ? '1px solid var(--mg-danger-border)' : activeScenario.severity === 'HIGH RISK' ? '1px solid #fed7aa' : '1px solid rgba(22, 101, 52, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <strong style={{ fontSize: '1.05rem', color: 'var(--mg-text-main)' }}>
              {activeScenario.drugs}
            </strong>
            <StatusBadge 
              type={activeScenario.severity === 'CRITICAL' ? "danger" : activeScenario.severity === 'HIGH RISK' ? "warning" : "success"}
              label={activeScenario.severity}
            />
          </div>

          <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--mg-text-main)', marginBottom: '10px' }}>
            <strong>Pharmacological Mechanism: </strong>{activeScenario.mechanism}
          </div>

          <div style={{
            fontSize: '0.84rem',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            color: 'var(--mg-text-main)'
          }}>
            <strong>Clinical Directive: </strong>{activeScenario.action}
          </div>
        </div>
      </section>

      {/* ── Ready to Start Banner ────────────────────────────────────────── */}
      <section style={{
        textAlign: 'center',
        padding: '30px 20px',
        background: 'var(--mg-card-subtle)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--mg-card-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--mg-text-main)' }}>
          Ready to verify clinical safety?
        </h3>
        <p className="meta-text" style={{ maxWidth: '500px', margin: 0 }}>
          Launch the patient intake flow for Ms. Atharva or upload a new handwritten prescription now.
        </p>
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="btn-primary"
          style={{ padding: '12px 26px', fontSize: '0.94rem', marginTop: '6px' }}
        >
          <span>Launch Clinical Dashboard</span>
          <ArrowRight size={16} />
        </button>
      </section>

    </div>
  );
}
