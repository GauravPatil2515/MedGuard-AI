import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Check, RefreshCw, ArrowRight, ShieldAlert, 
  PlusCircle, Upload, Heart, Pill as PillIcon, QrCode, ExternalLink
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import PageHeader from '../ui/PageHeader';
import Section from '../ui/Section';
import StatusBadge from '../ui/StatusBadge';
import { parseQRData, formatMedicineForDisplay } from '../../lib/qrGenerator';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

let html5QrCodeScanner = null;

export default function ScannerView({
  onNavigateTab
}) {
  const { user } = useAuth();
  const patientId = user?.id;

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgressText, setOcrProgressText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [newlyTriggeredRisk, setNewlyTriggeredRisk] = useState(null);
  const [scannedMedicine, setScannedMedicine] = useState(null);
  const [qrScanMode, setQrScanMode] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const qrScannerRef = useRef(null);
  const qrContainerRef = useRef(null);

  useEffect(() => {
    if (patientId) {
      api.getMedicines()
        .then(res => setMedicines(res.medicines || []))
        .catch(() => setMedicines([]));
    }
  }, [patientId]);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const handleQRScanSuccess = (decodedString) => {
    try {
      const qrData = parseQRData(decodedString);
      if (qrData && qrData.type === 'medicine') {
        const display = formatMedicineForDisplay(qrData);
        setScannedMedicine({
          name: display.name,
          dosage: qrData.dosage || display.dosage,
          frequency: qrData.frequency || 'OD (Once Daily)',
          times: qrData.times || ['09:00'],
          condition: qrData.description || display.description,
          prescribingDoctor: qrData.prescribingDoctor || 'From QR Label',
          criticality: qrData.criticality || 'MEDIUM',
          meal_timing: qrData.meal_timing || 'AFTER_FOOD',
          _qrData: qrData,
          _medicineId: qrData.id,
        });
        setAddedSuccess(false);
        setNewlyTriggeredRisk(null);
        stopQRScanner();
      }
    } catch (e) {
      console.warn('QR parse error:', e);
    }
  };

  const startQRScanner = async () => {
    if (!qrContainerRef.current) return;
    
    stopCamera();
    setCameraError(null);
    setIsCameraActive(true);
    setCapturedImage(null);
    setScannedMedicine(null);
    setExtractedData(null);
    
    try {
      qrScannerRef.current = new Html5Qrcode('qr-reader');
      
      await qrScannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 300, height: 300 }
        },
        (decodedText) => {
          handleQRScanSuccess(decodedText);
          qrScannerRef.current?.clear().catch(() => {});
          setIsCameraActive(false);
        },
        (errorMessage) => {
        }
      );
    } catch (err) {
      console.warn('QR scanner error:', err);
      setCameraError("QR scanner unavailable. Use preset buttons below or upload an image.");
      setIsCameraActive(false);
    }
  };

  const stopQRScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear().catch(() => {});
      qrScannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    setIsCameraActive(true);
    setCapturedImage(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera unavailable. Use preset buttons below or upload an image.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    stopQRScanner();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    await processImageOCR(dataUrl);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setCapturedImage(dataUrl);
      await processImageOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processImageOCR = async (imageSource) => {
    setIsProcessing(true);
    setOcrProgressText('Reading prescription...');
    setAddedSuccess(false);
    setNewlyTriggeredRisk(null);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
      const formData = new FormData();
      const blob = await fetch(imageSource).then(r => r.blob());
      formData.append('image', blob, 'prescription.jpg');
      
      const res = await fetch(`${API_BASE}/rx/ocr`, { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.extracted_drugs && data.extracted_drugs.length > 0) {
        const primary = data.extracted_drugs[0];
        setExtractedData({
          drugName: primary.brand_name || primary.generic_name || 'Medication',
          dosage: primary.dosage || '1 tablet',
          frequency: primary.frequency || 'OD',
          times: primary.times || ['09:00'],
          condition: primary.condition || 'As prescribed',
          prescribingDoctor: primary.doctor || 'Dr. Prescriber',
          sourceOcrConfidence: 0.9,
          _allDrugs: data.extracted_drugs
        });
        setAnalysisResult(data);
      }
    } catch (err) {
      console.warn("OCR error:", err);
    } finally {
      setIsProcessing(false);
      setOcrProgressText('');
    }
  };

  const handleCommitTreatment = async () => {
    if (!scannedMedicine || !patientId) return;

    setSaving(true);
    try {
      await api.createSchedule({
        patient_id: patientId,
        drug_name: scannedMedicine.name,
        generic_name: scannedMedicine._qrData?.generic,
        dosage: scannedMedicine.dosage,
        frequency: scannedMedicine.frequency.replace(/ .*/, ''),
        meal_timing: scannedMedicine.meal_timing,
        criticality: scannedMedicine.criticality,
      });

      const res = await api.getMedicines();
      setMedicines(res.medicines || []);
      setAddedSuccess(true);
    } catch (err) {
      console.error('Failed to add medicine:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateQR = async (medicineId) => {
    try {
      const res = await api.generateQR(medicineId);
      setQrCodeData(res);
      setQrModalOpen(true);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };

  const handleCloseQRModal = () => {
    setQrModalOpen(false);
    setQrCodeData(null);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <PageHeader
        title="Scan Bottle"
        subtitle="Point camera at SAFE CAP⁺ QR code or capture a prescription label"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: '#0f172a',
          border: '3px solid var(--mg-card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}>
          
          {isCameraActive && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {qrScanMode && isCameraActive && (
            <div id="qr-reader" ref={qrContainerRef} style={{ 
              width: '100%', height: '100%',
              display: isCameraActive ? 'block' : 'none'
            }} />
          )}

          {!isCameraActive && capturedImage && (
            <img
              src={capturedImage}
              alt="Captured Prescription"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}

          {!isCameraActive && !capturedImage && !extractedData && !scannedMedicine && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
              color: '#94a3b8', textAlign: 'center', padding: '24px'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--mg-primary)', border: '2px dashed rgba(74, 222, 128, 0.5)'
              }}>
                <QrCode size={36} />
              </div>
              <div>
                <strong style={{ display: 'block', color: '#f8fafc', fontSize: '1.2rem' }}>
                  Scan Medicine Bottle
                </strong>
                <span style={{ fontSize: '0.9rem' }}>
                  Point camera at SAFE CAP⁺ QR code on the bottle
                </span>
              </div>
            </div>
          )}

          {isCameraActive && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              border: '3px dashed rgba(74, 222, 128, 0.7)',
              borderRadius: 'var(--radius-xl)', margin: '24px',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', padding: '16px'
            }}>
              <span style={{
                background: 'rgba(0, 0, 0, 0.8)', color: '#4ade80',
                fontSize: '0.8rem', padding: '4px 12px', borderRadius: '6px',
                alignSelf: 'flex-start', fontWeight: 700, letterSpacing: '0.5px'
              }}>
                ALIGN QR CODE / LABEL IN FRAME
              </span>
              <span style={{
                background: 'rgba(0, 0, 0, 0.7)', color: '#ffffff',
                fontSize: '0.8rem', padding: '4px 12px', borderRadius: '6px',
                alignSelf: 'center'
              }}>
                Hold steady • Good lighting helps
              </span>
            </div>
          )}

          {isProcessing && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 23, 42, 0.9)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px',
              color: '#ffffff', padding: '24px'
            }}>
              <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--mg-primary)' }} />
              <strong style={{ fontSize: '1.1rem' }}>Reading Prescription...</strong>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                {ocrProgressText || 'Please wait...'}
              </span>
            </div>
          )}

        </div>

        {cameraError && (
          <div style={{
            padding: '12px 16px', background: '#fee2e2', color: '#991b1b',
            borderRadius: 'var(--radius-md)', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <ShieldAlert size={20} />
            <span>{cameraError}</span>
          </div>
        )}

        {!extractedData && !scannedMedicine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => { setQrScanMode(true); startQRScanner(); }}
              disabled={isProcessing || saving}
              className="btn-primary"
              style={{ 
                width: '100%', padding: '18px 24px', fontSize: '1.2rem', fontWeight: 700, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
                minHeight: '60px', boxShadow: '0 4px 16px rgba(13, 56, 44, 0.3)'
              }}
            >
              <QrCode size={28} />
              <span>Scan Medicine Bottle QR Code</span>
            </button>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {!isCameraActive ? (
                <button
                  onClick={() => { setQrScanMode(false); startCamera(); }}
                  disabled={isProcessing || saving}
                  className="btn-secondary"
                  style={{ flex: 1, minWidth: '160px', padding: '14px 20px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <Camera size={20} />
                  <span>Open Prescription Camera</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCapturePhoto}
                    className="btn-secondary"
                    style={{ flex: 2, padding: '14px 20px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  >
                    <Camera size={20} />
                    <span>Snap Photo</span>
                  </button>
                  <button onClick={toggleCameraFacing} className="btn-ghost" style={{ padding: '14px', minWidth: '56px' }} title="Switch Camera">
                    <RefreshCw size={20} />
                  </button>
                  <button onClick={stopCamera} className="btn-ghost" style={{ padding: '14px 16px' }}>
                    <span>Cancel</span>
                  </button>
                </>
              )}
              <label className="btn-secondary" style={{ flex: 1, minWidth: '140px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Upload size={20} />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        )}

        {scannedMedicine && (
          <Section 
            title="Medication Found" 
            subtitle={addedSuccess ? "Added to your regimen" : "Review and add to your daily pills"}
          >
            <div className="mg-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <span className="meta-text" style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                    Detected Medication
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--mg-text-main)' }}>
                    {scannedMedicine.name}
                  </h3>
                </div>
                <StatusBadge type="success" label="Verified" />
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px', background: 'var(--mg-card-subtle)',
                padding: '16px', borderRadius: 'var(--radius-lg)'
              }}>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px' }}>Dosage</label>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
                    {scannedMedicine.dosage}
                  </div>
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px' }}>When</label>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
                    {scannedMedicine.times?.[0] || '09:00'}
                  </div>
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px' }}>Frequency</label>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--mg-text-body)' }}>
                    {scannedMedicine.frequency}
                  </div>
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px' }}>Criticality</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-muted)' }}>
                    {scannedMedicine.criticality}
                  </div>
                </div>
              </div>

              {addedSuccess && (
                <div style={{
                  padding: '16px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--mg-success-soft)',
                  border: '2px solid var(--mg-accent-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--mg-accent)', fontWeight: 600, fontSize: '1rem' }}>
                      <Check size={24} />
                      <span>Added successfully!</span>
                    </div>
                    <button
                      onClick={() => { onNavigateTab && onNavigateTab('home'); setAddedSuccess(false); setScannedMedicine(null); }}
                      className="btn-secondary"
                      style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                    >
                      Go to Today's Pills
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {!addedSuccess && (
                <button
                  onClick={handleCommitTreatment}
                  disabled={saving}
                  className="btn-primary"
                  style={{ 
                    padding: '16px 24px', fontSize: '1.1rem', fontWeight: 700,
                    justifyContent: 'center', minHeight: '56px',
                    boxShadow: '0 4px 20px rgba(13, 56, 44, 0.3)'
                  }}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Adding to regimen...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={22} />
                      <span>Add to My Daily Pills</span>
                    </>
                  )}
                </button>
              )}

            </div>
          </Section>
        )}

        {medicines.length > 0 && !scannedMedicine && !extractedData && (
          <Section title="Your Medicines" style={{ marginTop: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {medicines.map(med => (
                <div key={med.id} className="mg-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--mg-text-main)' }}>{med.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--mg-text-muted)' }}>{med.dosage} • {med.frequency}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--mg-text-muted)' }}>{med.times?.[0] || ''}</div>
                  <button
                    onClick={() => handleGenerateQR(med.id)}
                    className="btn-ghost"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', alignSelf: 'flex-start' }}
                  >
                    <QrCode size={16} />
                    <span>View QR Label</span>
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>

      {qrModalOpen && qrCodeData && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '40px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            maxWidth: '400px', width: '100%'
          }}>
            <img src={qrCodeData.qr_code} alt="QR Code" style={{ width: '200px', height: '200px' }} />
            <div style={{ fontWeight: 700, color: 'var(--mg-text-main)' }}>
              {qrCodeData.qr_data?.name || 'Medicine Label'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--mg-text-muted)' }}>
              {qrCodeData.qr_data?.dosage} • {qrCodeData.qr_data?.frequency}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleCloseQRModal} className="btn-secondary" style={{ flex: 1 }}>
                Close
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrCodeData.qr_code;
                  link.download = 'medicine-qr.png';
                  link.click();
                }}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                <ExternalLink size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
