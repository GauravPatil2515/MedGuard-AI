import React from 'react';
import { Home, Pill, QrCode, Shield, Bot } from 'lucide-react';

export default function MobileNavBar({ activeTab, onSelectTab }) {
  return (
    <nav className="mobile-nav-dock mobile-only">
      <button 
        onClick={() => onSelectTab('dashboard')}
        className={`mobile-dock-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
      >
        <Home size={20} color={activeTab === 'dashboard' ? '#0b382c' : '#94a3b8'} />
        <span>Home</span>
      </button>

      <button 
        onClick={() => onSelectTab('medications')}
        className={`mobile-dock-btn ${activeTab === 'medications' ? 'active' : ''}`}
      >
        <Pill size={20} color={activeTab === 'medications' ? '#0b382c' : '#94a3b8'} />
        <span>Medications</span>
      </button>

      {/* Center Elevated Scanner FAB */}
      <button 
        onClick={() => onSelectTab('scanner')}
        className="mobile-dock-scanner-fab"
        title="Scan Prescription"
      >
        <QrCode size={22} color="#ffffff" />
      </button>

      <button 
        onClick={() => onSelectTab('safety')}
        className={`mobile-dock-btn ${activeTab === 'safety' ? 'active' : ''}`}
      >
        <Shield size={20} color={activeTab === 'safety' ? '#0b382c' : '#94a3b8'} />
        <span>Safety</span>
      </button>

      <button 
        onClick={() => onSelectTab('copilot')}
        className={`mobile-dock-btn ${activeTab === 'copilot' ? 'active' : ''}`}
      >
        <Bot size={20} color={activeTab === 'copilot' ? '#0b382c' : '#94a3b8'} />
        <span>Assistant</span>
      </button>
    </nav>
  );
}
