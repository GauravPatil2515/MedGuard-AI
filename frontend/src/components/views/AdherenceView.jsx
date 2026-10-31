import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, 
  Calendar as CalendarIcon, TrendingUp, ShieldCheck 
} from 'lucide-react';

export default function AdherenceView({ onNavigateTab }) {
  const [period, setPeriod] = useState('day'); // 'day' | 'week' | 'month'
  const [doses, setDoses] = useState([
    { id: 1, time: "07:30 AM", drug: "Pantoprazole 40 mg", meal: "Before breakfast", taken: true },
    { id: 2, time: "08:00 AM", drug: "Metoprolol 50 mg", meal: "After breakfast", taken: true },
    { id: 3, time: "08:00 AM", drug: "Aspirin 75 mg", meal: "After breakfast", taken: true },
    { id: 4, time: "08:00 PM", drug: "Warfarin 5 mg", meal: "After dinner", taken: false, highPriority: true },
    { id: 5, time: "10:00 PM", drug: "Atorvastatin 40 mg", meal: "Bedtime", taken: false }
  ]);

  const toggleDose = (id) => {
    setDoses(prev => prev.map(d => d.id === id ? { ...d, taken: !d.taken } : d));
  };

  const takenCount = doses.filter(d => d.taken).length;
  const totalCount = doses.length;
  const adherencePct = ((takenCount / totalCount) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="font-serif" style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>
            Medication Adherence & Daily Regimen Hub
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748b' }}>
            Real-time compliance tracking, missed-dose escalation monitoring, and tamper-evident audit history.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: '#eafaf1',
          padding: '4px',
          borderRadius: '999px',
          border: '1px solid #bbf7d0'
        }}>
          {['day', 'week', 'month'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                background: period === p ? '#0b382c' : 'transparent',
                color: period === p ? '#ffffff' : '#166534',
                transition: 'all 0.15s ease'
              }}
            >
              {p} View
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Adherence Gauge on Left, Timeline Checklist on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Left: Adherence Metrics & Circular Progress */}
        <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-serif" style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
              Adherence Summary
            </h2>
            <span className="pill-badge pill-badge-green">
              96.4% (30-Day Index)
            </span>
          </div>

          {/* SVG Progress Ring */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
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
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {takenCount}/{totalCount}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                  doses taken
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#166534', lineHeight: 1 }}>
                {adherencePct}%
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#15803d', marginTop: '2px' }}>
                Today's Completion
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                1 high-priority dose remaining
              </div>
            </div>
          </div>

          {/* Quick Adherence Trend Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Weekly Streak</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>7 Days</div>
              <div style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600 }}>Zero critical misses</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Caregiver Sync</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Active</div>
              <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 600 }}>SSE Stream Connected</div>
            </div>
          </div>

        </div>

        {/* Right: Date Navigation & Interactive Dose Checklist */}
        <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{ padding: '6px', color: '#64748b' }}><ChevronLeft size={18} /></button>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Friday, 26 Sep 2026
              </span>
              <button style={{ padding: '6px', color: '#64748b' }}><ChevronRight size={18} /></button>
            </div>

            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Click dose to toggle status
            </span>
          </div>

          {/* Doses List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {doses.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleDose(item.id)}
                style={{
                  background: '#ffffff',
                  border: item.taken ? '1px solid #e8ede8' : item.highPriority ? '2px solid #0b382c' : '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: item.highPriority && !item.taken ? '0 4px 14px rgba(11, 56, 44, 0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', width: '65px' }}>
                    {item.time}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{item.drug}</span>
                      {item.highPriority && (
                        <span style={{ fontSize: '0.62rem', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          High Priority
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {item.meal}
                    </div>
                  </div>
                </div>

                <div>
                  {item.taken ? (
                    <CheckCircle2 size={24} color="#16a34a" fill="#dcfce7" />
                  ) : item.highPriority ? (
                    <span style={{
                      background: '#0b382c',
                      color: '#ffffff',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '6px 14px',
                      borderRadius: '999px'
                    }}>
                      Take Now
                    </span>
                  ) : (
                    <Circle size={24} color="#cbd5e1" />
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
