import React from 'react';
import { motion } from 'framer-motion';
import { Pill, QrCode, Users } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab }) {
  const items = [
    { id: 'home', label: "Today's Pills", icon: Pill },
    { id: 'scanner', label: 'Scan Bottle', icon: QrCode, isCenter: true },
    { id: 'caregiver', label: 'Family Caregiver', icon: Users }
  ];

  return (
    <nav 
      className="mobile-bottom-dock mobile-only" 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '76px',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(230, 234, 230, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px env(safe-area-inset-bottom, 8px) 16px',
        zIndex: 999,
        boxShadow: '0 -4px 20px rgba(13, 56, 44, 0.06)'
      }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.isCenter) {
          return (
            <div key={item.id} style={{
              flex: 1, display: 'flex', justifyContent: 'center',
              position: 'relative', zIndex: 10
            }}>
              <motion.button
                whileHover={{ scale: 1.08, y: -22 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                onClick={() => onSelectTab(item.id)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0d382c 0%, #15803d 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 22px rgba(21, 128, 61, 0.42)',
                  transform: 'translateY(-20px)',
                  border: '4px solid #ffffff',
                  cursor: 'pointer'
                }}
                title="Scan Bottle"
                aria-label="Scan Bottle"
              >
                <Icon size={26} />
              </motion.button>
            </div>
          );
        }

        const sideWidth = 'calc(50% - 34px)';

        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelectTab(item.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.74rem',
              fontWeight: isActive ? 800 : 500,
              color: isActive ? 'var(--mg-primary)' : 'var(--mg-text-muted)',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              minWidth: '60px',
              maxWidth: sideWidth,
              height: '100%',
              justifyContent: 'center',
              position: 'relative'
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <Icon size={22} color={isActive ? 'var(--mg-primary)' : 'var(--mg-text-muted)'} />
            </motion.div>
            <span style={{ lineHeight: 1.1 }}>{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  width: '16px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'var(--mg-accent)'
                }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}