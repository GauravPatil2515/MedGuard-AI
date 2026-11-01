import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ArrowRight, ShieldCheck, Volume2, Bell, RefreshCw } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Section from '../ui/Section';
import MedicationCard from '../ui/MedicationCard';
import StatusBadge from '../ui/StatusBadge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardView({
  onNavigateTab,
  selectedLang = 'mr',
  onEmergencyCall
}) {
  const { user } = useAuth();
  const [doses, setDoses] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [riskEvents, setRiskEvents] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingDoseId, setPlayingDoseId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const patientId = user?.id;

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!patientId) return;
    
    try {
      setError(null);
      
      // Fetch all data in parallel
      const [dosesRes, medicinesRes, riskRes, adherenceRes] = await Promise.all([
        api.getTodaysSchedule(patientId).catch(() => []),
        api.getMedicines().catch(() => ({ medicines: [] })),
        api.getRiskFlags(patientId).catch(() => ({ flags: [], count: 0 })),
        api.getAdherence(patientId, 30).catch(() => null),
      ]);

      setDoses(dosesRes || []);
      setMedicines(medicinesRes.medicines || []);
      setRiskEvents(riskRes.flags || []);
      setAdherence(adherenceRes);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Computed values from real data
  const pendingDoses = doses.filter(d => d.status === 'PENDING');
  const takenDoses = doses.filter(d => d.status === 'TAKEN');
  const takenCount = takenDoses.length;
  const adherenceRate = doses.length > 0 ? Math.round((takenCount / doses.length) * 100) : 100;
  const unresolvedRisks = riskEvents.filter(r => r.status === 'unresolved');

  // Find bottle info for a dose
  const getBottleInfo = (drugName) => {
    const med = medicines.find(m => m.name === drugName || m.brand_name === drugName);
    if (med) {
      return {
        remaining: med.remaining ?? 30,
        total: 30
      };
    }
    // Fallback: compute from dose history
    const doseHistory = doses.filter(d => d.drug_name === drugName || d.drugName === drugName);
    const taken = doseHistory.filter(d => d.status === 'TAKEN').length;
    return { remaining: 30 - taken, total: 30 };
  };

  const handleTakeDoseClick = async (dose) => {
    try {
      await api.logAdherence({
        patient_id: patientId,
        drug_name: dose.drug_name || dose.drugName,
        dosage: dose.dosage,
        status: 'TAKEN',
        criticality: dose.criticality || 'MEDIUM',
        verification_type: 'ONE_CLICK',
      });
      // Refresh dashboard after logging
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to log dose:', err);
      setError('Failed to record dose');
    }
  };

  const handlePlayAudio = async (dose) => {
    setPlayingDoseId(dose.id);
    try {
      const drugLower = (dose.drug_name || dose.drugName || '').toLowerCase();
      let warningType = 'missed_dose_warning';
      if (drugLower.includes('warfarin') || drugLower.includes('combiflam')) {
        warningType = 'warfarin_bleeding_warning';
      }
      
      const res = await api.getAudio(warningType, selectedLang);
      
      if (res.success && res.audio_base64) {
        const audio = new Audio(res.audio_base64);
        audio.onended = () => setPlayingDoseId(null);
        audio.onerror = () => setPlayingDoseId(null);
        await audio.play();
      } else {
        // Fallback to browser speech synthesis
        const text = drugLower.includes('warfarin')
          ? 'Take Warfarin 5 milligrams after dinner. This is a critical blood thinner. Do not skip doses.'
          : `Take ${dose.drug_name || dose.drugName} ${dose.dosage} ${(dose.timing || '').toLowerCase()}.`;
        
        if ('speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance(text);
          msg.lang = selectedLang === 'mr' ? 'mr-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-US';
          msg.onend = () => setPlayingDoseId(null);
          msg.onerror = () => setPlayingDoseId(null);
          window.speechSynthesis.speak(msg);
        } else {
          setTimeout(() => setPlayingDoseId(null), 2500);
        }
      }
    } catch (err) {
      console.error('TTS error:', err);
      setPlayingDoseId(null);
    }
  };

  const getTimeBadge = (scheduledTime) => {
    const hour = parseInt(scheduledTime?.split('T')[1]?.split(':')[0] || '0');
    if (hour < 12) return 'Morning Dose';
    if (hour < 17) return 'Afternoon Dose';
    return 'Evening Dose';
  };

  const getFoodInstruction = (mealTiming) => {
    const t = mealTiming?.toLowerCase() || '';
    if (t.includes('breakfast')) return 'Take with breakfast';
    if (t.includes('dinner') || t.includes('evening')) return 'Take with dinner';
    if (t.includes('lunch') || t.includes('afternoon')) return 'Take with lunch';
    if (t.includes('before')) return 'Take before meal';
    return 'Take with food';
  };

  // Handle empty state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '300px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '16px'
      }}>
        <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--mg-primary)' }} />
        <p style={{ color: 'var(--mg-text-muted)' }}>Loading your medications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mg-card" style={{ padding: '32px', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: 'var(--mg-danger)', marginBottom: '12px' }} />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--mg-text-main)' }}>
          Failed to Load Data
        </h3>
        <p style={{ color: 'var(--mg-text-muted)', marginBottom: '16px' }}>
          {error}
        </p>
        <button onClick={handleRefresh} className="btn-primary">
          <RefreshCw size={18} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <PageHeader
        title="Today's Pills"
        subtitle={`${pendingDoses.length} dose${pendingDoses.length !== 1 ? 's' : ''} due • ${adherenceRate}% taken today`}
        action={
          <button 
            onClick={() => onNavigateTab && onNavigateTab('scanner')}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <span>Scan Bottle</span>
            <ArrowRight size={15} />
          </button>
        }
      />

      {/* Safety Alert Banner - Plain Language */}
      {unresolvedRisks.length > 0 && (
        <div 
          onClick={() => onNavigateTab && onNavigateTab('safety')}
          className="mg-card"
          style={{
            padding: '16px 20px',
            background: 'var(--mg-danger-soft)',
            borderColor: 'var(--mg-danger-border)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: '#fee2e2',
              color: 'var(--mg-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991b1b' }}>
                  Safety Warning
                </span>
                <StatusBadge type="danger" label={`${unresolvedRisks.length} clash${unresolvedRisks.length > 1 ? 'es' : ''} detected`} />
              </div>
              <p style={{ color: '#b91c1c', marginTop: '4px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {unresolvedRisks.map((r, i) => (
                  <React.Fragment key={r.id || i}>
                    <strong>{r.drugPair?.join(' + ') || 'Medication combination'}</strong>: {r.description?.slice(0, 150)}
                    {i < unresolvedRisks.length - 1 && '; '}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigateTab && onNavigateTab('safety'); }}
            className="btn-ghost"
            style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-danger)', borderColor: 'var(--mg-danger)' }}
          >
            View Details & What to Do
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* All Clear Banner */}
      {unresolvedRisks.length === 0 && doses.length > 0 && (
        <div className="mg-card" style={{
          padding: '14px 20px',
          background: 'var(--mg-success-soft)',
          borderColor: 'rgba(22, 101, 52, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--mg-accent-soft)',
            color: 'var(--mg-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '1rem', color: 'var(--mg-primary)' }}>
              All Medications Safe Today
            </strong>
            <span style={{ marginLeft: '8px', color: 'var(--mg-text-muted)', fontSize: '0.9rem' }}>
              No harmful combinations detected among {medicines.length} medications
            </span>
          </div>
        </div>
      )}

      {/* Today's Doses - Main Content */}
      <Section 
        title="Doses Due" 
        subtitle={`${pendingDoses.length} pending • ${takenCount} taken`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {doses.length > 0 ? (
            doses.map(dose => {
              const isTaken = dose.status === 'TAKEN';
              const isPending = dose.status === 'PENDING';
              const bottle = getBottleInfo(dose.drug_name || dose.drugName);
              
              return (
                <MedicationCard
                  key={dose.id || dose.schedule_id}
                  name={dose.drug_name || dose.drugName}
                  generic={dose.dosage}
                  dose={dose.dosage}
                  timing={`${getTimeBadge(dose.scheduled_time || dose.scheduledTime)} • ${(dose.scheduled_time || dose.scheduledTime || '').split('T')[1]?.slice(0, 5) || ''}`}
                  frequency={getFoodInstruction(dose.meal_timing || dose.mealTiming)}
                  purpose={dose.criticality === 'HIGH' ? "Critical medication — do not skip" : "Daily maintenance"}
                  isHighPriority={dose.criticality === 'HIGH'}
                  isTaken={isTaken}
                  onTake={isPending ? () => handleTakeDoseClick(dose) : null}
                  onPlayAudio={() => handlePlayAudio(dose)}
                  bottleCount={bottle.remaining}
                  totalPills={bottle.total}
                />
              );
            })
          ) : (
            <div className="mg-card" style={{ padding: '32px', textAlign: 'center' }}>
              <Bell size={48} style={{ color: 'var(--mg-text-dim)', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--mg-text-main)' }}>
                No Doses Scheduled
              </h3>
              <p style={{ color: 'var(--mg-text-muted)', marginBottom: '16px' }}>
                Add a medication from the Scan tab to get started
              </p>
              <button
                onClick={() => onNavigateTab && onNavigateTab('scanner')}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
              >
                Scan Bottle
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Adherence Summary - Real Data */}
      {(doses.length > 0 || adherence) && (
        <Section title="Today's Progress" subtitle="Your medication adherence">
          <div className="mg-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: adherenceRate >= 90 ? 'var(--mg-accent-soft)' : adherenceRate >= 70 ? 'var(--mg-warning-soft)' : 'var(--mg-danger-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: adherenceRate >= 90 ? 'var(--mg-accent)' : adherenceRate >= 70 ? 'var(--mg-warning)' : 'var(--mg-danger)'
                  }}>
                    {adherenceRate}%
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mg-text-main)' }}>
                    {takenCount} of {doses.length} doses taken
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--mg-text-muted)' }}>
                    {adherenceRate >= 90 ? 'Excellent! Keep it up' : adherenceRate >= 70 ? 'Good — try not to miss any more' : '⚠️ Several doses missed today'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('caregiver')}
                className="btn-ghost"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                View Full History
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 30-day adherence if available */}
            {adherence && adherence.heatmap && (
              <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--mg-card-border)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)', marginBottom: '8px' }}>
                  30-Day Overview: {adherence.adherence_rate}% ({adherence.taken}/{adherence.total_doses} taken)
                </div>
                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', maxHeight: '80px', overflowY: 'auto' }}>
                  {Object.entries(adherence.heatmap)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 30)
                    .map(([date, data]) => (
                      <div 
                        key={date} 
                        style={{ 
                          width: '28px', height: '28px', borderRadius: '6px',
                          background: data.taken > 0 && data.missed === 0 ? 'var(--mg-accent)' : 
                                    data.missed > 0 ? 'var(--mg-danger)' : 
                                    'var(--mg-card-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 600, color: '#fff',
                          cursor: 'default',
                          title: `${date}: ${data.taken} taken, ${data.missed} missed`
                        }}
                      >
                        {data.taken}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

    </div>
  );
}