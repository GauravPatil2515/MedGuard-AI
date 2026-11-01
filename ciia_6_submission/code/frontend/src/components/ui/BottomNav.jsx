import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, QrCode, Users, Sparkles, Grid, X, Calendar, Dna, Activity, FileText, Shield } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, onOpenAuditLedger }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainItems = [
    { id: 'home', label: "Pills", icon: Pill },
    { id: 'copilot', label: 'Copilot', icon: Sparkles },
    { id: 'scanner', label: 'Scan', icon: QrCode, isCenter: true },
    { id: 'caregiver', label: 'Family', icon: Users },
    { id: 'more', label: 'More', icon: Grid, isMore: true }
  ];

  const moreItems = [
    { id: 'adherence', label: "Adherence Calendar", icon: Calendar, desc: "30-day compliance heatmap" },
    { id: 'medications', label: "Medication Regimen", icon: Pill, desc: "Schedule manager & pill counter" },
    { id: 'molecular', label: "Molecular Safety GNN", icon: Dna, desc: "hERG, Tox21 & ClinTox" },
    { id: 'fda', label: "FDA FAERS Recalls", icon: Activity, desc: "Post-market surveillance signals" },
    { id: 'landing', label: "Clinical Overview", icon: FileText, desc: "Interactive DDI showcase" },
    { id: 'audit', label: "21 CFR Part 11 Ledger", icon: Shield, desc: "Tamper-evident audit trail" }
  ];

  const handleItemClick = (item) => {
    if (item.isMore) {
      setIsMoreOpen(!isMoreOpen);
      return;
    }
    setIsMoreOpen(false);
    if (item.id === 'audit') {
      if (onOpenAuditLedger) onOpenAuditLedger();
    } else if (onSelectTab) {
      onSelectTab(item.id);
    }
  };

  const handleMoreItemClick = (item) => {
    setIsMoreOpen(false);
    if (item.id === 'audit') {
      if (onOpenAuditLedger) onOpenAuditLedger();
    } else if (onSelectTab) {
      onSelectTab(item.id);
    }
  };

  return (
    <>
      {/* Slide-up "More" Drawer for Mobile */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(3px)',
                zIndex: 998
              }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                bottom: '76px',
                left: 0,
                right: 0,
                background: '#ffffff',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
                padding: '20px 20px 16px 20px',
                zIndex: 999,
                maxHeight: '75vh',
                overflowY: 'auto'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--mg-text-main)' }}>
                  Clinical Suite & Modules
                </div>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px'
              }}>
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isCurActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMoreItemClick(item)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '14px',
                        background: isCurActive ? 'var(--mg-accent-soft)' : '#f8fafc',
                        border: isCurActive ? '1px solid var(--mg-accent-border)' : '1px solid #e2e8f0',
                        color: isCurActive ? 'var(--mg-primary)' : 'var(--mg-text-main)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '6px',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={18} color={isCurActive ? 'var(--mg-primary)' : '#475569'} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fixed Mobile Bottom Dock */}
      <nav 
        className="mobile-bottom-dock mobile-only" 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '74px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(230, 234, 230, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px env(safe-area-inset-bottom, 8px) 10px',
          zIndex: 999,
          boxShadow: '0 -4px 20px rgba(13, 56, 44, 0.06)'
        }}
      >
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.isMore && isMoreOpen);

          if (item.isCenter) {
            return (
              <div key={item.id} style={{
                flex: 1, display: 'flex', justifyContent: 'center',
                position: 'relative', zIndex: 10
              }}>
                <motion.button
                  whileHover={{ scale: 1.08, y: -20 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  onClick={() => handleItemClick(item)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d382c 0%, #15803d 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 22px rgba(21, 128, 61, 0.42)',
                    transform: 'translateY(-18px)',
                    border: '3px solid #ffffff',
                    cursor: 'pointer'
                  }}
                  title="Scan Bottle"
                  aria-label="Scan Bottle"
                >
                  <Icon size={24} />
                </motion.button>
              </div>
            );
          }

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleItemClick(item)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.72rem',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? 'var(--mg-primary)' : 'var(--mg-text-muted)',
                padding: '6px 4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                height: '100%',
                justifyContent: 'center',
                position: 'relative'
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeBottomTabDot"
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--mg-primary)',
                    marginTop: '2px'
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </>
  );
}