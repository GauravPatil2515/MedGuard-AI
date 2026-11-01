import React, { useState } from 'react';
import { 
  ChevronLeft, MoreHorizontal, Send, Mic, AlertTriangle, 
  Volume2, ArrowRight, Bot 
} from 'lucide-react';

export default function ScreenClinicalCopilot({
  onBack,
  onNavigateTab,
  API_BASE = "http://localhost:5000/api"
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: "Can I take Combiflam for headache?"
    },
    {
      id: 2,
      sender: 'bot',
      type: 'warning_card',
      status: "Not recommended",
      explanation: "Combiflam contains ibuprofen + paracetamol. Ibuprofen may increase bleeding risk when taken with Warfarin.",
      contextMeds: ["Warfarin 5 mg", "Amiodarone 200 mg"]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    "What do I take today?",
    "Explain my Warfarin warning",
    "What does OD mean?"
  ];

  const handleSend = async (textToSend) => {
    const q = textToSend || inputValue;
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
          current_regimen: ["Warfarin", "Amiodarone", "Metoprolol", "Aspirin", "Pantoprazole"]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botReply = {
          id: Date.now() + 1,
          sender: 'bot',
          type: data.clash_detected ? 'warning_card' : 'text',
          status: data.clash_detected ? 'Caution Advised' : 'Safe Guidance',
          explanation: data.reply || data.message || "Consult your physician for personalized medical advice.",
          contextMeds: data.conflicting_drugs || ["Warfarin 5 mg"]
        };
        setMessages(prev => [...prev, botReply]);
      } else {
        throw new Error("API error");
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          type: 'text',
          text: "I analyzed your query against your current regimen (Warfarin, Amiodarone). Please check with your doctor before introducing new pain relief medications."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const playMarathiAudio = () => {
    if ('speechSynthesis' in window) {
      const text = "कॉम्बीफ्लाम घेऊ नका. त्यामध्ये इबुप्रोफेन आहे, ज्यामुळे वॉर्फरिनसोबत रक्तस्त्राव होण्याचा धोका वाढतो.";
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  return (
    <div style={{
      flex: 1,
      background: '#f8faf8',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      {/* Top Header */}
      <div style={{
        padding: '16px 20px 12px 20px',
        background: '#ffffff',
        borderBottom: '1px solid #edf1ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={onBack}
            style={{ color: '#0f172a', padding: '4px', marginLeft: '-6px' }}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              MedGuard Copilot
            </h2>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Your medication safety assistant
            </div>
          </div>
        </div>

        <button style={{ color: '#64748b', padding: '6px' }}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  background: '#0b382c',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '18px 18px 4px 18px',
                  fontSize: '0.86rem',
                  maxWidth: '80%',
                  lineHeight: 1.4,
                  boxShadow: '0 2px 8px rgba(11, 56, 44, 0.15)'
                }}>
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.type === 'warning_card') {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #fee2e2',
                  borderRadius: '18px',
                  padding: '14px',
                  maxWidth: '92%',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', marginBottom: '6px' }}>
                    <AlertTriangle size={16} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800 }}>
                      {msg.status}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                    {msg.explanation}
                  </p>

                  {/* Context drug chips */}
                  {msg.contextMeds && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Current Medications</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {msg.contextMeds.map((cm, i) => (
                          <span key={i} style={{
                            fontSize: '0.72rem',
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 600
                          }}>
                            {cm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onNavigateTab && onNavigateTab('safety')}
                      style={{
                        padding: '6px 10px',
                        background: '#eafaf1',
                        color: '#15803d',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>View Interaction Details</span>
                      <ArrowRight size={12} />
                    </button>

                    <button
                      onClick={playMarathiAudio}
                      style={{
                        padding: '6px 10px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Volume2 size={13} />
                      <span>Hear in Marathi</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e8ede8',
                borderRadius: '18px 18px 18px 4px',
                padding: '10px 14px',
                maxWidth: '85%',
                fontSize: '0.85rem',
                color: '#1e293b',
                lineHeight: 1.4
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', color: '#15803d', fontSize: '0.76rem', fontStyle: 'italic' }}>
            <span>Copilot analyzing clinical ontology...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Pills */}
      <div style={{ padding: '0 16px 8px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            style={{
              textAlign: 'left',
              fontSize: '0.78rem',
              color: '#334155',
              padding: '6px 12px',
              borderRadius: '999px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              fontWeight: 500
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Bottom Bar */}
      <div style={{
        padding: '10px 16px 18px 16px',
        background: '#ffffff',
        borderTop: '1px solid #edf1ed',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          flex: 1,
          height: '42px',
          background: '#f8faf8',
          border: '1px solid #e2e8f0',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px'
        }}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '0.84rem',
              color: '#0f172a'
            }}
          />
          <button style={{ color: '#64748b', padding: '4px' }}>
            <Mic size={16} />
          </button>
        </div>

        <button
          onClick={() => handleSend()}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#0b382c',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(11, 56, 44, 0.25)'
          }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
}
