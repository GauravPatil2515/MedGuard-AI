import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, CheckCircle2, Clock, Volume2, Package, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import StatusBadge from './StatusBadge';

export default function MedicationCard({
  name,
  generic,
  dose,
  timing,
  frequency,
  purpose,
  isHighPriority = false,
  isTaken = false,
  onTake,
  onPlayAudio,
  bottleCount,
  totalPills,
  onSelect
}) {
  const [isHovered, setIsHovered] = useState(false);
  const remainingPills = bottleCount !== undefined && totalPills !== undefined ? bottleCount : null;
  const refillDays = remainingPills !== null && remainingPills > 0 ? Math.ceil(remainingPills / 1) : null;

  const handleTakeWithConfetti = (e) => {
    e.stopPropagation();
    // Fire celebratory confetti effect for adherence positive feedback
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#15803d', '#22c55e', '#86efac', '#f59e0b']
      });
    } catch {}
    if (onTake) onTake();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.995 }}
      className="mg-card"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: onSelect ? 'pointer' : 'default',
        borderLeft: isHighPriority ? '5px solid var(--mg-danger)' : '1px solid var(--mg-card-border)',
        background: isTaken 
          ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' 
          : 'linear-gradient(180deg, #ffffff 0%, #fafcfb 100%)',
        borderColor: isTaken ? 'rgba(34, 197, 94, 0.4)' : 'var(--mg-card-border)',
        boxShadow: isTaken ? '0 4px 18px rgba(34, 197, 94, 0.08)' : 'var(--shadow-card)'
      }}
    >
      {/* Main Medication Info Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <motion.div 
          animate={isTaken ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: isTaken ? 'var(--mg-accent-soft)' : '#f1f5f9',
            color: isTaken ? 'var(--mg-accent)' : '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: isTaken ? '0 2px 8px rgba(21, 128, 61, 0.2)' : 'none'
          }}
        >
          <Pill size={28} />
        </motion.div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--mg-text-main)', letterSpacing: '-0.02em' }}>
              {name}
            </span>
            {generic && (
              <span style={{ fontSize: '0.92rem', color: 'var(--mg-text-muted)', fontWeight: 500 }}>
                ({generic})
              </span>
            )}
            {isHighPriority && (
              <StatusBadge type="danger" label="Critical Medication" style={{ fontSize: '0.72rem', padding: '4px 10px', fontWeight: 700 }} />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--mg-primary)' }}>
              {dose}
            </span>
            <span style={{ color: 'var(--mg-text-dim)' }}>•</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--mg-text-body)' }}>
              <Clock size={15} style={{ color: 'var(--mg-text-muted)' }} />
              <span>{timing}</span>
            </span>
            {frequency && (
              <>
                <span style={{ color: 'var(--mg-text-dim)' }}>•</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--mg-text-muted)', fontWeight: 500 }}>{frequency}</span>
              </>
            )}
          </div>

          {purpose && (
            <div style={{ marginTop: '5px', fontSize: '0.86rem', color: 'var(--mg-text-muted)' }}>
              {purpose}
            </div>
          )}
        </div>
      </div>

      {/* Bottle Inventory Tracker Pill */}
      {remainingPills !== null && (
        <motion.div 
          initial={{ opacity: 0.9 }}
          whileHover={{ scale: 1.005 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: remainingPills <= 5 ? '#fef2f2' : '#f0fdf4',
            borderRadius: 'var(--radius-md)',
            border: remainingPills <= 5 ? '1px solid #fecaca' : '1px solid #bbf7d0'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: remainingPills <= 5 ? 'var(--mg-danger)' : 'var(--mg-accent)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Package size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: remainingPills <= 5 ? 'var(--mg-danger)' : 'var(--mg-accent)' }}>
              {remainingPills} of {totalPills} tablets left in bottle
            </div>
            {refillDays !== null && (
              <div style={{ fontSize: '0.8rem', color: 'var(--mg-text-muted)', marginTop: '2px' }}>
                {remainingPills <= 5 
                  ? `⚠️ Refill needed soon — only ${refillDays} day${refillDays !== 1 ? 's' : ''} left`
                  : `Next refill recommended in ~${refillDays} day${refillDays !== 1 ? 's' : ''}`}
              </div>
            )}
          </div>
          <div style={{ 
            fontSize: '0.74rem', 
            fontWeight: 700, 
            color: remainingPills <= 5 ? 'var(--mg-danger)' : 'var(--mg-primary)', 
            background: '#ffffff', 
            padding: '5px 12px', 
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            🔒 Child-Resistant Lock
          </div>
        </motion.div>
      )}

      {/* Action Buttons Row with Tactile Micro-Interactions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '2px' }}>
        {/* Vernacular Audio TTS Button */}
        {onPlayAudio && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onPlayAudio(); }}
            className="btn-secondary"
            style={{ 
              padding: '12px 20px', 
              fontSize: '0.92rem',
              minHeight: '52px',
              minWidth: '52px',
              flex: '0 1 auto'
            }}
            title="Listen in your language"
            aria-label="Listen in your language"
          >
            <Volume2 size={20} />
            <span>Listen Voice</span>
          </motion.button>
        )}

        {/* Big Touch-Friendly Action Button */}
        {isTaken ? (
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              color: 'var(--mg-accent)', 
              fontSize: '1.05rem', 
              fontWeight: 800,
              padding: '12px 24px',
              background: '#ecfdf5',
              borderRadius: 'var(--radius-full)',
              border: '2px solid #86efac',
              minHeight: '52px'
            }}
          >
            <CheckCircle2 size={24} style={{ color: 'var(--mg-accent)' }} />
            <span>Dose Logged as Taken</span>
            <Sparkles size={16} style={{ color: '#10b981' }} />
          </motion.div>
        ) : onTake ? (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleTakeWithConfetti}
            className="btn-primary"
            style={{ 
              padding: '14px 28px', 
              fontSize: '1.1rem', 
              fontWeight: 800,
              minHeight: '56px',
              flex: 1,
              background: 'linear-gradient(135deg, #0d382c 0%, #15803d 100%)',
              boxShadow: '0 6px 20px rgba(21, 128, 61, 0.35)',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '-0.01em'
            }}
            aria-label="Mark dose as taken now"
          >
            <CheckCircle2 size={24} />
            <span>I HAVE TAKEN THIS PILL NOW</span>
          </motion.button>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--mg-text-muted)', 
            fontSize: '0.95rem', 
            fontWeight: 600,
            padding: '12px 20px',
            background: '#f1f5f9',
            borderRadius: 'var(--radius-full)',
            minHeight: '52px'
          }}>
            <Clock size={20} />
            <span>Scheduled for Later</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}