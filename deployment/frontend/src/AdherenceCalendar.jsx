import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, XCircle, Award, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, Button, Badge } from './UIPrimitives';

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
    <Card style={{ marginTop: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              30-Day Medication Adherence Record
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Continuous compliance telemetry and verification log
          </p>
        </div>

        <Button
          onClick={fetchAdherence}
          variant="outline"
          size="sm"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* KPI Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Adherence Rate
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-safe-text)', marginTop: '4px' }}>
            {data?.adherence_rate ?? 0}%
          </div>
        </div>

        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Streak
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {streak} Days
          </div>
        </div>

        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Doses Taken
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {data?.taken ?? 0} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ {data?.total_doses ?? 0}</span>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Missed Doses
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: (data?.missed ?? 0) > 0 ? 'var(--status-critical-text)' : 'var(--text-secondary)', marginTop: '4px' }}>
            {data?.missed ?? 0}
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap Grid */}
      <div style={{
        background: 'var(--bg-app)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Daily Dose Ingestion Grid (Past 30 Days)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--status-safe-text)' }} />
              <span>Full</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--status-warning-text)' }} />
              <span>Partial</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--status-critical-text)' }} />
              <span>Missed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--border-subtle)' }} />
              <span>None</span>
            </div>
          </div>
        </div>

        {/* The Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(32px, 1fr))',
          gap: '6px'
        }}>
          {daysList.map((day) => {
            const st = getDayStatus(day.date);
            let bgColor = 'var(--bg-surface)';
            let borderColor = 'var(--border-subtle)';
            let textColor = 'var(--text-secondary)';

            if (st.status === 'perfect') {
              bgColor = 'var(--status-safe-bg)';
              borderColor = 'var(--status-safe-border)';
              textColor = 'var(--status-safe-text)';
            } else if (st.status === 'partial') {
              bgColor = 'var(--status-warning-bg)';
              borderColor = 'var(--status-warning-border)';
              textColor = 'var(--status-warning-text)';
            } else if (st.status === 'missed') {
              bgColor = 'var(--status-critical-bg)';
              borderColor = 'var(--status-critical-border)';
              textColor = 'var(--status-critical-text)';
            }

            const isSelected = selectedDay?.date === day.date;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDay({ ...day, ...st })}
                style={{
                  aspectRatio: '1',
                  borderRadius: '4px',
                  backgroundColor: bgColor,
                  border: isSelected ? '2px solid var(--accent-primary)' : `1px solid ${borderColor}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  transition: 'background-color 0.15s ease'
                }}
                title={`${day.date}: ${st.taken} taken, ${st.missed} missed`}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: textColor }}>
                  {day.dayNum}
                </span>
                <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
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
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {selectedDay.status === 'perfect' && <CheckCircle2 size={18} style={{ color: 'var(--status-safe-text)' }} />}
            {selectedDay.status === 'partial' && <AlertTriangle size={18} style={{ color: 'var(--status-warning-text)' }} />}
            {selectedDay.status === 'missed' && <XCircle size={18} style={{ color: 'var(--status-critical-text)' }} />}
            {selectedDay.status === 'none' && <Calendar size={18} style={{ color: 'var(--text-muted)' }} />}
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {selectedDay.date} ({selectedDay.dayName})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {selectedDay.taken} dose(s) taken • {selectedDay.missed} dose(s) missed
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8125rem'
            }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </Card>
  );
}
