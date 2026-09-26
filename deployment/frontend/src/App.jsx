import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Home, Camera, FileText, Share2, Settings, Lock
} from 'lucide-react';
import HomeScreen from './HomeScreen';
import ScanScreen from './ScanScreen';
import PatientRecordScreen from './PatientRecordScreen';
import ShareScreen from './ShareScreen';
import SettingsScreen from './SettingsScreen';
import OfflineSetupModal from './lib/OfflineSetupModal';
import { modelManager } from './lib/models';
import { loadPatientRecord, savePatientRecord } from './lib/patientRecordStore';
import { Badge } from './UIPrimitives';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'scan' | 'record' | 'share' | 'settings'
  const [patientRecord, setPatientRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  // Offline AI Setup State
  const [modelsReady, setModelsReady] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(modelManager.status);

  // Load PatientRecord from encrypted IndexedDB
  const refreshRecord = async () => {
    try {
      const record = await loadPatientRecord('patient_mrs_kulkarni_01');
      setPatientRecord(record);
    } catch (e) {
      console.error('Error loading patient record:', e);
    } finally {
      setLoadingRecord(false);
    }
  };

  useEffect(() => {
    refreshRecord();

    // Auto-start downloading/caching on-device models immediately upon refresh
    setModelsReady(false);
    setShowSetupModal(true);

    modelManager.onProgress((st) => {
      setDownloadStatus(st);
      if (st.overall >= 100) {
        setModelsReady(true);
        setTimeout(() => {
          setShowSetupModal(false);
        }, 1200);
      }
    });

    // Automatically trigger preload/download on mount
    modelManager.preloadAllModels().then(() => {
      setModelsReady(true);
      setTimeout(() => setShowSetupModal(false), 1000);
    }).catch((err) => {
      console.warn('Model preloading finished with fallback:', err);
      setModelsReady(true);
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Auto-Triggered Offline Model Setup Modal */}
      <OfflineSetupModal
        isOpen={showSetupModal}
        status={downloadStatus}
        onDismiss={() => setShowSetupModal(false)}
        onRetry={() => {
          modelManager.preloadAllModels();
        }}
      />

      {/* Top Clinical Header (Excluded from Print) */}
      <header className="no-print" style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-6)',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo / Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-base)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              MedGuard AI
            </span>
            <span style={{ height: '14px', width: '1px', background: 'var(--border-default)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Mrs. Kulkarni (MRN: 8842)
            </span>
          </div>

          {/* Privacy & Real-Time Model Download Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {downloadStatus.overall < 100 ? (
              <button
                onClick={() => setShowSetupModal(true)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                title="Click to view model download progress"
              >
                <Badge variant="warning">
                  Downloading Models ({downloadStatus.overall}%)
                </Badge>
              </button>
            ) : (
              <Badge variant="safe">
                <Lock size={11} style={{ marginRight: '4px' }} /> 100% On-Device (Ready)
              </Badge>
            )}
          </div>
        </div>

        {/* 5-Screen Navigation Tabs */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-6)',
          display: 'flex',
          gap: 'var(--space-1)',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === 'home' ? 'var(--font-medium)' : 'var(--font-regular)',
              color: activeTab === 'home' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'home' ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              whiteSpace: 'nowrap'
            }}
          >
            <Home size={15} />
            Home
          </button>

          <button
            onClick={() => setActiveTab('scan')}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === 'scan' ? 'var(--font-medium)' : 'var(--font-regular)',
              color: activeTab === 'scan' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'scan' ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              whiteSpace: 'nowrap'
            }}
          >
            <Camera size={15} />
            Scan
          </button>

          <button
            onClick={() => setActiveTab('record')}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === 'record' ? 'var(--font-medium)' : 'var(--font-regular)',
              color: activeTab === 'record' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'record' ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              whiteSpace: 'nowrap'
            }}
          >
            <FileText size={15} />
            Patient Record
          </button>

          <button
            onClick={() => setActiveTab('share')}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === 'share' ? 'var(--font-medium)' : 'var(--font-regular)',
              color: activeTab === 'share' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'share' ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              whiteSpace: 'nowrap'
            }}
          >
            <Share2 size={15} />
            Share
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === 'settings' ? 'var(--font-medium)' : 'var(--font-regular)',
              color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'settings' ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              whiteSpace: 'nowrap'
            }}
          >
            <Settings size={15} />
            Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: 'var(--space-6)',
        flex: 1
      }}>
        {loadingRecord ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading encrypted patient record...
          </div>
        ) : (
          <>
            {/* 1. HOME SCREEN */}
            {activeTab === 'home' && (
              <HomeScreen
                patientRecord={patientRecord}
                downloadStatus={downloadStatus}
                onOpenSetupModal={() => setShowSetupModal(true)}
                onRecordUpdated={setPatientRecord}
                onNavigateToScan={() => setActiveTab('scan')}
                onNavigateToRecord={() => setActiveTab('record')}
              />
            )}

            {/* 2. SCAN SCREEN */}
            {activeTab === 'scan' && (
              <ScanScreen
                patientRecord={patientRecord}
                onRecordUpdated={setPatientRecord}
                onComplete={() => setActiveTab('home')}
              />
            )}

            {/* 3. PATIENT RECORD SCREEN */}
            {activeTab === 'record' && (
              <PatientRecordScreen
                patientRecord={patientRecord}
                onRecordUpdated={setPatientRecord}
              />
            )}

            {/* 4. SHARE SCREEN */}
            {activeTab === 'share' && (
              <ShareScreen
                patientRecord={patientRecord}
              />
            )}

            {/* 5. SETTINGS SCREEN */}
            {activeTab === 'settings' && (
              <SettingsScreen
                patientRecord={patientRecord}
                onResetRecord={refreshRecord}
              />
            )}
          </>
        )}
      </main>

    </div>
  );
}
