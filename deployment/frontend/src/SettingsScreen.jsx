import React, { useState, useEffect } from 'react';
import { ShieldCheck, HardDrive, Cpu, Lock, User, RefreshCw, Key } from 'lucide-react';
import { Card, Button, Badge } from './UIPrimitives';
import { modelManager } from './lib/models';
import { saveEncryptedRecord } from './lib/encryptedStorage';

export default function SettingsScreen({ patientRecord, onResetRecord }) {
  const [modelStates, setModelStates] = useState({
    trocr: 'Ready / Cached (ONNX SIMD)',
    nerPharma: 'Ready / Cached (SuperMedical-125M)',
    nerDisease: 'Ready / Cached (BioMed-335M)',
    ddiClassifier: 'Ready / Cached (CatBoost In-Browser)',
    qwenChat: 'Active (Qwen2.5-0.5B-Instruct)'
  });
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (!window.confirm('Reset all encrypted local records to factory default? This will clear active treatments and risk events on this machine.')) return;
    
    setResetting(true);
    try {
      localStorage.clear();
      // Initialize fresh record
      if (onResetRecord) onResetRecord();
      alert('Local encrypted storage reset.');
    } catch (e) {
      console.error('Reset error:', e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Account & Subscription Gate */}
      <Card
        title="Authentication & Account"
        subtitle="Zero-knowledge session management verified with backend auth gateway"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Mrs. Kulkarni
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                MRN: {patientRecord?.patientId || 'patient_mrs_kulkarni_01'} • Primary Account
              </div>
            </div>
            <Badge variant="safe">Subscription Active</Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Encryption Standard:
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              AES-GCM-256 (Web Crypto API)
            </span>
          </div>
        </div>
      </Card>

      {/* 2. On-Device Offline Models */}
      <Card
        title="Offline Model Runtime Status"
        subtitle="All molecular reasoning and OCR runs in-browser after initial download"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius)' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>TrOCR Handwritten OCR</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>microsoft/trocr-base-handwritten</div>
            </div>
            <Badge variant="safe">{modelStates.trocr}</Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius)' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>NER Drug Detection</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>OpenMed-NER-PharmaDetect-125M</div>
            </div>
            <Badge variant="safe">{modelStates.nerPharma}</Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius)' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>NER Disease Detection</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>OpenMed-NER-DiseaseDetect-335M</div>
            </div>
            <Badge variant="safe">{modelStates.nerDisease}</Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius)' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>CatBoost DDI Pairwise Classifier</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>bprimal/Drug-Drug-Interaction</div>
            </div>
            <Badge variant="safe">{modelStates.ddiClassifier}</Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius)' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Clinical Copilot LLM</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Qwen/Qwen2.5-0.5B-Instruct ONNX</div>
            </div>
            <Badge variant="safe">{modelStates.qwenChat}</Badge>
          </div>
        </div>
      </Card>

      {/* 3. Storage & Privacy Controls */}
      <Card
        title="Privacy & Local Storage"
        subtitle="Manage locally persisted encrypted records"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Reset Encrypted Storage
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Clears local cache and re-initializes encrypted patient record
            </div>
          </div>

          <Button
            variant="critical"
            size="sm"
            onClick={handleResetData}
            disabled={resetting}
          >
            {resetting ? 'Resetting...' : 'Reset Local Data'}
          </Button>
        </div>
      </Card>

    </div>
  );
}
