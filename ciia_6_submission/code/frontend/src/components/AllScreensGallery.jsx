import React from 'react';
import DeviceFrame from './DeviceFrame';
import ScreenSplash from './screens/ScreenSplash';
import ScreenOnboarding from './screens/ScreenOnboarding';
import ScreenPatientHome from './screens/ScreenPatientHome';
import ScreenScanner from './screens/ScreenScanner';
import ScreenScanResults from './screens/ScreenScanResults';
import ScreenMedicationDetail from './screens/ScreenMedicationDetail';
import ScreenSafetyInteractions from './screens/ScreenSafetyInteractions';
import ScreenMolecularSafety from './screens/ScreenMolecularSafety';
import ScreenAdherenceSchedule from './screens/ScreenAdherenceSchedule';
import ScreenCaregiverDashboard from './screens/ScreenCaregiverDashboard';
import ScreenClinicalCopilot from './screens/ScreenClinicalCopilot';
import ScreenFdaSignals from './screens/ScreenFdaSignals';

export default function AllScreensGallery({ onSelectScreen, onTakeDose, patientData, API_BASE }) {
  const screens = [
    {
      id: 'splash',
      num: '1',
      title: 'Splash & Onboarding',
      isDark: true,
      component: <ScreenSplash onGetStarted={() => onSelectScreen('onboarding')} onSignIn={() => onSelectScreen('patient_home')} />
    },
    {
      id: 'onboarding',
      num: '2',
      title: 'Onboarding',
      isDark: false,
      component: <ScreenOnboarding onNext={() => onSelectScreen('patient_home')} onSkip={() => onSelectScreen('patient_home')} />
    },
    {
      id: 'patient_home',
      num: '3',
      title: 'Patient Dashboard',
      isDark: false,
      component: (
        <ScreenPatientHome 
          patientName={patientData?.patient_name || "Mrs. Sumitra Kulkarni"}
          patientAge={patientData?.age || 68}
          diagnosis={patientData?.diagnosis || "Post-CABG • Atrial Fibrillation"}
          onNavigate={(tab) => onSelectScreen(tab)}
          onTakeDose={onTakeDose}
        />
      )
    },
    {
      id: 'scanner',
      num: '4',
      title: 'Prescription Scanning',
      isDark: false,
      component: <ScreenScanner onBack={() => onSelectScreen('patient_home')} onCompleteScan={() => onSelectScreen('scan_results')} API_BASE={API_BASE} />
    },
    {
      id: 'scan_results',
      num: '5',
      title: 'Scan Results',
      isDark: false,
      component: <ScreenScanResults onBack={() => onSelectScreen('scanner')} onAddToMedications={() => onSelectScreen('medication_detail')} onSelectMed={() => onSelectScreen('medication_detail')} />
    },
    {
      id: 'medication_detail',
      num: '6',
      title: 'Medication Detail',
      isDark: false,
      component: <ScreenMedicationDetail onBack={() => onSelectScreen('patient_home')} onDoseLogged={() => onSelectScreen('adherence')} API_BASE={API_BASE} />
    },
    {
      id: 'safety',
      num: '7',
      title: 'Safety & Interactions',
      isDark: false,
      component: <ScreenSafetyInteractions onBack={() => onSelectScreen('patient_home')} onNavigateTab={(tab) => onSelectScreen(tab)} API_BASE={API_BASE} />
    },
    {
      id: 'molecular',
      num: '8',
      title: 'Molecular Analysis',
      isDark: false,
      component: <ScreenMolecularSafety onBack={() => onSelectScreen('safety')} onNavigateTab={(tab) => onSelectScreen(tab)} />
    },
    {
      id: 'adherence',
      num: '9',
      title: 'Adherence & Schedule',
      isDark: false,
      component: <ScreenAdherenceSchedule onBack={() => onSelectScreen('patient_home')} onNavigateMed={() => onSelectScreen('medication_detail')} />
    },
    {
      id: 'caregiver',
      num: '10',
      title: 'Caregiver Dashboard',
      isDark: false,
      component: <ScreenCaregiverDashboard onBack={() => onSelectScreen('patient_home')} onNavigateTab={(tab) => onSelectScreen(tab)} />
    },
    {
      id: 'copilot',
      num: '11',
      title: 'Clinical Copilot',
      isDark: false,
      component: <ScreenClinicalCopilot onBack={() => onSelectScreen('patient_home')} onNavigateTab={(tab) => onSelectScreen(tab)} API_BASE={API_BASE} />
    },
    {
      id: 'fda_signals',
      num: '12',
      title: 'FDA Signals',
      isDark: false,
      component: <ScreenFdaSignals onBack={() => onSelectScreen('patient_home')} />
    }
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '20px 10px 40px 10px' }}>
      
      {/* Gallery Header Info Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '28px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px',
        maxWidth: '800px',
        margin: '0 auto 32px auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0b382c', margin: '0 0 4px 0' }}>
          MedGuard AI — Full 12-Screen Experience
        </h3>
        <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
          Interactive multi-screen view matching your UI/UX reference design. Click any screen label or device to inspect and interact in single screen mode.
        </p>
      </div>

      {/* Grid of 12 Phones (Responsive 6 columns or flex scroll) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(390px, 1fr))',
        gap: '40px 24px',
        justifyItems: 'center',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {screens.map((scr) => (
          <div 
            key={scr.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {/* The iPhone Device Frame */}
            <div 
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 20px 40px -10px rgba(11, 56, 44, 0.15)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <DeviceFrame isDark={scr.isDark}>
                {scr.component}
              </DeviceFrame>
            </div>

            {/* Screen Caption Matching Reference Image */}
            <button
              onClick={() => onSelectScreen(scr.id)}
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#334155',
                padding: '6px 14px',
                borderRadius: '999px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                cursor: 'pointer'
              }}
            >
              {scr.num}. {scr.title}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
