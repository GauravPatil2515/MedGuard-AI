import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, Loader2, Circle, Upload, Camera } from 'lucide-react';

export default function ScreenScanner({ onBack, onCompleteScan, API_BASE = "http://localhost:5000/api" }) {
  const [scanStep, setScanStep] = useState(2); // 0..4
  const [progressPct, setProgressPct] = useState(40);
  const [isScanning, setIsScanning] = useState(true);

  // Auto-progress simulation or user trigger
  useEffect(() => {
    if (!isScanning) return;
    const t1 = setTimeout(() => {
      setScanStep(3);
      setProgressPct(75);
    }, 2200);

    const t2 = setTimeout(() => {
      setScanStep(4);
      setProgressPct(100);
      setIsScanning(false);
      // Auto navigate after complete
      setTimeout(() => {
        if (onCompleteScan) onCompleteScan();
      }, 1000);
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isScanning]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanStep(1);
      setProgressPct(30);
      setIsScanning(true);
      const formData = new FormData();
      formData.append('image', file);
      fetch(`${API_BASE}/rx/ocr`, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        setScanStep(4);
        setProgressPct(100);
        setTimeout(() => onCompleteScan && onCompleteScan(data), 600);
      })
      .catch(() => {
        // Fallback demo completion
        setScanStep(4);
        setProgressPct(100);
        setTimeout(() => onCompleteScan && onCompleteScan(), 600);
      });
    }
  };

  return (
    <div style={{
      flex: 1,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 20px 28px 20px',
      position: 'relative'
    }}>
      {/* Top Bar */}
      <div>
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
            Prescription Scanner
          </h2>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#64748b',
          lineHeight: 1.4,
          margin: '0 auto 20px auto',
          maxWidth: '280px'
        }}>
          Upload a prescription to get a clear, personalized medication plan.
        </p>

        {/* Viewfinder Preview with Laser Beam Animation */}
        <div style={{
          width: '100%',
          height: '240px',
          background: '#1e293b',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Simulated prescription photo */}
          <div style={{
            width: '85%',
            height: '90%',
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            transform: 'rotate(-1.5deg)',
            fontFamily: 'monospace',
            color: '#334155',
            fontSize: '0.72rem',
            lineHeight: 1.6,
            position: 'relative',
            opacity: 0.95
          }}>
            <div style={{ fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px', color: '#0f172a' }}>
              DR. R.K. SHARMA, MD (CARDIOLOGY)
            </div>
            <div>Pt: Ms. Atharva (68F)  Date: 26/09/2026</div>
            <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 600 }}>
              Rx:<br />
              1. Tab Ecosprin 75mg OD (breakfast)<br />
              2. Tab Met-XL 50mg OD (breakfast)<br />
              3. Tab Warfarin 5mg OD (dinner)<br />
              4. Tab Amiodarone 200mg OD (dinner)<br />
              5. Tab Pantocid 40mg OD (before food)
            </div>
            <div style={{ position: 'absolute', bottom: '10px', right: '14px', fontStyle: 'italic', color: '#94a3b8' }}>
              Sign: R.K. Sharma
            </div>
          </div>

          {/* Animated Laser Scanner Line */}
          {isScanning && <div className="scanner-laser" />}

          {/* Scanning status pill badge */}
          {isScanning && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(11, 56, 44, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
              zIndex: 20
            }}>
              <Loader2 size={14} className="animate-spin" />
              <span>Scanning...</span>
            </div>
          )}

          {/* Viewfinder Corner Guides */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', width: '20px', height: '20px', borderTop: '3px solid #22c55e', borderLeft: '3px solid #22c55e', borderRadius: '4px 0 0 0' }} />
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', borderTop: '3px solid #22c55e', borderRight: '3px solid #22c55e', borderRadius: '0 4px 0 0' }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '20px', height: '20px', borderBottom: '3px solid #22c55e', borderLeft: '3px solid #22c55e', borderRadius: '0 0 0 4px' }} />
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '20px', height: '20px', borderBottom: '3px solid #22c55e', borderRight: '3px solid #22c55e', borderRadius: '0 0 4px 0' }} />
        </div>

        {/* Progress Bar with percentage */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: '#15803d',
              borderRadius: '999px',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
            {progressPct}%
          </span>
        </div>

        {/* Progress Checklist Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '8px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {scanStep >= 1 ? (
              <CheckCircle2 size={18} color="#16a34a" fill="#dcfce7" />
            ) : (
              <Circle size={18} color="#cbd5e1" />
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: scanStep >= 1 ? 600 : 400, color: scanStep >= 1 ? '#0f172a' : '#94a3b8' }}>
              Image received
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {scanStep >= 2 ? (
              <CheckCircle2 size={18} color="#16a34a" fill="#dcfce7" />
            ) : (
              <Circle size={18} color="#cbd5e1" />
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: scanStep >= 2 ? 600 : 400, color: scanStep >= 2 ? '#0f172a' : '#94a3b8' }}>
              Text extracted
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {scanStep === 2 ? (
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} className="animate-pulse" />
              </div>
            ) : scanStep > 2 ? (
              <CheckCircle2 size={18} color="#16a34a" fill="#dcfce7" />
            ) : (
              <Circle size={18} color="#cbd5e1" />
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: scanStep >= 3 ? 600 : 500, color: scanStep >= 3 ? '#0f172a' : '#15803d' }}>
              Identifying medicines
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {scanStep >= 4 ? (
              <CheckCircle2 size={18} color="#16a34a" fill="#dcfce7" />
            ) : (
              <Circle size={18} color="#cbd5e1" />
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: scanStep >= 4 ? 600 : 400, color: scanStep >= 4 ? '#0f172a' : '#94a3b8' }}>
              Checking for interactions
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {scanStep >= 4 ? (
              <CheckCircle2 size={18} color="#16a34a" fill="#dcfce7" />
            ) : (
              <Circle size={18} color="#cbd5e1" />
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: scanStep >= 4 ? 600 : 400, color: scanStep >= 4 ? '#0f172a' : '#94a3b8' }}>
              Preparing your medication plan
            </span>
          </div>

        </div>
      </div>

      {/* Bottom Button Row */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <label style={{
          flex: 1,
          height: '48px',
          borderRadius: '999px',
          border: '1.5px solid #e2e8f0',
          background: '#ffffff',
          color: '#334155',
          fontWeight: 600,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer'
        }}>
          <Upload size={16} />
          <span>Upload File</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        <button
          onClick={onBack}
          style={{
            flex: 1,
            height: '48px',
            borderRadius: '999px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#64748b',
            fontWeight: 600,
            fontSize: '0.88rem'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
