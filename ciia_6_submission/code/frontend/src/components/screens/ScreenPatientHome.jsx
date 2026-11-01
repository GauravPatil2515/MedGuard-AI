import React, { useState } from 'react';
import { 
  Menu, Bell, AlertTriangle, Pill, CheckCircle2, ChevronRight, 
  Circle, Plus, Sparkles, Home, Shield, Bot, QrCode
} from 'lucide-react';

export default function ScreenPatientHome({
  patientName = "Mrs. Sumitra Kulkarni",
  patientAge = 68,
  diagnosis = "Post-CABG • Atrial Fibrillation",
  onNavigate,
  onTakeDose,
  adherenceRate = 96,
  medicationCount = 5,
  caregiverCount = 1
}) {
  const [takenDoses, setTakenDoses] = useState({
    panto: true,
    meto: true,
    aspirin: true,
    warfarin: false,
    atorva: false
  });

  const handleTakeWarfarin = () => {
    setTakenDoses(prev => ({ ...prev, warfarin: true }));
    if (onTakeDose) {
      onTakeDose({
        drug_name: "Warfarin",
        dosage: "5 mg",
        status: "TAKEN",
        criticality: "HIGH"
      });
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
      {/* Scrollable Main Area */}
      <div style={{ flex: 1, padding: '16px 20px 24px 20px', overflowY: 'auto' }}>
        
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <button style={{ color: '#1e293b', padding: '6px' }}>
            <Menu size={22} />
          </button>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => onNavigate && onNavigate('caregiver')}
              style={{ color: '#1e293b', padding: '6px' }}
            >
              <Bell size={22} />
            </button>
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              border: '2px solid #ffffff'
            }} />
          </div>
        </div>

        {/* Profile Card / Greeting */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.86rem', color: '#15803d', fontWeight: 600 }}>
              Good morning,
            </div>
            <h2 className="font-serif" style={{
              fontSize: '1.65rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '2px 0 4px 0'
            }}>
              {patientName}
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
              {patientAge} years • {diagnosis}
            </div>
          </div>

          {/* Avatar with Active Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
              border: '2px solid #ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#78350f',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80" 
                alt="Patient" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span style={{ position: 'absolute' }}>SK</span>
            </div>
            <div style={{
              background: '#eafaf1',
              color: '#15803d',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }} />
              Active
            </div>
          </div>
        </div>

        {/* Medication Safety Banner */}
        <div 
          onClick={() => onNavigate && onNavigate('safety')}
          style={{
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '18px',
            padding: '14px 16px',
            marginBottom: '18px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              flexShrink: 0
            }}>
              <AlertTriangle size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>
                  Medication Safety
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span>2 items need attention</span>
                  <ChevronRight size={14} />
                </div>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#b91c1c' }}>
                Review potential risks with your doctor.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Quick Stat Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '24px'
        }}>
          <div 
            onClick={() => onNavigate && onNavigate('scan_results')}
            style={{
              background: '#eafaf1',
              borderRadius: '16px',
              padding: '12px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid #d1fae5'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
              {medicationCount}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
              Medications
            </div>
          </div>

          <div 
            onClick={() => onNavigate && onNavigate('adherence')}
            style={{
              background: '#eafaf1',
              borderRadius: '16px',
              padding: '12px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid #d1fae5'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
              {adherenceRate}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
              Adherence <span style={{ fontSize: '0.62rem', color: '#64748b' }}>(30d)</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate && onNavigate('caregiver')}
            style={{
              background: '#eafaf1',
              borderRadius: '16px',
              padding: '12px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid #d1fae5'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
              {caregiverCount}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
              Caregiver
            </div>
          </div>
        </div>

        {/* Today's Medications Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}>
          <h3 className="font-serif" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Today's Medications
          </h3>
          <button 
            onClick={() => onNavigate && onNavigate('adherence')}
            style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}
          >
            See All
          </button>
        </div>

        {/* Schedule Timeline List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Dose 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '60px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
              07:30 AM
            </div>
            <div style={{
              flex: 1,
              background: '#ffffff',
              border: '1px solid #e8ede8',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Pantoprazole 40 mg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Before breakfast
                </div>
              </div>
              <CheckCircle2 size={22} color="#16a34a" fill="#dcfce7" />
            </div>
          </div>

          {/* Dose 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '60px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
              08:00 AM
            </div>
            <div style={{
              flex: 1,
              background: '#ffffff',
              border: '1px solid #e8ede8',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Metoprolol 50 mg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  After breakfast
                </div>
              </div>
              <CheckCircle2 size={22} color="#16a34a" fill="#dcfce7" />
            </div>
          </div>

          {/* Dose 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '60px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
              08:00 AM
            </div>
            <div style={{
              flex: 1,
              background: '#ffffff',
              border: '1px solid #e8ede8',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Aspirin 75 mg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  After breakfast
                </div>
              </div>
              <CheckCircle2 size={22} color="#16a34a" fill="#dcfce7" />
            </div>
          </div>

          {/* Dose 4 (Warfarin - High Priority with Take Now Button) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '60px', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
              08:00 PM
            </div>
            <div 
              style={{
                flex: 1,
                background: '#ffffff',
                border: takenDoses.warfarin ? '1px solid #e8ede8' : '1.5px solid #0b382c',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: takenDoses.warfarin ? 'none' : '0 4px 14px rgba(11, 56, 44, 0.08)'
              }}
            >
              <div 
                onClick={() => onNavigate && onNavigate('medication_detail')}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Warfarin 5 mg</span>
                  <span style={{ fontSize: '0.62rem', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    High Priority
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  After dinner
                </div>
              </div>

              {takenDoses.warfarin ? (
                <CheckCircle2 size={22} color="#16a34a" fill="#dcfce7" />
              ) : (
                <button
                  onClick={handleTakeWarfarin}
                  style={{
                    background: '#0b382c',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: '999px',
                    boxShadow: '0 2px 8px rgba(11, 56, 44, 0.2)'
                  }}
                >
                  Take Now
                </button>
              )}
            </div>
          </div>

          {/* Dose 5 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '60px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              10:00 PM
            </div>
            <div style={{
              flex: 1,
              background: '#ffffff',
              border: '1px solid #e8ede8',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>
                  Atorvastatin 40 mg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Bedtime
                </div>
              </div>
              <Circle size={20} color="#cbd5e1" />
            </div>
          </div>

        </div>

      </div>

      {/* Dock Bottom Bar */}
      <div className="bottom-dock-nav">
        <button 
          onClick={() => onNavigate && onNavigate('patient_home')}
          className="dock-item active"
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button 
          onClick={() => onNavigate && onNavigate('scan_results')}
          className="dock-item"
        >
          <Pill size={20} />
          <span>Medications</span>
        </button>

        <button 
          onClick={() => onNavigate && onNavigate('scanner')}
          className="dock-scanner-btn"
          title="Scan Prescription"
        >
          <QrCode size={22} />
        </button>

        <button 
          onClick={() => onNavigate && onNavigate('safety')}
          className="dock-item"
        >
          <Shield size={20} />
          <span>Safety</span>
        </button>

        <button 
          onClick={() => onNavigate && onNavigate('copilot')}
          className="dock-item"
        >
          <Bot size={20} />
          <span>Assistant</span>
        </button>
      </div>

    </div>
  );
}
