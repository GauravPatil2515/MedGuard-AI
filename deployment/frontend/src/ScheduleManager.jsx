import React, { useState, useEffect } from 'react';
import { Clock, Plus, Check, X, Pill, AlertCircle, ShieldAlert, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Button, Badge, Input } from './UIPrimitives';

export default function ScheduleManager({ patientId = 'patient_mrs_kulkarni_01', onDoseUpdated }) {
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [activeSchedules, setActiveSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [missModalDose, setMissModalDose] = useState(null);
  const [missReason, setMissReason] = useState('Forgot evening dose');

  // Form state for new schedule
  const [newDrug, setNewDrug] = useState({
    drug_name: '',
    dosage: '1 tablet',
    frequency: 'OD',
    meal_timing: 'After meals',
    duration_days: 30,
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resToday, resAll] = await Promise.all([
        fetch(`http://127.0.0.1:5000/api/patients/${patientId}/schedule/today`),
        fetch(`http://127.0.0.1:5000/api/patients/${patientId}/schedules`)
      ]);
      if (resToday.ok) {
        setTodaySchedule(await resToday.json());
      }
      if (resAll.ok) {
        setActiveSchedules(await resAll.json());
      }
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const handleMarkDose = async (doseItem, status, reason = '') => {
    try {
      const isCritical = doseItem.drug_name.toLowerCase().includes('warfarin') || 
                         doseItem.drug_name.toLowerCase().includes('amiodarone') ||
                         doseItem.drug_name.toLowerCase().includes('insulin');

      const res = await fetch('http://127.0.0.1:5000/api/schedules/dose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          schedule_id: doseItem.schedule_id,
          drug_name: doseItem.drug_name,
          scheduled_time: doseItem.scheduled_time,
          status: status,
          missed_reason: reason,
          criticality: isCritical ? 'HIGH' : 'MEDIUM'
        })
      });

      if (res.ok) {
        fetchData();
        if (onDoseUpdated) onDoseUpdated();
      }
    } catch (err) {
      console.error('Error recording dose:', err);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!newDrug.drug_name) return;

    try {
      const res = await fetch('http://127.0.0.1:5000/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          drug_name: newDrug.drug_name,
          dosage: newDrug.dosage,
          frequency: newDrug.frequency,
          meal_timing: newDrug.meal_timing,
          duration_days: parseInt(newDrug.duration_days) || 30,
          notes: newDrug.notes
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewDrug({
          drug_name: '',
          dosage: '1 tablet',
          frequency: 'OD',
          meal_timing: 'After meals',
          duration_days: 30,
          notes: ''
        });
        fetchData();
        if (onDoseUpdated) onDoseUpdated();
      }
    } catch (err) {
      console.error('Error adding schedule:', err);
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr.split('T')[1] || isoStr;
    }
  };

  return (
    <Card style={{ marginTop: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--text-secondary)' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Today's Medication Dosing Schedule
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Real-time ingestion tracker with 1-click verification & automated escalation
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          size="sm"
        >
          <Plus size={14} />
          Add Schedule
        </Button>
      </div>

      {/* Today's Doses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {todaySchedule.map((item, idx) => {
          const isTaken = item.status === 'TAKEN';
          const isWarfarin = item.drug_name.toLowerCase().includes('warfarin');

          return (
            <div
              key={idx}
              style={{
                background: isTaken ? 'var(--status-safe-bg)' : 'var(--bg-app)',
                border: `1px solid ${isTaken ? 'var(--status-safe-border)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                <div style={{
                  background: isTaken ? 'var(--status-safe-border)' : 'var(--border-subtle)',
                  color: isTaken ? 'var(--status-safe-text)' : 'var(--text-secondary)',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex'
                }}>
                  <Pill size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.drug_name}
                    </span>
                    <Badge variant="neutral">{item.dosage}</Badge>
                    {isWarfarin && (
                      <Badge variant="critical">HIGH CRITICALITY</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                    <span>Scheduled: <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatTime(item.scheduled_time)}</strong></span>
                    <span>Timing: {item.meal_timing || 'Any time'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isTaken ? (
                  <Badge variant="safe" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                    <Check size={13} style={{ marginRight: '4px' }} /> Taken
                  </Badge>
                ) : (
                  <>
                    <Button
                      onClick={() => handleMarkDose(item, 'TAKEN')}
                      variant="primary"
                      size="sm"
                    >
                      <Check size={14} />
                      Take Now
                    </Button>
                    <Button
                      onClick={() => setMissModalDose(item)}
                      variant="critical"
                      size="sm"
                    >
                      <X size={14} />
                      Missed
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {todaySchedule.length === 0 && !loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No medication doses scheduled for today. Click "Add Schedule" to configure medications.
          </div>
        )}
      </div>

      {/* Missed Dose Reason Modal */}
      {missModalDose && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: 'var(--shadow-modal)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-critical-text)', marginBottom: '12px' }}>
              <ShieldAlert size={20} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Log Missed Dose</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Logging a missed dose for <strong style={{ color: 'var(--text-primary)' }}>{missModalDose.drug_name}</strong> will create an immutable audit record and dispatch a real-time escalation alert to the assigned clinical team.
            </p>

            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Reason for missed dose:
            </label>
            <select
              value={missReason}
              onChange={(e) => setMissReason(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                marginBottom: '20px',
                outline: 'none'
              }}
            >
              <option value="Forgot evening dose">Forgot scheduled time</option>
              <option value="Experiencing side effects / Nausea">Side effects / Nausea</option>
              <option value="Medication stock ran out">Medication stock ran out</option>
              <option value="Doctor advised temporary pause">Doctor advised temporary pause</option>
              <option value="Fasting / Food restrictions">Fasting / Food restrictions</option>
            </select>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                onClick={() => setMissModalDose(null)}
                variant="outline"
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleMarkDose(missModalDose, 'MISSED', missReason);
                  setMissModalDose(null);
                }}
                variant="critical"
                style={{ flex: 1 }}
              >
                Confirm Missed Dose
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: 'var(--shadow-modal)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Add Medication Schedule
            </h3>

            <form onSubmit={handleAddSchedule}>
              <div style={{ marginBottom: '14px' }}>
                <Input
                  label="Medicine Name & Strength"
                  placeholder="e.g. Pantoprazole 40mg"
                  value={newDrug.drug_name}
                  onChange={(e) => setNewDrug({ ...newDrug, drug_name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Frequency
                  </label>
                  <select
                    value={newDrug.frequency}
                    onChange={(e) => setNewDrug({ ...newDrug, frequency: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius)',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="OD">OD (Once Daily)</option>
                    <option value="BD">BD (Twice Daily)</option>
                    <option value="TDS">TDS (Thrice Daily)</option>
                    <option value="HS">HS (Bedtime)</option>
                    <option value="SOS">SOS (As Needed)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Meal Timing
                  </label>
                  <select
                    value={newDrug.meal_timing}
                    onChange={(e) => setNewDrug({ ...newDrug, meal_timing: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius)',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="After meals">After meals</option>
                    <option value="Before meals">Before meals</option>
                    <option value="With meals">With meals</option>
                    <option value="Empty stomach">Empty stomach</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <Input
                  label="Dosage Unit"
                  value={newDrug.dosage}
                  onChange={(e) => setNewDrug({ ...newDrug, dosage: e.target.value })}
                />
                <Input
                  label="Duration (Days)"
                  type="number"
                  value={newDrug.duration_days}
                  onChange={(e) => setNewDrug({ ...newDrug, duration_days: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: 1 }}
                >
                  Save Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
