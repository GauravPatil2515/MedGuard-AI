import React, { useState } from 'react';
import { 
  CheckCircle2, AlertOctagon, TrendingUp, BarChart3, 
  Search, ShieldCheck, ExternalLink 
} from 'lucide-react';

export default function FdaSignalsView({ API_BASE = "http://localhost:5000/api" }) {
  const [activeTab, setActiveTab] = useState('adverse');
  const [selectedDrug, setSelectedDrug] = useState('Metformin');

  const monthlyReports = [
    { month: 'Jan', val: 35 },
    { month: 'Feb', val: 42 },
    { month: 'Mar', val: 68 },
    { month: 'Apr', val: 55 },
    { month: 'May', val: 78 },
    { month: 'Jun', val: 92 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Title */}
      <div>
        <h1 className="font-serif" style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>
          FDA FAERS & Real-World Post-Market Surveillance
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748b' }}>
          OpenFDA cross-referencing for spontaneous Adverse Event Reporting System (FAERS) signals and national drug recalls.
        </p>
      </div>

      {/* Grid: Drug Status on Left, FAERS Bar Chart on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Left: Drug Recall Status Card */}
        <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="font-serif" style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>
                {selectedDrug}
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Active Regimen Molecule • Batch #KJ230
              </div>
            </div>

            <div className="pill-badge pill-badge-green">
              <CheckCircle2 size={14} />
              <span>No Active Recalls</span>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Commonly Reported Clinical Events (FAERS):
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#334155' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
                <span>Gastrointestinal discomfort / nausea (frequent, transient)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: '#334155' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <span>Metformin-associated lactic acidosis (MALA) (rare, severe in renal impairment)</span>
              </div>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid #e2e8f0',
            fontSize: '0.76rem',
            color: '#64748b',
            lineHeight: 1.45
          }}>
            <strong>Regulatory Disclaimer: </strong>
            FAERS reports are voluntary submissions by healthcare practitioners and patients. The presence of a report does not establish a definitive causal relationship between the pharmaceutical agent and the adverse outcome.
          </div>

        </div>

        {/* Right: FAERS Monthly Report Trend Chart */}
        <div className="mg-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="font-serif" style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                Recent Adverse Event Reports (FAERS)
              </h3>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Surveillance signals across Jan — Jun 2026
              </span>
            </div>

            <span className="pill-badge pill-badge-blue">
              Monthly Volume
            </span>
          </div>

          {/* Bar Chart Container */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e8ede8',
            borderRadius: '16px',
            padding: '24px',
            height: '220px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '16px'
          }}>
            {/* Y axis numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', fontSize: '0.7rem', color: '#94a3b8', paddingRight: '6px' }}>
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            {/* Bars */}
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-end',
              height: '100%',
              borderBottom: '1.5px solid #cbd5e1',
              paddingBottom: '4px'
            }}>
              {monthlyReports.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: `${(item.val / 100) * 160}px`,
                      background: 'linear-gradient(180deg, #34d399 0%, #15803d 100%)',
                      borderRadius: '8px 8px 0 0',
                      boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 700 }}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
