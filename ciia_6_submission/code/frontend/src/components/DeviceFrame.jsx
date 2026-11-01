import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export default function DeviceFrame({ 
  children, 
  isDark = false, 
  title, 
  onScreenClick,
  scale = 1
}) {
  return (
    <div 
      className={`device-viewport ${isDark ? 'dark-device' : ''}`}
      onClick={onScreenClick}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        background: isDark ? '#05231a' : '#ffffff',
        border: '10px solid #1e293b'
      }}
    >
      {/* Dynamic Island */}
      <div className="device-dynamic-island">
        <div className="device-camera-lens" />
        <div className="device-sensor" />
      </div>

      {/* Status Bar */}
      <div className="device-status-bar" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
        <span>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Signal size={13} />
          <Wifi size={13} />
          <BatteryMedium size={16} />
        </div>
      </div>

      {/* Screen Viewport Content */}
      <div className="device-screen-content">
        {children}
      </div>

      {/* Bottom Home Indicator Bar */}
      <div className="device-home-indicator" />
    </div>
  );
}
