import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Calendar 
} from 'lucide-react';

export default function ScreenAdherenceSchedule({ onBack, onNavigateMed }) {
  const [period, setPeriod] = useState('day'); // 'day' | 'week' | 'month'
  const [doses, setDoses] = useState([
    { id: 1, time: "07:30 AM", drug: "Pantoprazole 40 mg", taken: true },
    { id: 2, time: "08:00 AM", drug: "Metoprolol 50 mg", taken: true },
    { id: 3, time: "08:00 AM", drug: "Aspirin 75 mg", taken: true },
    { id: 4, time: "08:00 PM", drug: "Warfarin 5 mg", taken: false, highPriority: true },
    { id: 5, time: "10:00 PM", drug: "Atorvastatin 40 mg", taken: false }
  ]);

  const toggleDose = (id) => {
    setDoses(prev => prev.map(d => d.id === id ? { ...d, taken: !d.taken } : d));
  };

  const takenCount = doses.filter(d => d.taken).length;
  const totalCount = doses.length;
  const adherencePct = ((takenCount / totalCount) * 100).toFixed(1);

  return (
    <div style={{
      flex: 1,
      background: '#f8faf8',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px 24px 20px',
      position: 'relative'
    }}>
      {/* Top Header */}
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
          Adherence
        </h2>
      </div>

      {/* Segmented Period Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: '#eafaf1',
        padding: '4px',
        borderRadius: '999px',
        marginBottom: '16px',
        border: '1px solid #d1fae5'
      }}>
        {['day', 'week', 'month'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1,
              padding: '7px 8px',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'capitalize',
              background: period === p ? '#0b382c' : 'transparent',
              color: period === p ? '#ffffff' : '#166534',
              transition: 'all 0.15s ease'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Date Selector Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '0 4px'
      }}>
        <button style={{ color: '#64748b', padding: '4px' }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
          Fri, 26 Sep 2026
        </span>
        <button style={{ color: '#64748b', padding: '4px' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Circular Progress & Metrics Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e8ede8',
        borderRadius: '20px',
        padding: '18px 20px',
        marginBottom: '20px',
        boxShadow: '0 4px 14px rgba(11, 56, 44, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
      }}>
        {/* SVG Circular Progress Ring */}
        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke="#0b382c" 
              strokeWidth="8" 
              strokeDasharray="251.2"
              strokeDashoffset={251.2 * (1 - takenCount / totalCount)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              {takenCount} / {totalCount}
            </span>
            <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>
              doses
            </span>
          </div>
        </div>

        {/* Adherence Score Text */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534', lineHeight: 1.1 }}>
            {adherencePct}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
            adherence
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
            Excellent consistency
          </div>
        </div>
      </div>

      {/* Schedule Timeline Checklist */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {doses.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleDose(item.id)}
            style={{
              background: '#ffffff',
              border: item.taken ? '1px solid #e8ede8' : item.highPriority ? '1.5px solid #0b382c' : '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: item.highPriority && !item.taken ? '0 4px 12px rgba(11, 56, 44, 0.08)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', width: '60px' }}>
                {item.time}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {item.drug}
                </div>
                {item.highPriority && !item.taken && (
                  <span style={{ fontSize: '0.62rem', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    High Priority
                  </span>
                )}
              </div>
            </div>

            <div>
              {item.taken ? (
                <CheckCircle2 size={22} color="#16a34a" fill="#dcfce7" />
              ) : item.highPriority ? (
                <span style={{
                  background: '#0b382c',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '999px'
                }}>
                  Take Now
                </span>
              ) : (
                <Circle size={22} color="#cbd5e1" />
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
