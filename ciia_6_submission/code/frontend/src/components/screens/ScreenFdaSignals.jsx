import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, AlertOctagon, TrendingUp } from 'lucide-react';

export default function ScreenFdaSignals({ onBack }) {
  const [activeTab, setActiveTab] = useState('adverse'); // 'adverse' | 'recalls'

  const monthlyReports = [
    { month: 'Jan', val: 35 },
    { month: 'Feb', val: 42 },
    { month: 'Mar', val: 68 },
    { month: 'Apr', val: 55 },
    { month: 'May', val: 78 },
    { month: 'Jun', val: 92 }
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
          fontSize: '1.02rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: 0,
          marginRight: '24px'
        }}>
          FDA & Real-World Signals
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
        {['adverse', 'recalls'].map(tab => (
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
            {tab === 'adverse' ? 'Adverse Events' : 'Recalls'}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Drug Status Header Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e8ede8',
          borderRadius: '18px',
          padding: '14px 16px',
          boxShadow: '0 2px 8px rgba(11, 56, 44, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Metformin
              </h3>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                Batch #KJ230
              </div>
            </div>

            <div style={{
              background: '#eafaf1',
              color: '#15803d',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={13} />
              <span>No active recalls</span>
            </div>
          </div>
        </div>

        {/* FAERS Bar Chart Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e8ede8',
          borderRadius: '20px',
          padding: '18px',
          boxShadow: '0 4px 14px rgba(11, 56, 44, 0.03)'
        }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Recent Adverse Event Reports (FAERS)
          </div>

          {/* Bar Chart Grid */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '130px', gap: '12px', paddingBottom: '8px' }}>
            {/* Y axis numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', fontSize: '0.62rem', color: '#94a3b8', paddingRight: '4px' }}>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            {/* Bars */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
              {monthlyReports.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: `${(item.val / 100) * 110}px`,
                      background: 'linear-gradient(180deg, #34d399 0%, #15803d 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commonly Reported Events Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e8ede8',
          borderRadius: '18px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(11, 56, 44, 0.03)'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
            Commonly reported events:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }} />
              <span>Gastrointestinal disorders</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }} />
              <span>Lactic acidosis (rare)</span>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer Note */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid #e2e8f0',
          fontSize: '0.72rem',
          color: '#64748b',
          lineHeight: 1.45
        }}>
          <strong>Note: </strong>
          FAERS reports are voluntary submissions and do not establish causality.
        </div>

      </div>
    </div>
  );
}
