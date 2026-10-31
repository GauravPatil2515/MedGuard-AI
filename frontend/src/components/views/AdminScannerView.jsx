import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, RefreshCw, Download, Save, Share2, QrCode, Package, 
  Plus, Search, Edit3, BarChart3, Users, ShieldAlert
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Section from '../ui/Section';
import StatusBadge from '../ui/StatusBadge';
import { saveMedicine, getAllMedicines, searchMedicines, seedDemoMedicines, getQRCodesByMedicine, saveQRCode } from '../../lib/medicineDatabase';
import { createMedicineQRData, generateQRCodeDataURL, generatePrintableQRSheet, parseQRData, formatMedicineForDisplay } from '../../lib/qrGenerator';
import { runFullPipeline } from '../../lib/riskPipeline';

const API_BASE = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : "http://localhost:5000/api";

export default function AdminScannerView({ 
  onNavigateTab,
  selectedLang = 'mr',
  onAddTreatment 
}) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Medicine database state
  const [medicineDB, setMedicineDB] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  // Form state for editing medicine
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    generic: '',
    brand: '',
    dosage: '',
    form: 'Tablet',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    description: '',
    warnings: '',
    storage: '',
    sideEffects: '',
    interactions: []
  });

  // QR code state
  const [generatedQR, setGeneratedQR] = useState(null);
  const [qrPrintMode, setQrPrintMode] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize database on mount
  useEffect(() => {
    loadDatabase();
    return () => stopCamera();
  }, []);

  const loadDatabase = async () => {
    try {
      const res = await fetch(`${API_BASE}/medicines`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.medicines) && data.medicines.length > 0) {
          setMedicineDB(data.medicines);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend medicine fetch fallback to IndexedDB:", e);
    }
    const meds = await getAllMedicines();
    if (!meds || meds.length === 0) {
      await seedDemoMedicines();
    }
    const finalMeds = await getAllMedicines();
    setMedicineDB(finalMeds);
  };


  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await searchMedicines(query);
      setMedicineDB(results);
    } else if (query.length === 0) {
      const meds = await getAllMedicines();
      setMedicineDB(meds);
    }
  };

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setMedicineForm({
      name: med.name || '',
      generic: med.generic || '',
      brand: med.brand || '',
      dosage: med.dosage || '',
      form: med.form || 'Tablet',
      manufacturer: med.manufacturer || '',
      batchNumber: med.batchNumber || '',
      expiryDate: med.expiryDate || '',
      description: med.description || '',
      warnings: med.warnings || '',
      storage: med.storage || '',
      sideEffects: med.sideEffects || '',
      interactions: med.interactions || []
    });
    setGeneratedQR(null);
    setSavedSuccessfully(false);
  };

  const handleFormChange = (field, value) => {
    setMedicineForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveMedicine = async () => {
    const saved = await saveMedicine(medicineForm);
    setSavedSuccessfully(true);
    setTimeout(() => setSavedSuccessfully(false), 3000);
    loadDatabase();
  };

  const handleGenerateQR = async () => {
    if (!medicineForm.name) return;
    
    setProcessingStep('Generating QR code...');
    setIsProcessing(true);
    
    try {
      const qrData = createMedicineQRData({
        ...medicineForm,
        id: selectedMedicine?.id || `med_${Date.now()}`
      });
      
      const dataURL = await generateQRCodeDataURL(qrData, { width: 300 });
      setGeneratedQR({ qrData, dataURL });
      
      // Save to database
      await saveQRCode({
        medicineId: medicineForm.id || selectedMedicine?.id || `med_${Date.now()}`,
        medicineName: medicineForm.name,
        qrData: JSON.stringify(qrData),
        qrImage: dataURL,
        dosage: medicineForm.dosage,
        batchNumber: medicineForm.batchNumber
      });
    } catch (err) {
      console.error('QR generation failed:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleDownloadQR = () => {
    if (!generatedQR) return;
    
    const link = document.createElement('a');
    link.download = `${medicineForm.name.replace(/\s+/g, '_')}_QR_code.png`;
    link.href = generatedQR.dataURL;
    link.click();
  };

  const handlePrintQR = () => {
    if (!generatedQR) return;
    
    const printWindow = window.open('', '_blank');
    const medName = medicineForm.name;
    const dosage = medicineForm.dosage;
    const batchNum = medicineForm.batchNumber;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { margin: 20mm; }
          body { font-family: Arial, sans-serif; text-align: center; }
          .qr-label { margin: 40px 0; page-break-after: always; }
          .qr-label:last-child { page-break-after: avoid; }
          img { width: 200px; height: 200px; margin: 20px 0; }
          h3 { margin: 10px 0; font-size: 24px; }
          p { margin: 5px 0; color: #555; font-size: 16px; }
          .footer { margin-top: 30px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="qr-label">
          <h3>SAFE CAP⁺ Medicine Label</h3>
          <p><strong>${medName} ${dosage}</strong></p>
          <p>Batch: ${batchNum || 'N/A'}</p>
          <img src="${generatedQR.dataURL}" alt="QR Code for ${medName}" />
          <p>Scan to verify medicine details</p>
          <div class="footer">Powered by SAFE CAP⁺ • Child-resistant packaging</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleScanPrescription = async () => {
    stopCamera();
    setCapturedImage(null);
    setProcessingStep('Analyzing prescription...');
    setIsProcessing(true);

    try {
      // Use first medicine from DB as template since we can't do OCR in this demo
      const med = medicineDB[0];
      setMedicineForm({
        name: med.name,
        generic: med.generic,
        brand: med.brand,
        dosage: med.dosage,
        form: med.form,
        manufacturer: med.manufacturer,
        batchNumber: med.batchNumber,
        expiryDate: med.expiryDate,
        description: med.description,
        warnings: med.warnings,
        storage: med.storage,
        sideEffects: med.sideEffects,
        interactions: med.interactions
      });
      setSelectedMedicine(med);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
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
      setCameraError("Camera unavailable. Use preset medicines below.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const handleCapture = async () => {
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
    
    // Process image - in real app would do OCR
    await handleScanPrescription();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <PageHeader
        title="Admin Scanner"
        subtitle="Scan medicine, verify details, generate QR code for printing"
        action={
          <button 
            onClick={() => onNavigateTab && onNavigateTab('home')}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Package size={16} />
            <span>Back to Patient View</span>
          </button>
        }
      />

      {/* Processing Overlay */}
      {isProcessing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '16px',
          color: '#ffffff'
        }}>
          <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--mg-primary)' }} />
          <strong style={{ fontSize: '1.2rem' }}>Processing...</strong>
          <span style={{ fontSize: '1rem', color: '#94a3b8' }}>{processingStep}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Camera Scanner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Camera Viewfinder */}
          <div style={{
            position: 'relative',
            width: '100%', height: '360px',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden', background: '#0f172a',
            border: '3px solid var(--mg-card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            {isCameraActive && (
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            {!isCameraActive && capturedImage && (
              <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            )}
            {!isCameraActive && !capturedImage && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8', textAlign: 'center' }}>
                <Camera size={48} />
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '1rem' }}>Ready to Scan</strong>
                  <span style={{ fontSize: '0.85rem' }}>Point camera at medicine bottle or label</span>
                </div>
              </div>
            )}
            
            {isCameraActive && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                border: '3px dashed rgba(74, 222, 128, 0.7)', borderRadius: 'var(--radius-xl)', margin: '20px'
              }} />
            )}
          </div>

          {/* Camera Controls */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {!isCameraActive ? (
              <button onClick={() => startCamera()} className="btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Camera size={20} />
                <span>Open Camera</span>
              </button>
            ) : (
              <>
                <button onClick={handleCapture} className="btn-primary" style={{ flex: 2, padding: '14px', background: '#dc2626', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Camera size={20} />
                  <span>Scan Medicine</span>
                </button>
                <button onClick={toggleCamera} className="btn-secondary" style={{ padding: '14px', minWidth: '56px' }}>
                  <RefreshCw size={20} />
                </button>
                <button onClick={stopCamera} className="btn-ghost" style={{ padding: '14px 16px' }}>
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>

          {/* Search Medicine DB */}
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--mg-text-muted)' }} />
            <input
              type="text"
              placeholder="Search medicine database..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 44px',
                borderRadius: 'var(--radius-full)', border: '2px solid var(--mg-card-border)',
                fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--mg-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--mg-card-border)'}
            />
          </div>

          {/* Medicine DB List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {medicineDB.length > 0 ? (
              medicineDB.map(med => (
                <div
                  key={med.id || Math.random()}
                  onClick={() => handleSelectMedicine(med)}
                  className="mg-card"
                  style={{
                    padding: '14px 16px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    border: selectedMedicine?.id === med.id ? '2px solid var(--mg-primary)' : '1px solid var(--mg-card-border)',
                    background: selectedMedicine?.id === med.id ? 'var(--mg-primary)' : 'var(--mg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem', color: selectedMedicine?.id === med.id ? '#ffffff' : 'var(--mg-text-main)' }}>
                      {med.name} {med.dosage}
                    </strong>
                    <StatusBadge 
                      type={med.warnings ? 'warning' : 'success'} 
                      label={med.warnings ? '⚠️ Check' : '✓ Safe'} 
                      style={{ fontSize: '0.65rem', color: selectedMedicine?.id === med.id ? '#fff3cd' : undefined }}
                    />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: selectedMedicine?.id === med.id ? '#e2e8f0' : 'var(--mg-text-muted)' }}>
                    {med.generic} • {med.brand} • Batch: {med.batchNumber}
                  </span>
                </div>
              ))
            ) : (
              <div className="mg-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--mg-text-muted)' }}>
                <Package size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>No medicines found. Scan one to add.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Medicine Form & QR Generation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Medicine Info Editing Section */}
          <Section 
            title="Medicine Details" 
            subtitle={selectedMedicine ? "Editing existing medicine" : "New medicine information"}
            action={
              <button 
                onClick={handleSaveMedicine}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                disabled={!medicineForm.name}
              >
                {savedSuccessfully ? <Check size={16} /> : <Save size={16} />}
                <span>{savedSuccessfully ? 'Saved!' : 'Save Medicine'}</span>
              </button>
            }
          >
            <div className="mg-card" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Medicine Name *</label>
                  <input type="text" value={medicineForm.name} onChange={(e) => handleFormChange('name', e.target.value)}
                    className="input-field" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Generic Name</label>
                  <input type="text" value={medicineForm.generic} onChange={(e) => handleFormChange('generic', e.target.value)}
                    className="input-field" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Brand</label>
                  <input type="text" value={medicineForm.brand} onChange={(e) => handleFormChange('brand', e.target.value)}
                    className="input-field" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Dosage</label>
                  <input type="text" value={medicineForm.dosage} onChange={(e) => handleFormChange('dosage', e.target.value)}
                    className="input-field" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Batch Number</label>
                  <input type="text" value={medicineForm.batchNumber} onChange={(e) => handleFormChange('batchNumber', e.target.value)}
                    className="input-field" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Expiry Date</label>
                  <input type="date" value={medicineForm.expiryDate} onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                    className="input-field" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.95rem' }} />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Description</label>
                <textarea value={medicineForm.description} onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="What this medicine is used for..." rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.9rem', resize: 'vertical' }} />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Safety Warnings</label>
                <textarea value={medicineForm.warnings} onChange={(e) => handleFormChange('warnings', e.target.value)}
                  placeholder="Any important safety warnings or interactions..." rows={2}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.9rem', resize: 'vertical' }} />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label className="meta-text" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Storage Instructions</label>
                <input type="text" value={medicineForm.storage} onChange={(e) => handleFormChange('storage', e.target.value)}
                  placeholder="e.g. Store below 25°C in a dry place" 
                  className="input-field" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--mg-card-border)', fontSize: '0.95rem' }} />
              </div>
            </div>
          </Section>

          {/* QR Code Generation Section */}
          <Section title="QR Code Generation" subtitle="Generate printable QR code for this medicine bottle">
            <div className="mg-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
              {!generatedQR ? (
                <div style={{ 
                  width: '120px', height: '120px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--mg-card-subtle)', border: '2px dashed var(--mg-card-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--mg-text-dim)'
                }}>
                  <QrCode size={48} />
                </div>
              ) : (
                <img src={generatedQR.dataURL} alt="Generated QR Code" style={{ 
                  width: '180px', height: '180px', border: '1px solid var(--mg-card-border)', borderRadius: 'var(--radius-md)' 
                }} />
              )}
              
              <div style={{ fontSize: '0.85rem', color: 'var(--mg-text-muted)' }}>
                {medicineForm.name ? `QR for: ${medicineForm.name} ${medicineForm.dosage}` : 'Select or fill a medicine to generate QR'}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={handleGenerateQR}
                  disabled={!medicineForm.name || isProcessing}
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '0.95rem', minWidth: '140px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <QrCode size={18} />
                  <span>Generate QR</span>
                </button>
                
                {generatedQR && (
                  <>
                    <button
                      onClick={handleDownloadQR}
                      className="btn-secondary"
                      style={{ padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Download size={18} />
                      <span>Download PNG</span>
                    </button>
                    
                    <button
                      onClick={handlePrintQR}
                      className="btn-secondary"
                      style={{ padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Share2 size={18} />
                      <span>Print Label</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </Section>

          {/* Quick Add New Medicine Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setSelectedMedicine(null);
                setMedicineForm({
                  name: '', generic: '', brand: '', dosage: '', form: 'Tablet',
                  manufacturer: '', batchNumber: '', expiryDate: '',
                  description: '', warnings: '', storage: '', sideEffects: '', interactions: []
                });
                setGeneratedQR(null);
                setSavedSuccessfully(false);
              }}
              className="btn-ghost"
              style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} />
              <span>New Medicine</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}