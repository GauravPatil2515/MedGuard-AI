import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Download, AlertCircle, RefreshCw, X } from 'lucide-react';
import { DownloadStatus } from './models';
import { Card, Button, Badge } from '../UIPrimitives';

interface Props {
  isOpen: boolean;
  status: DownloadStatus;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function OfflineSetupModal({ isOpen, status, onRetry, onDismiss }: Props) {
  if (!isOpen) return null;

  const modelsList = [
    { key: 'chat', name: 'Clinical Copilot (Qwen2.5-0.5B-Instruct)', size: '~350MB', data: status.chat },
    { key: 'ocr', name: 'Prescription Handwriting OCR (TrOCR-Small)', size: '~250MB', data: status.ocr },
    { key: 'drugNER', name: 'PharmaNER Drug Extraction Engine', size: '~80MB', data: status.drugNER },
    { key: 'ddi', name: 'CatBoost Drug-Drug Interaction Classifier', size: '~20MB', data: status.ddi }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        maxWidth: '540px',
        width: '100%',
        boxShadow: 'var(--shadow-modal)',
        color: 'var(--text-primary)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              padding: '8px',
              borderRadius: 'var(--radius)',
              color: 'var(--accent-primary)',
              display: 'flex'
            }}>
              <Download size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Downloading On-Device Clinical Models
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Auto-download initiated upon launch. Models are cached locally in your browser for zero-server inference.
              </p>
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Minimize to background"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Hardware Target & Storage Details */}
        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Cpu size={14} style={{ color: status.device === 'webgpu' ? 'var(--status-safe-text)' : 'var(--text-secondary)' }} />
            <span>Target: <strong style={{ color: 'var(--text-primary)' }}>{status.device === 'webgpu' ? 'WebGPU' : 'WASM (CPU)'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-safe-text)' }}>
            <HardDrive size={13} />
            <span>Browser CacheStorage</span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            <span>Total Cache Progress</span>
            <span style={{ color: 'var(--accent-primary)' }}>{status.overall}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${status.overall}%`,
              height: '100%',
              background: 'var(--accent-primary)',
              transition: 'width 0.25s ease'
            }} />
          </div>
        </div>

        {/* Per-Model Progress List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
          {modelsList.map((m) => (
            <div
              key={m.key}
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '10px 12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {m.size} {m.data.file ? `• ${m.data.file}` : ''}
                  </div>
                </div>
                <Badge variant={m.data.status === 'ready' ? 'safe' : (m.data.status === 'error' ? 'critical' : 'neutral')}>
                  {m.data.status === 'ready' ? 'Ready' : (m.data.status === 'error' ? 'Failed' : `${m.data.progress}%`)}
                </Badge>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${m.data.progress}%`,
                  height: '100%',
                  background: m.data.status === 'error' ? 'var(--status-critical-text)' : 'var(--accent-primary)',
                  transition: 'width 0.2s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--status-safe-text)' }} />
            <span>Zero server transmission: Models live and run on your machine.</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onDismiss && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDismiss}
              >
                Continue in Background
              </Button>
            )}
            {onRetry && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRetry}
              >
                <RefreshCw size={13} /> Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
