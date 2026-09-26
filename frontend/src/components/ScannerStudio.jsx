import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, FileText, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Sparkles, RefreshCw, Layers, PlusCircle
} from 'lucide-react';

export default function ScannerStudio({ 
  onScanComplete, 
  onNavigateToSafety, 
  onAddToSchedule,
  currentPrescription,
  onLoadPreset
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [rawText, setRawText] = useState('');
  const [extractedResult, setExtractedResult] = useState(null);
  const [activePresetId, setActivePresetId] = useState('mrs_kulkarni_cardiac');
  const fileInputRef = useRef(null);

  const presets = [
    {
      id: 'mrs_kulkarni_cardiac',
      name: 'Mrs. Sunita Kulkarni (Cardiac)',
      diagnosis: 'Post-MI, Atrial Fibrillation, Type-2 Diabetes',
      drugs: ['Warfarin 5mg', 'Metformin 500mg', 'Atorvastatin 40mg', 'Aspirin 75mg']
    },
    {
      id: 'clash_regimen_bleeding',
      name: 'Critical Drug Clash (Bleeding Hazard)',
      diagnosis: 'Severe Knee Osteoarthritis + Atrial Fibrillation',
      drugs: ['Warfarin 5mg', 'Combiflam (Ibuprofen + Paracetamol)', 'Amiodarone 200mg']
    },
    {
      id: 'diabetic_hypertension',
      name: 'Elderly Diabetic Nephropathy',
      diagnosis: 'Type-2 Diabetes with Hypertension & Microalbuminuria',
      drugs: ['Telmisartan 40mg', 'Metformin 1000mg', 'Glimepiride 2mg', 'Pantoprazole 40mg']
    }
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    setIsScanning(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/rx/ocr', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setExtractedResult(data);
      if (onScanComplete) onScanComplete(data);
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleParseText = async () => {
    if (!rawText.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/rx/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText })
      });
      const data = await res.json();
      setExtractedResult(data);
      if (onScanComplete) onScanComplete(data);
    } catch (err) {
      console.error('Text OCR error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPreset = async (preset) => {
    setActivePresetId(preset.id);
    setImagePreview(null);
    setIsScanning(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/rx/preset/${preset.id}`);
      if (res.ok) {
        const data = await res.json();
        const formatted = {
          raw_text: preset.drugs.join('\n'),
          extracted_drugs: data.prescription.medications.map(m => ({
            raw_line: `${m.raw_name} ${m.dose} ${m.frequency}`,
            identified_name: m.raw_name,
            generic: m.generic,
            dosage: m.dose,
            frequency: m.frequency,
            smiles: m.smiles || ''
          })),
          count: data.prescription.medications.length,
          ocr_engine: 'Clinical Registry Standard'
        };
        setExtractedResult(formatted);
        if (onLoadPreset) onLoadPreset(preset.id, data);
      }
    } catch (err) {
      console.error('Preset error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Studio Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(8, 12, 20, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
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
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            padding: '14px',
            borderRadius: '16px',
            display: 'flex',
            boxShadow: '0 4px 20px rgba(56, 189, 248, 0.3)'
          }}>
            <Camera size={26} color="#080c14" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
              Prescription OCR & Molecular Extraction Studio
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Multimodal Vision AI + Pharmacological Entity Disambiguation + Canonical SMILES Mapping
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            color: '#38bdf8',
            fontWeight: 600
          }}>
            <Sparkles size={14} />
            Gemini Multimodal Vision
          </span>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '24px' }}>
        
        {/* Left Column: Image Dropzone & Input Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Prescription Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(15, 21, 35, 0.7)',
              border: '2px dashed rgba(56, 189, 248, 0.35)',
              borderRadius: '18px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />

            {/* Laser scanning beam overlay when scanning */}
            {isScanning && <div className="scanner-beam" />}

            {imagePreview ? (
              <div style={{ position: 'relative', width: '100%', maxHeight: '200px', overflow: 'hidden', borderRadius: '10px' }}>
                <img 
                  src={imagePreview} 
                  alt="Prescription Preview" 
                  style={{ width: '100%', objectFit: 'contain', maxHeight: '200px', filter: isScanning ? 'brightness(0.7)' : 'none' }} 
                />
                {isScanning && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(8, 12, 20, 0.6)', color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem'
                  }}>
                    <RefreshCw size={20} className="animate-spin" style={{ marginRight: '8px' }} />
                    Multimodal Vision Analyzing...
                  </div>
                )}
              </div>
            ) : (
              <>
                <div style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '16px',
                  borderRadius: '50%',
                  color: '#38bdf8',
                  marginBottom: '14px'
                }}>
                  <Upload size={28} />
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Click to Upload Prescription Photo or Drop Image
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                  Supports handwritten doctor scripts, pharmacy labels, & medicine packages (JPEG/PNG)
                </div>
              </>
            )}
          </div>

          {/* Quick Preset Selector */}
          <div style={{
            background: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '18px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Quick Clinical Presets for Demo
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {presets.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                      {preset.diagnosis}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Prescription Text Box Fallback */}
          <div style={{
            background: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '18px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              Or Paste Handwritten Transcription:
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Rx&#10;Tab Warfarin 5mg OD&#10;Tab Metformin 500mg BD&#10;Tab Combiflam SOS"
              style={{
                width: '100%',
                background: '#080c14',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleParseText}
              disabled={isScanning}
              style={{
                width: '100%',
                marginTop: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FileText size={15} />
              Parse Typed Text
            </button>
          </div>

        </div>

        {/* Right Column: Extracted Entities & Action Deck */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            background: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '24px'
          }}>
            {/* Header of results */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                    Extracted Prescription Medications
                  </h3>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    {extractedResult?.extracted_drugs?.length || 0} Drugs Recognized
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                  Engine: {extractedResult?.ocr_engine || 'Awaiting input / preset'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onNavigateToSafety && onNavigateToSafety(extractedResult?.extracted_drugs)}
                  style={{
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)'
                  }}
                >
                  <ShieldCheck size={16} />
                  Run Molecular Safety Screening
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Drugs Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {extractedResult?.extracted_drugs?.map((drug, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(8, 12, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                        {drug.identified_name}
                      </span>
                      <span style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {drug.dosage}
                      </span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#94a3b8',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem'
                      }}>
                        {drug.frequency}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
                      Generic Active Molecule: <strong style={{ color: '#cbd5e1' }}>{drug.generic}</strong>
                    </div>

                    {drug.smiles && (
                      <div style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'monospace', marginTop: '4px' }}>
                        Canonical SMILES: {drug.smiles.substring(0, 36)}...
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#10b981',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      <CheckCircle2 size={14} /> Verified Entity
                    </span>
                  </div>
                </div>
              ))}

              {(!extractedResult || extractedResult?.extracted_drugs?.length === 0) && (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  border: '1px dashed rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px'
                }}>
                  No prescription scanned yet. Upload an image or select a preset on the left to extract medication entities.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
