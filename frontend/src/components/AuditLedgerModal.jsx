import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, RefreshCw, Key, FileCode } from 'lucide-react';

export default function AuditLedgerModal({ isOpen, onClose, API_BASE = "http://localhost:5000/api" }) {
  const [trail, setTrail] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAuditData();
    }
  }, [isOpen]);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const resTrail = await fetch(`${API_BASE}/audit/trail`);
      if (resTrail.ok) {
        const d = await resTrail.json();
        setTrail(d.records || []);
      }
      const resVerify = await fetch(`${API_BASE}/audit/verify`);
      if (resVerify.ok) {
        const v = await resVerify.json();
        setVerification(v);
      }
    } catch (e) {
      console.error("Audit load error", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 35, 26, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: '#07281f',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#14532d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={18} color="#4ade80" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                21 CFR Part 11 Cryptographic Audit Trail
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                SQLite WAL ledger with SHA-256 hash chaining & HMAC signature validation
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ color: '#94a3b8', padding: '6px', background: 'transparent' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div style={{
          padding: '14px 24px',
          background: verification?.verified ? '#f0fdf4' : '#fffbeb',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color={verification?.verified ? '#16a34a' : '#d97706'} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: verification?.verified ? '#14532d' : '#92400e' }}>
                {verification?.verified ? 'CRYPTOGRAPHIC INTEGRITY VERIFIED (NO TAMPERING)' : 'Verifying Ledger State...'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Verified records: {verification?.records_verified || 0} • Current chain root verified against Genesis Block
              </div>
            </div>
          </div>

          <button
            onClick={loadAuditData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#0b382c',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Re-verify</span>
          </button>
        </div>

        {/* Audit Log Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '8px 6px' }}>Seq #</th>
                <th style={{ padding: '8px 6px' }}>Timestamp</th>
                <th style={{ padding: '8px 6px' }}>Action</th>
                <th style={{ padding: '8px 6px' }}>User ID</th>
                <th style={{ padding: '8px 6px' }}>Molecule / Details</th>
                <th style={{ padding: '8px 6px' }}>SHA-256 Record Hash</th>
              </tr>
            </thead>
            <tbody>
              {trail.slice(0, 15).map((rec, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 700, color: '#0f172a' }}>{rec.sequence || rec.id}</td>
                  <td style={{ padding: '10px 6px', color: '#64748b', whiteSpace: 'nowrap' }}>{rec.timestamp}</td>
                  <td style={{ padding: '10px 6px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#eafaf1',
                      color: '#15803d',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      {rec.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px 6px', color: '#334155' }}>{rec.user_id}</td>
                  <td style={{ padding: '10px 6px', color: '#334155' }}>
                    <strong>{rec.molecule_name || '-'}</strong>
                  </td>
                  <td style={{ padding: '10px 6px', fontFamily: 'monospace', fontSize: '0.7rem', color: '#64748b' }}>
                    {rec.record_hash?.slice(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              background: '#0b382c',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
