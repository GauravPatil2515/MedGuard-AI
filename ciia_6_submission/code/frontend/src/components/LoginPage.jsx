/**
 * LoginPage - Authentication Page with Login/Signup Tabs
 * Connects to backend JWT authentication
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pill, Mail, Lock, User, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { login, register, error: authError, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    age: '',
    diagnosis: '',
    phone: '',
    role: 'PATIENT',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required');
      return false;
    }
    if (!isLogin) {
      if (!formData.fullName) {
        setLocalError('Full name is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 8) {
        setLocalError('Password must be at least 8 characters');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          age: parseInt(formData.age) || 65,
          diagnosis: formData.diagnosis || 'Not specified',
          phone: formData.phone || '',
          role: formData.role,
        });
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (e) {
      // Error handled by auth context
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setLocalError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      age: '',
      diagnosis: '',
      phone: '',
      role: 'PATIENT',
    });
  };

  const displayError = authError || localError;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'linear-gradient(180deg, #f8faf8 0%, #e8f5e9 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(13, 56, 44, 0.12)',
        padding: '32px',
        border: '1px solid rgba(13, 56, 44, 0.08)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'var(--mg-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(13, 56, 44, 0.25)',
          }}>
            <Pill size={32} />
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 800, color: 'var(--mg-text-main)' }}>
            SAFE CAP⁺
          </h1>
          <p style={{ margin: 0, color: 'var(--mg-text-muted)', fontSize: '0.95rem' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Error Display */}
        {displayError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', marginBottom: '20px',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '12px', color: '#991b1b', fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} flexShrink={0} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Mode Tabs */}
        <div style={{
          display: 'flex', background: '#f1f5f9',
          borderRadius: '12px', padding: '4px', marginBottom: '24px'
        }}>
          <button
            onClick={switchMode}
            style={{
              flex: 1, padding: '12px', borderRadius: '8px',
              fontSize: '0.9rem', fontWeight: 600,
              background: isLogin ? '#ffffff' : 'transparent',
              color: isLogin ? 'var(--mg-primary)' : 'var(--mg-text-muted)',
              boxShadow: isLogin ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Login
          </button>
          <button
            onClick={switchMode}
            style={{
              flex: 1, padding: '12px', borderRadius: '8px',
              fontSize: '0.9rem', fontWeight: 600,
              background: !isLogin ? '#ffffff' : 'transparent',
              color: !isLogin ? 'var(--mg-primary)' : 'var(--mg-text-muted)',
              boxShadow: !isLogin ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: '12px', border: '2px solid var(--mg-card-border)',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="65"
                  min="1" max="120"
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: '12px', border: '2px solid var(--mg-card-border)',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
                  Diagnosis / Condition
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  placeholder="e.g., Hypertension, Diabetes"
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: '12px', border: '2px solid var(--mg-card-border)',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98xxx xxxxx"
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: '12px', border: '2px solid var(--mg-card-border)',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
                  Register As
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: '12px', border: '2px solid var(--mg-card-border)',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box', background: '#ffffff',
                  }}
                >
                  <option value="PATIENT">👤 Patient</option>
                  <option value="CAREGIVER">👨‍👩‍👧 Caregiver</option>
                </select>
              </div>
            </>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mg-text-muted)' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '14px 16px 14px 48px',
                  borderRadius: '12px', border: '2px solid var(--mg-card-border)',
                  fontSize: '1rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mg-text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isLogin ? 'Enter password' : 'Min 8 characters'}
                style={{
                  width: '100%', padding: '14px 48px 14px 48px',
                  borderRadius: '12px', border: '2px solid var(--mg-card-border)',
                  fontSize: '1rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--mg-text-muted)', padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mg-text-main)' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mg-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: '12px', border: '2px solid var(--mg-card-border)',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 700,
              borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'var(--mg-primary-light)' : 'var(--mg-primary)',
              color: '#ffffff',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(13, 56, 44, 0.3)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            {loading ? (
              <>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <CheckCircle2 size={20} />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Access */}
        <div style={{
          marginTop: '24px', padding: '16px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '12px', textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--mg-primary)' }}>
            ⚡ Quick Demo Access
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setFormData(prev => ({ ...prev, email: 'demo@medguard.ai', password: 'MedGuard2026!' }));
                try {
                  await login('demo@medguard.ai', 'MedGuard2026!');
                  if (onLoginSuccess) onLoginSuccess();
                } catch (e) {
                  setLocalError(e.message);
                }
              }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: '#ffffff', border: '1px solid #86efac',
                color: 'var(--mg-primary)', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              👤 Sign in as Mrs. Sumitra Kulkarni (Patient)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setFormData(prev => ({ ...prev, email: 'admin@medguard.ai', password: 'MedGuard2026!' }));
                try {
                  await login('admin@medguard.ai', 'MedGuard2026!');
                  if (onLoginSuccess) onLoginSuccess();
                } catch (e) {
                  setLocalError(e.message);
                }
              }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: '#ffffff', border: '1px solid #93c5fd',
                color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              🛡️ Sign in as Clinical Pharmacist (Admin)
            </button>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}