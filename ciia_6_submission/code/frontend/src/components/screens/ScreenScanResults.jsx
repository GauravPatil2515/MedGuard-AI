import React, { useState } from 'react';
import { ChevronLeft, Check, Pill, Sparkles, ArrowRight, ClipboardCheck } from 'lucide-react';

export default function ScreenScanResults({ onBack, onAddToMedications, onSelectMed }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'plan'

  const extractedMedicines = [
    {
      brand: "Ecosprin",
      generic: "Aspirin",
      dose: "75 mg",
      freq: "OD",
      timing: "After breakfast",
      tagColor: "#e0f2fe",
      textColor: "#0369a1"
    },
    {
      brand: "Met-XL",
      generic: "Metoprolol Succinate",
      dose: "50 mg",
      freq: "OD",
      timing: "After breakfast",
      tagColor: "#f1f5f9",
      textColor: "#334155"
    },
    {
      brand: "Warfarin",
      generic: "Warfarin",
      dose: "5 mg",
      freq: "OD",
      timing: "After dinner",
      tagColor: "#fee2e2",
      textColor: "#dc2626",
      highPriority: true
    },
    {
      brand: "Amiodarone",
      generic: "Amiodarone",
      dose: "200 mg",
      freq: "OD",
      timing: "After dinner",
      tagColor: "#fef3c7",
      textColor: "#b45309"
    },
    {
      brand: "Pantocid",
      generic: "Pantoprazole",
      dose: "40 mg",
      freq: "OD",
      timing: "Before breakfast",
      tagColor: "#f3e8ff",
      textColor: "#7e22ce"
    }
  ];

  return (
    <div style={{
      flex: 1,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 20px 24px 20px',
      position: 'relative'
    }}>
      {/* Scrollable Container */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <button 
            onClick={onBack}
            style={{ color: '#0f172a', padding: '6px', marginLeft: '-6px' }}
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h2 className="font-serif" style={{
            fontSize: '1.45rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px 0'
          }}>
            Prescription Understood
          </h2>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#eafaf1',
            color: '#15803d',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            border: '1px solid #bbf7d0'
          }}>
            <Check size={14} />
            <span>96.8% confidence</span>
          </div>
        </div>

        {/* Tab Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#f8fafc',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '1px solid #edf2f7'
        }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '9px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: activeTab === 'list' ? '#ffffff' : 'transparent',
              color: activeTab === 'list' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'list' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Medicine List
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '9px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: activeTab === 'plan' ? '#ffffff' : 'transparent',
              color: activeTab === 'plan' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'plan' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Patient Plan
          </button>
        </div>

        {/* Extracted Drug Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {extractedMedicines.map((med, idx) => (
            <div
              key={idx}
              onClick={() => onSelectMed && onSelectMed(med)}
              style={{
                background: '#ffffff',
                border: '1px solid #e8ede8',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(11, 56, 44, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: med.tagColor,
                  color: med.textColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.72rem'
                }}>
                  {med.brand.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    {med.brand}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    ({med.generic})
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {med.dose}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {med.freq} • {med.timing}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Ready Callout Banner */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#15803d',
            flexShrink: 0
          }}>
            <ClipboardCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#14532d' }}>
              Ready to add to your plan?
            </div>
            <div style={{ fontSize: '0.76rem', color: '#166534', marginTop: '3px', lineHeight: 1.4 }}>
              This will create your medication schedule and enable safety analysis.
            </div>
          </div>
        </div>

      </div>

      {/* Bottom CTA Button */}
      <button
        onClick={onAddToMedications}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '999px',
          background: '#0b382c',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.96rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 8px 20px rgba(11, 56, 44, 0.25)',
          marginTop: '8px'
        }}
      >
        <span>Add to My Medications</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
