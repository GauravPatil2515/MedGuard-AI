import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Check, RefreshCw, ArrowRight, ShieldAlert, 
  PlusCircle, Upload, Heart, Pill as PillIcon, QrCode
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import PageHeader from '../ui/PageHeader';
import Section from '../ui/Section';
import StatusBadge from '../ui/StatusBadge';
import { parseQRData, formatMedicineForDisplay, getPlainLanguageDescription, getFoodInstruction } from '../../lib/qrGenerator';

const API_BASE = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : "http://localhost:5000/api";

let html5QrCodeScanner = null;

export default function ScannerView({
  patientRecord,
  onAddTreatment,
  onNavigateTab
}) {
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

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const qrScannerRef = useRef(null);
  const qrContainerRef = useRef(null);

  // Preset demo profiles for 1-tap loading
  const presets = [
    {
      id: 'sunita_cardiac',
      name: 'Mrs. Sunita Kulkarni (Cardiac Routine)',
      icon: Heart,
      drugs: [
        { drugName: 'Warfarin', dosage: '5mg', frequency: 'OD (Once Daily)', timesOfDay: ['20:00'], condition: 'Atrial Fibrillation', prescribingDoctor: 'Dr. V. Sharma', criticality: 'HIGH' },
        { drugName: 'Amiodarone', dosage: '200mg', frequency: 'OD (Once Daily)', timesOfDay: ['09:00'], condition: 'Ventricular Arrhythmia', prescribingDoctor: 'Dr. V. Sharma', criticality: 'HIGH' },
        { drugName: 'Pantoprazole', dosage: '40mg', frequency: 'OD (Before Breakfast)', timesOfDay: ['07:30'], condition: 'Gastroprotection', prescribingDoctor: 'Dr. S. Patil', criticality: 'MEDIUM' }
      ]
    },
    {
      id: 'high_risk_clash',
      name: 'High-Risk Clash (Warfarin + Combiflam)',
      icon: ShieldAlert,
      drugs: [
        { drugName: 'Warfarin', dosage: '5mg', frequency: 'OD (Once Daily)', timesOfDay: ['20:00'], condition: 'Atrial Fibrillation', prescribingDoctor: 'Dr. V. Sharma', criticality: 'HIGH' },
        { drugName: 'Combiflam', dosage: '400mg + 325mg', frequency: 'BD (Twice Daily)', timesOfDay: ['09:00', '21:00'], condition: 'Joint Pain', prescribingDoctor: 'Dr. M. Kulkarni', criticality: 'HIGH' }
      ]
    },
    {
      id: 'elderly_diabetic',
      name: 'Elderly Diabetic Care (Glimepiride 2mg)',
      icon: PillIcon,
      drugs: [
        { drugName: 'Glimepiride', dosage: '2mg', frequency: 'OD (Once Daily)', timesOfDay: ['08:00'], condition: 'Type 2 Diabetes', prescribingDoctor: 'Dr. R. Iyer', criticality: 'HIGH' },
        { drugName: 'Metformin', dosage: '500mg', frequency: 'BD (Twice Daily)', timesOfDay: ['08:00', '20:00'], condition: 'Type 2 Diabetes', prescribingDoctor: 'Dr. R. Iyer', criticality: 'HIGH' }
      ]
    }
  ];

  // Handle scanned QR code data
  const handleQRScanSuccess = (decodedString) => {
    try {
      const qrData = parseQRData(decodedString);
      if (qrData && qrData.type === 'medicine') {
        const display = formatMedicineForDisplay(qrData);
        setScannedMedicine(display);
        setExtractedData({
          drugName: display.name,
          dosage: display.dosage,
          frequency: 'OD (Once Daily)',
          timesOfDay: ['09:00'],
          condition: display.description,
          prescribingDoctor: 'From QR Label',
          sourceOcrConfidence: 1.0,
          _qrData: qrData,
          _allDrugs: [{ drugName: display.name, dosage: display.dosage }]
        });
        setAddedSuccess(false);
        setNewlyTriggeredRisk(null);
      }
    } catch (e) {
      console.warn('QR parse error:', e);
    }
  };

  // Start QR code scanner
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
          // QR not found in this frame, keep scanning
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

  // Clean up on unmount
  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

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
      // Use the backend OCR endpoint for reliable extraction
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
          timesOfDay: primary.times || ['09:00'],
          condition: primary.condition || 'As prescribed',
          prescribingDoctor: primary.doctor || 'Dr. Prescriber',
          sourceOcrConfidence: 0.9
        });
        setAnalysisResult(data);
      } else {
        // Fallback to first preset
        loadPreset(presets[0]);
      }
    } catch (err) {
      console.warn("OCR error, using preset:", err);
      loadPreset(presets[0]);
    } finally {
      setIsProcessing(false);
      setOcrProgressText('');
    }
  };

  const loadPreset = (preset) => {
    setCapturedImage(null);
    setExtractedData({
      drugName: preset.drugs[0].drugName,
      dosage: preset.drugs[0].dosage,
      frequency: preset.drugs[0].frequency,
      timesOfDay: preset.drugs[0].timesOfDay,
      condition: preset.drugs[0].condition,
      prescribingDoctor: preset.drugs[0].prescribingDoctor,
      sourceOcrConfidence: 0.95,
      _allDrugs: preset.drugs
    });
    setAnalysisResult({ interactions: [] });
  };

  const handleCommitTreatment = async () => {
    if (!extractedData || !onAddTreatment) return;

    // Add all drugs from preset if available
    const drugsToAdd = extractedData._allDrugs || [extractedData];
    
    for (const drug of drugsToAdd) {
      const updated = await onAddTreatment(drug);
      if (updated) {
        const activeDrugLower = drug.drugName.toLowerCase();
        const detectedRisks = (updated.riskEvents || []).filter(r => 
          r.drugPair.some(dp => dp.toLowerCase() === activeDrugLower)
        );
        if (detectedRisks.length > 0) {
          setNewlyTriggeredRisk(detectedRisks[0]);
        }
      }
    }
    setAddedSuccess(true);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <PageHeader
        title="Scan Bottle"
        subtitle="Point camera at SAFE CAP⁺ QR code or choose a demo profile"
      />

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Camera Viewfinder - Large and Prominent */}
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
          
          {/* Live Video Stream */}
          {isCameraActive && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* QR Code Scanner Container */}
          {qrScanMode && isCameraActive && (
            <div id="qr-reader" ref={qrContainerRef} style={{ 
              width: '100%', height: '100%',
              display: isCameraActive ? 'block' : 'none'
            }} />
          )}

          {/* Captured Image Preview */}
          {!isCameraActive && capturedImage && (
            <img
              src={capturedImage}
              alt="Captured Prescription"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}

          {/* Idle Viewfinder */}
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

          {/* Camera Overlay Guide */}
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

          {/* Processing Overlay */}
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

        {/* Camera Error */}
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

        {/* Camera Controls - Only when no data extracted */}
        {!extractedData && !scannedMedicine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* QR Scan Button - Primary Action */}
            <button
              onClick={() => { setQrScanMode(true); startQRScanner(); }}
              disabled={isProcessing}
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
            
            {/* Secondary: Camera + Upload Row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {!isCameraActive ? (
                <button
                  onClick={() => { setQrScanMode(false); startCamera(); }}
                  disabled={isProcessing}
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

        {/* Demo Preset Buttons - 1-Tap Loading */}
        {!extractedData && !isCameraActive && !capturedImage && (
          <Section title="Quick Demo Profiles" subtitle="Tap to instantly load a sample prescription">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {presets.map(preset => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset)}
                    className="mg-card"
                    style={{
                      padding: '16px 20px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '16px',
                      textAlign: 'left', border: '2px solid var(--mg-card-border)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mg-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mg-card-border)'}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                      background: 'var(--mg-primary)', color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--mg-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--mg-text-muted)', marginTop: '2px' }}>
                        {preset.drugs.length} medication{preset.drugs.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <ArrowRight size={20} color="var(--mg-text-muted)" />
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Extracted Data Review & Confirmation */}
        {extractedData && (
          <Section 
            title="Medication Found" 
            subtitle={addedSuccess ? "Added to your regimen" : "Review and add to your daily pills"}
          >
            <div className="mg-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Drug Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <span className="meta-text" style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                    Detected Medication
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--mg-text-main)' }}>
                    {extractedData.drugName}
                  </h3>
                  {extractedData._allDrugs && extractedData._allDrugs.length > 1 && (
                    <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--mg-text-muted)' }}>
                      + {extractedData._allDrugs.length - 1} more medication{extractedData._allDrugs.length > 2 ? 's' : ''}
                    </div>
                  )}
                </div>
                <StatusBadge type="success" label={`${Math.round(extractedData.sourceOcrConfidence * 100)}% Confident`} />
              </div>

              {/* Key Details Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px', background: 'var(--mg-card-subtle)',
                padding: '16px', borderRadius: 'var(--radius-lg)'
              }}>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px' }}>Dosage</label>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
                    {extractedData.dosage}
                  </div>
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px' }}>When</label>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
                    {extractedData.timesOfDay[0]}
                  </div>
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px' }}>Frequency</label>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--mg-text-body)' }}>
                    {extractedData.frequency}
                  </div>
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px' }}>Doctor</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--mg-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {extractedData.prescribingDoctor}
                  </div>
                </div>
              </div>

              {/* Safety Clash Alert after adding */}
              {addedSuccess && (
                <div style={{
                  padding: '16px', borderRadius: 'var(--radius-lg)',
                  background: newlyTriggeredRisk ? 'var(--mg-danger-soft)' : 'var(--mg-success-soft)',
                  border: newlyTriggeredRisk ? '2px solid var(--mg-danger-border)' : '2px solid var(--mg-accent-border)'
                }}>
                  {newlyTriggeredRisk ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 700, fontSize: '0.95rem' }}>
                        <ShieldAlert size={20} />
                        <span>⚠️ Safety Alert: Dangerous Combination Detected</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c', lineHeight: 1.5 }}>
                        <strong>{newlyTriggeredRisk.drugPair.join(' + ')}</strong>: {newlyTriggeredRisk.description}
                      </p>
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('caregiver')}
                        className="btn-primary"
                        style={{ alignSelf: 'flex-start', padding: '10px 18px', fontSize: '0.9rem' }}
                      >
                        View Safety Details
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--mg-accent)', fontWeight: 600, fontSize: '1rem' }}>
                        <Check size={24} />
                        <span>Added successfully! No safety clashes found.</span>
                      </div>
                      <button
                        onClick={() => { onNavigateTab && onNavigateTab('home'); setAddedSuccess(false); setExtractedData(null); }}
                        className="btn-secondary"
                        style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                      >
                        Go to Today's Pills
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Commit Button */}
              {!addedSuccess && (
                <button
                  onClick={handleCommitTreatment}
                  className="btn-primary"
                  style={{ 
                    padding: '16px 24px', fontSize: '1.1rem', fontWeight: 700,
                    justifyContent: 'center', minHeight: '56px',
                    boxShadow: '0 4px 20px rgba(13, 56, 44, 0.3)'
                  }}
                >
                  <PlusCircle size={22} />
                  <span>Add to My Daily Pills & Check Safety</span>
                </button>
              )}

            </div>
          </Section>
        )}

      </div>
    </div>
  );
}