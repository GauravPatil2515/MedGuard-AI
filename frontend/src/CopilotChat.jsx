import React, { useState } from 'react';
import { Bot, Send, Sparkles, AlertTriangle, ShieldCheck, Camera, FileText, CheckCircle2 } from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

export default function CopilotChat({ currentRegimen = [] }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "👋 Hello! I am MedGuard AI Copilot. Ask me about medicine interactions, safety for new drugs, or paste an Rx prescription below."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rxText, setRxText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/rx/ocr`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.extracted_drugs && data.extracted_drugs.length > 0) {
        const drugListStr = data.extracted_drugs.map(d => `${d.identified_name} (${d.dosage}, ${d.frequency})`).join(", ");
        const engine = data.ocr_engine || "Vision AI";
        sendMessage(`[${engine}] Scanned Prescription: Found [${drugListStr}]. Please analyze safety against my regimen.`);
      } else {
        alert("No medications recognized from image. Please try pasting the text directly.");
      }
    } catch (err) {
      alert("Failed to upload and parse prescription image.");
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          current_regimen: currentRegimen.map(m => m.generic || m.name || m)
        })
      });
      const data = await res.json();
      
      setMessages([...newMsgs, {
        sender: 'assistant',
        text: data.assistant_reply || "Analysis complete.",
        safety_status: data.safety_status,
        interactions: data.interactions,
        molecular_warnings: data.molecular_warnings
      }]);
    } catch (err) {
      setMessages([...newMsgs, {
        sender: 'assistant',
        text: "⚠️ Connection error to MedGuard Copilot backend.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleScanRx = async () => {
    if (!rxText.trim()) return;
    setOcrLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rx/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rxText })
      });
      const data = await res.json();
      if (data.extracted_drugs && data.extracted_drugs.length > 0) {
        const drugListStr = data.extracted_drugs.map(d => `${d.identified_name} (${d.dosage}, ${d.frequency})`).join(", ");
        sendMessage(`Scanned Prescription: Found [${drugListStr}]. Is this safe with my current medications?`);
        setRxText('');
      } else {
        alert("No recognized medicines found in text.");
      }
    } catch (err) {
      alert("Error scanning prescription text");
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', minHeight: '620px' }}>
      
      {/* Main Chat Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', padding: '8px', borderRadius: '10px' }}>
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>MedGuard Copilot</h3>
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Neuro-Symbolic Reasoner Active
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
            Regimen Context: {currentRegimen.length} active meds
          </span>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.sender === 'user' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: m.sender === 'user' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#f8fafc',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: '#06b6d4', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} /> MedGuard Copilot reasoning across molecular models...
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="E.g., 'Can I take Combiflam for knee pain?' or 'Check Azithromycin safety'"
            style={{
              flex: 1,
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#f8fafc',
              fontSize: '0.9rem'
            }}
          />
          <button 
            onClick={() => sendMessage()}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600'
            }}
          >
            <Send size={16} /> Send
          </button>
        </div>
      </div>

      {/* OCR / Prescription Ingestion Sidebar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: '620px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={18} color="#8b5cf6" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>Prescription OCR Scraping</h4>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
          Paste transcribed doctor notes or prescription OCR text to extract drug entities and screen clashes automatically:
        </p>

        <textarea 
          rows={7}
          value={rxText}
          onChange={(e) => setRxText(e.target.value)}
          placeholder={`Rx\nTab Azithral 500mg OD x 3 days\nTab Combiflam SOS for pain\nTab Pantocid 40mg OD`}
          style={{
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '10px',
            color: '#f8fafc',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            resize: 'none'
          }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrLoading}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#38bdf8',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Camera size={15} /> Upload Photo
          </button>

          <button 
            onClick={handleScanRx}
            disabled={ocrLoading}
            style={{
              flex: 1.3,
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FileText size={15} /> {ocrLoading ? "Scanning..." : "Parse Text"}
          </button>
        </div>

        <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#06b6d4', marginBottom: '6px' }}>⚡ Try Quick Prompts:</div>
          <button 
            onClick={() => sendMessage("Can I take Combiflam for pain while taking Warfarin?")}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 0', cursor: 'pointer' }}
          >
            • Combiflam + Warfarin Bleed Test
          </button>
          <button 
            onClick={() => sendMessage("Is Azithral 500 safe with Amiodarone?")}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 0', cursor: 'pointer' }}
          >
            • Azithromycin + Amiodarone Cardiac Test
          </button>
        </div>
      </div>

    </div>
  );
}
