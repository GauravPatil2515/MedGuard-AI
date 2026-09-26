import React, { useState, useEffect } from 'react';
import { Clock, Plus, Check, X, Pill, AlertCircle, ShieldAlert, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

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
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
          }}>
            <Clock size={22} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Today's Medication Dosing Schedule
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Real-time ingestion tracker with 1-click verification & automated escalation
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 16px',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={16} />
          Add Schedule
        </button>
      </div>

      {/* Today's Doses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {todaySchedule.map((item, idx) => {
          const isTaken = item.status === 'TAKEN';
          const isWarfarin = item.drug_name.toLowerCase().includes('warfarin');

          return (
            <div
              key={idx}
              style={{
                background: isTaken ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.45)',
                border: isTaken ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: isTaken ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                  color: isTaken ? '#10b981' : '#818cf8',
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'flex'
                }}>
                  <Pill size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                      {item.drug_name}
                    </span>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#94a3b8'
                    }}>
                      {item.dosage}
                    </span>
                    {isWarfarin && (
                      <span style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        HIGH CRITICALITY
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', display: 'flex', gap: '12px' }}>
                    <span>⏰ Scheduled: <strong style={{ color: '#e2e8f0' }}>{formatTime(item.scheduled_time)}</strong></span>
                    <span>🍽️ {item.meal_timing || 'Any time'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isTaken ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    <Check size={16} />
                    Taken
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleMarkDose(item, 'TAKEN')}
                      style={{
                        background: '#10b981',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Check size={15} />
                      Take Now
                    </button>
                    <button
                      onClick={() => setMissModalDose(item)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        color: '#f87171',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <X size={15} />
                      Missed
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {todaySchedule.length === 0 && !loading && (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            No medication doses scheduled for today. Click "Add Schedule" above to add medicines.
          </div>
        )}
      </div>

      {/* Missed Dose Reason Modal */}
      {missModalDose && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', marginBottom: '14px' }}>
              <ShieldAlert size={28} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Log Missed Dose</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Logging a missed dose for <strong style={{ color: '#fff' }}>{missModalDose.drug_name}</strong> will create an immutable audit record and dispatch a real-time escalation alert to your assigned caregiver.
            </p>

            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Reason for missing dose:
            </label>
            <select
              value={missReason}
              onChange={(e) => setMissReason(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                marginBottom: '20px',
                outline: 'none'
              }}
            >
              <option value="Forgot evening dose" style={{ background: '#0f172a' }}>Forgot scheduled time</option>
              <option value="Experiencing side effects / Nausea" style={{ background: '#0f172a' }}>Side effects / Nausea</option>
              <option value="Medication stock ran out" style={{ background: '#0f172a' }}>Medication stock ran out</option>
              <option value="Doctor advised temporary pause" style={{ background: '#0f172a' }}>Doctor advised temporary pause</option>
              <option value="Fasting / Food restrictions" style={{ background: '#0f172a' }}>Fasting / Food restrictions</option>
            </select>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setMissModalDose(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleMarkDose(missModalDose, 'MISSED', missReason);
                  setMissModalDose(null);
                }}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                Confirm Missed Dose
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Add Medication Schedule
            </h3>

            <form onSubmit={handleAddSchedule}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Medicine Name & Strength:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pantoprazole 40mg"
                  value={newDrug.drug_name}
                  onChange={(e) => setNewDrug({ ...newDrug, drug_name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#fff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Frequency:
                  </label>
                  <select
                    value={newDrug.frequency}
                    onChange={(e) => setNewDrug({ ...newDrug, frequency: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px',
                      color: '#fff'
                    }}
                  >
                    <option value="OD" style={{ background: '#0f172a' }}>OD (Once Daily)</option>
                    <option value="BD" style={{ background: '#0f172a' }}>BD (Twice Daily)</option>
                    <option value="TDS" style={{ background: '#0f172a' }}>TDS (Thrice Daily)</option>
                    <option value="HS" style={{ background: '#0f172a' }}>HS (Bedtime)</option>
                    <option value="SOS" style={{ background: '#0f172a' }}>SOS (As Needed)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Meal Timing:
                  </label>
                  <select
                    value={newDrug.meal_timing}
                    onChange={(e) => setNewDrug({ ...newDrug, meal_timing: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px',
                      color: '#fff'
                    }}
                  >
                    <option value="After meals" style={{ background: '#0f172a' }}>After meals</option>
                    <option value="Before meals" style={{ background: '#0f172a' }}>Before meals</option>
                    <option value="With meals" style={{ background: '#0f172a' }}>With meals</option>
                    <option value="Empty stomach" style={{ background: '#0f172a' }}>Empty stomach</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Dosage Unit:
                  </label>
                  <input
                    type="text"
                    value={newDrug.dosage}
                    onChange={(e) => setNewDrug({ ...newDrug, dosage: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Duration (Days):
                  </label>
                  <input
                    type="number"
                    value={newDrug.duration_days}
                    onChange={(e) => setNewDrug({ ...newDrug, duration_days: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
                  }}
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
