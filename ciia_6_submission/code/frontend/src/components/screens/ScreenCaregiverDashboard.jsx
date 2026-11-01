import React, { useState } from 'react';
import { 
  ChevronLeft, Phone, UserCheck, AlertTriangle, Clock, 
  Send, ShieldCheck, ChevronRight 
} from 'lucide-react';

export default function ScreenCaregiverDashboard({ onBack, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'activity' | 'patients'
  const [doctorNotified, setDoctorNotified] = useState(false);

  const activities = [
    { time: "14:28", event: "Warfarin dose marked as missed", color: "#dc2626" },
    { time: "14:05", event: "Patient opened reminder", color: "#16a34a" },
    { time: "13:52", event: "Safety profile synchronized", color: "#2563eb" }
  ];

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
          Caregiver
        </h2>
      </div>

      {/* Segmented Control */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: '#eafaf1',
        padding: '4px',
        borderRadius: '999px',
        marginBottom: '16px',
        border: '1px solid #d1fae5'
      }}>
        {['overview', 'activity', 'patients'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '7px 8px',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'capitalize',
              background: activeTab === tab ? '#0b382c' : 'transparent',
              color: activeTab === tab ? '#ffffff' : '#166534',
              transition: 'all 0.15s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Container */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Caregiver Profile Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e8ede8',
          borderRadius: '20px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(11, 56, 44, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
            }}>
              RK
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                Rahul Kulkarni
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Primary Caregiver
              </div>
            </div>
          </div>

          <div style={{
            background: '#eafaf1',
            color: '#15803d',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '999px',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
            <span>Connected</span>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e8ede8',
            borderRadius: '16px',
            padding: '12px 8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
              96.4%
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
              Patient Adherence<br />(30 days)
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #fee2e2',
            borderRadius: '16px',
            padding: '12px 8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
              1
            </div>
            <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
              Dose needs<br />attention
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #fef3c7',
            borderRadius: '16px',
            padding: '12px 8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
              2
            </div>
            <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
              Safety<br />alerts
            </div>
          </div>
        </div>

        {/* Missed Dose Action Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #fee2e2',
          borderRadius: '20px',
          padding: '16px',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
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
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#991b1b' }}>
                  Missed Dose - Warfarin 5 mg
                </span>
                <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                  High Priority
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#b91c1c', marginTop: '2px' }}>
                Today • 8:00 PM
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="tel:+919820011223"
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '999px',
                background: '#0b382c',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Phone size={14} />
              <span>Call Patient</span>
            </a>

            <button
              onClick={() => setDoctorNotified(true)}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: doctorNotified ? '#15803d' : '#334155',
                fontWeight: 600,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Send size={14} />
              <span>{doctorNotified ? 'Doctor Notified' : 'Notify Doctor'}</span>
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Activity
            </span>
            <button style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e8ede8',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {activities.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: act.color }} />
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, width: '40px' }}>
                  {act.time}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>
                  {act.event}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
