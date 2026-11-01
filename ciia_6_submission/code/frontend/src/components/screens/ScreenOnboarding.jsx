import React from 'react';
import { ArrowRight, FileText, ShieldAlert, Calendar, Users } from 'lucide-react';

export default function ScreenOnboarding({ onNext, onSkip }) {
  const features = [
    {
      icon: FileText,
      title: "Understand prescriptions",
      desc: "Scan & get a clear plan"
    },
    {
      icon: ShieldAlert,
      title: "Identify medication risks",
      desc: "AI + clinical rules"
    },
    {
      icon: Calendar,
      title: "Stay on track",
      desc: "Smart reminders"
    },
    {
      icon: Users,
      title: "Keep caregivers informed",
      desc: "Real-time alerts"
    }
  ];

  return (
    <div style={{
      flex: 1,
      background: '#f8faf8',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 20px 32px 20px',
      position: 'relative'
    }}>
      {/* Top Bar with Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button
          onClick={onSkip}
          style={{
            fontSize: '0.9rem',
            color: '#475569',
            fontWeight: 600,
            padding: '4px 10px'
          }}
        >
          Skip
        </button>
      </div>

      {/* Headline & Value Propositions */}
      <div style={{ marginTop: '12px' }}>
        <h1 className="font-serif" style={{
          fontSize: '2.15rem',
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.2,
          marginBottom: '26px',
          letterSpacing: '-0.02em'
        }}>
          A safer way<br />to manage<br />medications
        </h1>

        {/* Feature Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8ede8',
                  borderRadius: '18px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 2px 8px rgba(11, 56, 44, 0.03)'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#eafaf1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={20} color="#15803d" />
                </div>
                <div>
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    color: '#0f172a'
                  }}>
                    {feat.title}
                  </h4>
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '0.82rem',
                    color: '#64748b'
                  }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action & Pagination */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', marginTop: '24px' }}>
        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '999px',
            background: '#0b382c',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.98rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(11, 56, 44, 0.25)'
          }}
        >
          <span>Next</span>
          <ArrowRight size={18} />
        </button>

        {/* Pagination Dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
          <div style={{ width: '18px', height: '6px', borderRadius: '999px', background: '#0b382c' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
        </div>
      </div>
    </div>
  );
}
