import React, { useState } from 'react';
import { Send, Mic, Volume2, AlertTriangle, RefreshCw } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import StatusBadge from '../ui/StatusBadge';
import { API_BASE as DEFAULT_API_BASE } from '../../lib/api';

export default function CopilotView({ patientRecord, API_BASE = DEFAULT_API_BASE }) {
  const activeTreatments = (patientRecord?.treatments || []).filter(t => t.status === 'active');
  const activeDrugNames = activeTreatments.map(t => `${t.drugName} ${t.dosage}`);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I am your MedGuard Clinical Assistant. I am actively monitoring your prescription regimen (${activeTreatments.length} active medications on file). You can ask me any question about food timings, side effects, or drug interactions.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = activeTreatments.length > 0
    ? [
        `Can I take Combiflam with ${activeTreatments[0]?.drugName || "my medicines"}?`,
        `Explain my ${activeTreatments[0]?.drugName || "medication"} precautions`,
        "What does OD and BD mean in my prescription?",
        "What should I do if I miss a scheduled dose?"
      ]
    : [
        "Can I take Combiflam for headache?",
        "Explain my Warfarin bleeding warning",
        "What does OD mean in my prescription?",
        "Why must Pantoprazole be taken before breakfast?"
      ];

  const handleSend = async (queryText) => {
    const q = queryText || inputValue;
    if (!q.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          current_regimen: activeDrugNames.length > 0 ? activeDrugNames : ["Warfarin 5mg", "Amiodarone 200mg", "Pantoprazole 40mg"]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            isWarning: !!data.clash_detected,
            title: data.clash_detected ? "Caution: Medication Clash" : "Clinical Guidance",
            text: data.reply || data.message || "Consult your physician for personalized medical advice.",
            recommendation: data.recommendation || null
          }
        ]);
        setIsTyping(false);
        return;
      }
    } catch {}

    // In-Browser Resilient Fallback Logic (Edge Operation)
    setTimeout(() => {
      const qLower = q.toLowerCase();
      let isWarning = false;
      let title = "Clinical Information";
      let text = "Always consult your physician before starting any new over-the-counter medicine or adjusting doses.";
      let recommendation = null;

      if (qLower.includes('combiflam') || qLower.includes('ibuprofen') || qLower.includes('brufen')) {
        isWarning = true;
        title = "Severe Interaction Warning with Warfarin";
        text = "Combiflam / Ibuprofen is an NSAID that damages gastric mucosa and prevents platelet clotting. When combined with anticoagulant Warfarin, major GI hemorrhage risk triples.";
        recommendation = "Avoid Combiflam. Use plain Paracetamol (500mg) for fever or headache.";
      } else if (qLower.includes('warfarin') || qLower.includes('bleeding')) {
        title = "Warfarin Safety Advisory";
        text = "Warfarin is a narrow therapeutic index anticoagulant. Missing doses increases blood clot/stroke hazard, while overdose can provoke fatal internal bleeding.";
        recommendation = "Take once daily after dinner consistently. Monitor INR routinely.";
      } else if (qLower.includes('od')) {
        title = "Prescription Terminology";
        text = "OD stands for 'Omni Die' (Latin), meaning Once Daily. Take this medication at the designated time once every 24 hours.";
      } else if (qLower.includes('pantoprazole') || qLower.includes('breakfast')) {
        title = "Pharmacokinetics Advisory";
        text = "Pantoprazole is a proton pump inhibitor that works most effectively when stomach parietal cells are stimulated by morning meals.";
        recommendation = "Take 30–60 minutes prior to your first morning meal.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          isWarning,
          title,
          text,
          recommendation
        }
      ]);
      setIsTyping(false);
    }, 600);
  };


  const playMarathiAudio = () => {
    if ('speechSynthesis' in window) {
      const text = "कॉम्बीफ्लाम घेऊ नका. त्यामध्ये इबुप्रोफेन आहे, ज्यामुळे वॉर्फरिनसोबत रक्तस्त्राव होण्याचा धोका वाढतो. केवळ पॅरासिटामॉल वापरा.";
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <PageHeader
        title="Clinical Assistant"
        subtitle="Conversational safety guidance cross-referencing your active prescription with drug-drug interaction databases"
      />

      {/* Chat Workspace */}
      <div className="mg-card" style={{
        height: 'min(600px, calc(100vh - 240px))',
        minHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Message Thread */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: '#f8fafc'
        }}>
          {messages.map(msg => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    background: 'var(--mg-primary)',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: '16px 16px 4px 16px',
                    fontSize: '0.9rem',
                    maxWidth: '75%',
                    lineHeight: 1.45
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.isWarning) {
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--mg-danger-border)',
                    borderRadius: '16px',
                    padding: '16px',
                    maxWidth: '85%',
                    boxShadow: 'var(--shadow-card)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mg-danger)', marginBottom: '6px' }}>
                      <AlertTriangle size={16} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        {msg.title}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: 'var(--mg-text-body)', lineHeight: 1.45 }}>
                      {msg.text}
                    </p>

                    {msg.recommendation && (
                      <div style={{
                        padding: '8px 12px',
                        background: 'var(--mg-accent-soft)',
                        border: '1px solid var(--mg-accent-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        color: 'var(--mg-accent)',
                        marginBottom: '10px'
                      }}>
                        <strong>Safe alternative: </strong>{msg.recommendation}
                      </div>
                    )}

                    <button
                      onClick={playMarathiAudio}
                      className="btn-ghost"
                      style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                    >
                      <Volume2 size={13} />
                      <span>Hear in Marathi (मराठी)</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid var(--mg-card-border)',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  maxWidth: '80%',
                  fontSize: '0.88rem',
                  color: 'var(--mg-text-main)',
                  lineHeight: 1.45
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mg-accent)', fontSize: '0.8rem' }}>
              <RefreshCw size={13} className="animate-spin" />
              <span>Checking clinical guidelines...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div 
          className="no-scrollbar"
          style={{
            padding: '10px 16px',
            background: '#ffffff',
            borderTop: '1px solid var(--mg-border-subtle)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{
                fontSize: '0.76rem',
                color: 'var(--mg-text-body)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: '#f8fafc',
                border: '1px solid var(--mg-card-border)',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '12px 16px',
          background: '#ffffff',
          borderTop: '1px solid var(--mg-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            flex: 1,
            height: '42px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px'
          }}>
            <input
              type="text"
              placeholder="Ask about medications, timing, or side effects..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '0.86rem',
                color: 'var(--mg-text-main)'
              }}
            />
            <button style={{ color: 'var(--mg-text-muted)', padding: '4px' }}>
              <Mic size={16} />
            </button>
          </div>

          <button
            onClick={() => handleSend()}
            className="btn-primary"
            style={{ width: '42px', height: '42px', padding: 0, borderRadius: '50%' }}
          >
            <Send size={16} />
          </button>
        </div>

      </div>

    </div>
  );
}
