import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, XCircle, Flame, Award, TrendingUp, RefreshCw } from 'lucide-react';

export default function AdherenceCalendar({ patientId = 'patient_mrs_kulkarni_01', onDoseUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchAdherence = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}/adherence?days=30`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load adherence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdherence();
  }, [patientId, onDoseUpdated]);

  // Generate 30 days array ending today
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return days;
  };

  const daysList = getDaysArray();

  const getDayStatus = (dateStr) => {
    if (!data?.heatmap || !data.heatmap[dateStr]) {
      return { status: 'none', taken: 0, missed: 0, drugs: [] };
    }
    const day = data.heatmap[dateStr];
    if (day.taken > 0 && day.missed === 0) return { status: 'perfect', ...day };
    if (day.taken > 0 && day.missed > 0) return { status: 'partial', ...day };
    if (day.missed > 0 && day.taken === 0) return { status: 'missed', ...day };
    return { status: 'none', ...day };
  };

  // Calculate current streak
  const calculateStreak = () => {
    if (!data?.heatmap) return 0;
    let streak = 0;
    for (let i = daysList.length - 1; i >= 0; i--) {
      const day = data.heatmap[daysList[i].date];
      if (day && day.taken > 0 && day.missed === 0) {
        streak++;
      } else if (day && day.missed > 0) {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      padding: '24px',
      color: '#f8fafc',
      marginTop: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}>
            <Calendar size={22} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              30-Day Medication Adherence Journey
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Continuous compliance telemetry & immutable proof of ingestion
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdherence}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            padding: '10px',
            borderRadius: '10px',
            color: '#10b981'
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Adherence Rate
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
              {data?.adherence_rate ?? 0}%
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.2)',
            padding: '10px',
            borderRadius: '10px',
            color: '#f59e0b'
          }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Streak
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
              {streak} Days
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            padding: '10px',
            borderRadius: '10px',
            color: '#3b82f6'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Doses Taken
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60a5fa' }}>
              {data?.taken ?? 0} / {data?.total_doses ?? 0}
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            padding: '10px',
            borderRadius: '10px',
            color: '#ef4444'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Missed Doses
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171' }}>
              {data?.missed ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap Grid */}
      <div style={{
        background: 'rgba(2, 6, 23, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>
            Daily Dose Ingestion Grid (Past 30 Days)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }} />
              <span>100% Taken</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b' }} />
              <span>Partial</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ef4444' }} />
              <span>Missed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#334155' }} />
              <span>No Sched</span>
            </div>
          </div>
        </div>

        {/* The Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(15, 1fr)',
          gap: '8px'
        }}>
          {daysList.map((day) => {
            const st = getDayStatus(day.date);
            let bgColor = '#1e293b';
            let borderColor = 'rgba(255,255,255,0.05)';
            if (st.status === 'perfect') {
              bgColor = '#10b981';
              borderColor = '#059669';
            } else if (st.status === 'partial') {
              bgColor = '#f59e0b';
              borderColor = '#d97706';
            } else if (st.status === 'missed') {
              bgColor = '#ef4444';
              borderColor = '#b91c1c';
            }

            const isSelected = selectedDay?.date === day.date;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDay({ ...day, ...st })}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  backgroundColor: bgColor,
                  border: isSelected ? '2px solid #38bdf8' : `1px solid ${borderColor}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.6)' : 'none'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title={`${day.date}: ${st.taken} taken, ${st.missed} missed`}
              >
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: st.status === 'none' ? '#64748b' : '#ffffff' }}>
                  {day.dayNum}
                </span>
                <span style={{ fontSize: '0.55rem', color: st.status === 'none' ? '#475569' : 'rgba(255,255,255,0.8)' }}>
                  {day.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector */}
      {selectedDay && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {selectedDay.status === 'perfect' && <CheckCircle2 size={24} color="#10b981" />}
            {selectedDay.status === 'partial' && <AlertTriangle size={24} color="#f59e0b" />}
            {selectedDay.status === 'missed' && <XCircle size={24} color="#ef4444" />}
            {selectedDay.status === 'none' && <Calendar size={24} color="#64748b" />}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                {selectedDay.date} ({selectedDay.dayName})
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {selectedDay.taken} dose(s) taken • {selectedDay.missed} dose(s) missed
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
