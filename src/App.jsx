import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import AnalysisResult from './components/AnalysisResult';
import Paywall from './components/Paywall';
import LegalCenter from './components/LegalCenter';
import Login from './components/Login';
import History from './components/History';
import Share from './components/Share';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, scansLeft, decrementScans, setPremium } = useAuth();
  const [view, setView] = useState('login'); // Start with login
  const [capturedImage, setCapturedImage] = useState(null);

  // Effect to separate Login vs Legal flow
  useEffect(() => {
    if (user) {
      setView('legal'); // After login, check legal
    } else {
      setView('login');
    }
  }, [user]);

  const handleLegalAccepted = () => {
    setView('camera');
  };

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    // Mimic processing delay then show analysis
    setTimeout(() => {
      setView('analysis');
    }, 500);
  };

  const handleAnalysisComplete = () => {
    if (scansLeft > 0) {
      decrementScans(); // Sync with Firebase
      setView('camera');
    } else {
      setView('paywall');
    }
  };

  const handlePaymentSuccess = () => {
    setPremium(); // Sync with Firebase
    setView('camera');
  };

  return (
    <div className="app-container">
      {view === 'login' && <Login />}

      {view === 'legal' && <LegalCenter onAccept={handleLegalAccepted} />}

      {view === 'camera' && (
        <CameraView
          onCapture={handleCapture}
          onHistory={() => setView('history')}
          onShare={() => setView('share')}
        />
      )}

      {view === 'history' && (
        <History onClose={() => setView('camera')} />
      )}

      {view === 'share' && (
        <Share onClose={() => setView('camera')} />
      )}

      {view === 'analysis' && (
        <AnalysisResult
          image={capturedImage}
          onClose={handleAnalysisComplete}
        />
      )}

      {view === 'paywall' && (
        <Paywall onSuccess={handlePaymentSuccess} onClose={() => setView('camera')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
