import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';

export default function ScreenSplash({ onGetStarted, onSignIn }) {
  return (
    <div style={{
      flex: 1,
      background: 'linear-gradient(180deg, #05231a 0%, #0a3528 50%, #0e4433 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 24px 36px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background soft botanical illumination */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '320px',
        height: '320px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.22) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Top Branding Area */}
      <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 2 }}>
        {/* Leaf Emblem */}
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.5)'
          }}>
            <Leaf size={26} color="#05231a" />
          </div>
        </div>

        <h1 className="font-serif" style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          MedGuard AI
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: '#cbd5e1',
          marginTop: '10px',
          lineHeight: 1.35,
          fontWeight: 400
        }}>
          Smarter Meds.<br />Safer Lives.
        </p>
      </div>

      {/* Botanical Organic Waves Illustration */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}>
        <svg viewBox="0 0 300 200" style={{ width: '100%', height: '100%', opacity: 0.65 }}>
          <path d="M0,120 C70,60 140,160 220,90 C260,50 280,110 300,100 L300,200 L0,200 Z" fill="rgba(34, 197, 94, 0.18)" />
          <path d="M0,140 C80,90 160,170 240,110 C270,90 290,120 300,120 L300,200 L0,200 Z" fill="rgba(22, 163, 74, 0.28)" />
          <path d="M0,160 C90,130 180,180 250,140 C280,120 295,145 300,140 L300,200 L0,200 Z" fill="rgba(5, 35, 26, 0.45)" />
        </svg>
      </div>

      {/* Bottom CTA Block */}
      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{
          fontSize: '0.95rem',
          color: '#e2e8f0',
          lineHeight: 1.45,
          margin: 0,
          fontWeight: 400
        }}>
          Personalized medication management for you and your loved ones.
        </p>

        <button
          onClick={onGetStarted}
          style={{
            width: '100%',
            height: '54px',
            borderRadius: '999px',
            background: '#ffffff',
            color: '#0a3528',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            border: 'none',
            marginTop: '8px'
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>

        <button
          onClick={onSignIn}
          style={{
            width: '100%',
            height: '40px',
            color: '#cbd5e1',
            fontWeight: 600,
            fontSize: '0.9rem',
            background: 'transparent',
            border: 'none'
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
