import React, { useState, useRef, useEffect } from 'react';
import { Leaf, Phone, ChevronDown, Sparkles, Calendar, Pill, Dna, Activity, FileText, Shield } from 'lucide-react';

export default function AppHeader({
  activeTab,
  setActiveTab,
  patientName = "Mrs. Kulkarni",
  selectedLang = "mr",
  setSelectedLang,
  isBackendHealthy = true,
  criticalAlertCount = 0,
  onEmergencyCall,
  roleSelector = null,
  onOpenAuditLedger
}) {
  const [isSuiteOpen, setIsSuiteOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSuiteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTab = (tabId) => {
    if (tabId === 'audit') {
      if (onOpenAuditLedger) onOpenAuditLedger();
    } else if (setActiveTab) {
      setActiveTab(tabId);
    }
    setIsSuiteOpen(false);
  };

  const primaryTabs = [
    { id: 'home', label: "Today's Pills" },
    { id: 'scanner', label: "Scan Bottle" },
    { id: 'caregiver', label: "Family Caregiver" },
    { id: 'copilot', label: "AI Copilot", icon: Sparkles }
  ];

  const suiteTabs = [
    { id: 'adherence', label: "Adherence Hub & Streak", icon: Calendar, desc: "30-day compliance heatmap" },
    { id: 'medications', label: "Medication Regimen", icon: Pill, desc: "Schedule manager & pill counter" },
    { id: 'molecular', label: "Molecular Safety (GNNs)", icon: Dna, desc: "hERG, Tox21, ClinTox & BBBP" },
    { id: 'fda', label: "FDA FAERS Signals", icon: Activity, desc: "Post-market surveillance & recalls" },
    { id: 'landing', label: "Clinical Architecture", icon: FileText, desc: "Interactive DDI showcase" },
    { id: 'audit', label: "21 CFR Part 11 Audit Ledger", icon: Shield, desc: "Tamper-evident hash chain" }
  ];

  const isSuiteActive = ['adherence', 'medications', 'schedule', 'molecular', 'fda', 'landing', 'audit'].includes(activeTab);

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--mg-card-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        
        {/* Left: SAFE CAP⁺ Brand Identity */}
        <div 
          onClick={() => handleSelectTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--mg-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(13, 56, 44, 0.25)'
          }}>
            <Leaf size={18} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--mg-text-main)',
            whiteSpace: 'nowrap'
          }}>
            SAFE CAP⁺
          </span>
        </div>

        {/* Center: Desktop Nav Tabs + Clinical Suite Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', gap: '12px' }}>
          
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  style={{
                    padding: '7px 13px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--mg-accent-soft)' : 'transparent',
                    color: isActive ? 'var(--mg-primary)' : 'var(--mg-text-muted)',
                    border: isActive ? '1px solid var(--mg-accent-border)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.16s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {Icon && <Icon size={14} />}
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Clinical Suite Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsSuiteOpen(!isSuiteOpen)}
                style={{
                  padding: '7px 13px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  fontWeight: isSuiteActive ? 700 : 500,
                  background: isSuiteActive ? 'var(--mg-accent-soft)' : 'transparent',
                  color: isSuiteActive ? 'var(--mg-primary)' : 'var(--mg-text-muted)',
                  border: isSuiteActive ? '1px solid var(--mg-accent-border)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Clinical Suite</span>
                <ChevronDown size={14} style={{ transform: isSuiteOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {isSuiteOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '280px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid var(--mg-card-border)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 200
                }}>
                  {suiteTabs.map((item) => {
                    const Icon = item.icon;
                    const isItemActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isItemActive ? 'var(--mg-accent-soft)' : 'transparent',
                          color: isItemActive ? 'var(--mg-primary)' : 'var(--mg-text-main)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.14s'
                        }}
                      >
                        <div style={{
                          marginTop: '2px',
                          color: isItemActive ? 'var(--mg-primary)' : '#64748b'
                        }}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {roleSelector}
        </div>

        {/* Right: Language Selector + Emergency + Patient Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          
          {/* Vernacular Language Selector */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: 'var(--radius-full)',
            gap: '2px'
          }}>
            {[
              { id: 'mr', full: 'मराठी', short: 'मरा' },
              { id: 'hi', full: 'हिंदी', short: 'हिं' },
              { id: 'en', full: 'English', short: 'EN' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLang && setSelectedLang(l.id)}
                style={{
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  background: selectedLang === l.id ? '#ffffff' : 'transparent',
                  color: selectedLang === l.id ? 'var(--mg-text-main)' : 'var(--mg-text-muted)',
                  boxShadow: selectedLang === l.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  lineHeight: 1.1
                }}
                title={l.full}
              >
                <span className="desktop-only">{l.full}</span>
                <span className="mobile-only">{l.short}</span>
              </button>
            ))}
          </div>

          {/* Emergency Quick-Call Button - Icon only on mobile, text on desktop */}
          <button
            onClick={onEmergencyCall}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#ffffff',
              background: 'var(--mg-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.16s ease',
              whiteSpace: 'nowrap'
            }}
            title="Call Caregiver Emergency"
            aria-label="Call Caregiver Emergency"
          >
            <Phone size={14} />
            <span className="desktop-only">Emergency</span>
          </button>

          {/* Patient Indicator - Full badge on desktop, pulse dot on mobile */}
          <div 
            onClick={() => handleSelectTab('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: '#f8faf8',
              border: '1px solid var(--mg-card-border)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer'
            }}
            title={`Active Patient: ${patientName}`}
          >
            <span 
              className={isBackendHealthy ? 'pulse-dot' : ''}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isBackendHealthy ? 'var(--mg-accent)' : '#f59e0b',
                flexShrink: 0
              }} 
            />
            <span 
              className="desktop-only" 
              style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--mg-text-main)', whiteSpace: 'nowrap', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {patientName}
            </span>
          </div>

        </div>

      </div>
    </header>
  );
}