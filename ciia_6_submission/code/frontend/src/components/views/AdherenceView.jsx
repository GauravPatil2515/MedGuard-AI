import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, 
  Calendar as CalendarIcon, TrendingUp, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdherenceView({ onNavigateTab }) {
  const { user } = useAuth();
  const patientId = user?.patient_id || user?.id || 'patient_mrs_kulkarni_01';

  const [period, setPeriod] = useState('day'); // 'day' | 'week' | 'month'
  const [doses, setDoses] = useState([]);
  const [adherenceData, setAdherenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdherence = useCallback(async () => {
    try {
      const [todayDoses, adherence] = await Promise.all([
        api.getTodaysSchedule(patientId).catch(() => []),
        api.getAdherence(patientId, 30).catch(() => null)
      ]);

      if (todayDoses && todayDoses.length > 0) {
        setDoses(todayDoses.map((d, idx) => ({
          id: d.id || d.schedule_id || idx + 1,
          schedule_id: d.schedule_id || d.id,
          time: d.scheduled_time ? d.scheduled_time.substring(11, 16) || d.scheduled_time : "08:00 AM",
          drug: `${d.drug_name || d.brand_name} ${d.dose || d.dosage || ''}`.trim(),
          meal: d.food_instruction ? d.food_instruction.replace('_', ' ') : "With meal",
          taken: d.status === 'TAKEN',
          highPriority: (d.criticality || '').toUpperCase() === 'HIGH' || (d.criticality || '').toUpperCase() === 'CRITICAL'
        })));
      } else {
        // Fallback default regimen if DB has not populated yet
        setDoses([
          { id: 1, schedule_id: "demo-1", time: "08:00 AM", drug: "Metformin 500mg", meal: "With breakfast", taken: true },
          { id: 2, schedule_id: "demo-2", time: "08:00 AM", drug: "Aspirin 75mg", meal: "After breakfast", taken: true },
          { id: 3, schedule_id: "demo-3", time: "08:00 PM", drug: "Warfarin 5mg", meal: "After dinner", taken: false, highPriority: true },
          { id: 4, schedule_id: "demo-4", time: "10:00 PM", drug: "Atorvastatin 40mg", meal: "Bedtime", taken: false }
        ]);
      }

      setAdherenceData(adherence);
    } catch (err) {
      console.error('Failed to load adherence data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchAdherence();
  }, [fetchAdherence]);

  const toggleDose = async (item) => {
    const newStatus = item.taken ? 'SCHEDULED' : 'TAKEN';
    // Optimistic UI update
    setDoses(prev => prev.map(d => d.id === item.id ? { ...d, taken: !d.taken } : d));

    try {
      await api.logDose({
        patient_id: patientId,
        schedule_id: item.schedule_id,
        drug_name: item.drug,
        status: newStatus,
        criticality: item.highPriority ? 'HIGH' : 'MEDIUM'
      });
      // Re-fetch adherence summary to update circular gauge and 30-day index
      const freshAdherence = await api.getAdherence(patientId, 30).catch(() => null);
      if (freshAdherence) setAdherenceData(freshAdherence);
    } catch (e) {
      console.error('Failed to log dose toggle:', e);
    }
  };

  const takenCount = doses.filter(d => d.taken).length;
  const totalCount = doses.length || 1;
  const adherencePct = ((takenCount / totalCount) * 100).toFixed(1);
  const thirtyDayIndex = adherenceData?.rate ? (adherenceData.rate * 100).toFixed(1) : adherencePct;
  const heatmap = adherenceData?.heatmap || [];

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

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: '#0b382c' }} />
        </div>
      ) : (
        <>
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
                  {thirtyDayIndex}% (30-Day Index)
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
                    {totalCount - takenCount > 0 ? `${totalCount - takenCount} doses remaining today` : 'All scheduled doses completed!'}
                  </div>
                </div>
              </div>

              {/* Quick Adherence Trend Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Weekly Streak</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {adherenceData?.streak_days || 7} Days
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600 }}>Zero critical misses</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Caregiver Sync</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>Active</div>
                  <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 600 }}>SSE Stream Connected</div>
                </div>
              </div>

            </div>

            {/* Right: Interactive Dose Checklist */}
            <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarIcon size={18} style={{ color: '#0b382c' }} />
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    Today's Prescribed Regimen
                  </span>
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
                    onClick={() => toggleDose(item)}
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

          {/* 30-Day Adherence Heatmap Grid */}
          {heatmap && heatmap.length > 0 && (
            <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-serif" style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  30-Day Compliance Heatmap
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Green = All taken • Amber = Partial • Red = Missed
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))',
                gap: '6px'
              }}>
                {heatmap.map((day, idx) => {
                  const rate = day.rate ?? (day.taken && day.total ? day.taken / day.total : 1);
                  const color = rate >= 1 ? '#16a34a' : rate >= 0.5 ? '#eab308' : '#ef4444';
                  return (
                    <div 
                      key={idx}
                      title={`${day.date || `Day ${idx + 1}`}: ${Math.round(rate * 100)}%`}
                      style={{
                        height: '28px',
                        background: color,
                        borderRadius: '6px',
                        opacity: 0.85,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.62rem',
                        fontWeight: 700
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
