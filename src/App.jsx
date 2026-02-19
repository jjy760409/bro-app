import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import AnalysisResult from './components/AnalysisResult';
import Paywall from './components/Paywall';
import LegalCenter from './components/LegalCenter';
import Login from './components/Login';
import History from './components/History';
import Share from './components/Share';
import DietaryProfile from './components/DietaryProfile';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, scansLeft, decrementScans, setPremium } = useAuth();
  const [view, setView] = useState('login'); // Start with login
  const [capturedImage, setCapturedImage] = useState(null);
  const [userDiet, setUserDiet] = useState('none'); // Store user diet preference

  // Import Firestore to fetch diet
  // The instruction implies dynamic import within useEffect, so no top-level import for db here.
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Effect to separate Login vs Legal flow & Fetch Profile
  useEffect(() => {
    if (user) {
      setView('legal'); // After login, check legal

      // Fetch user profile for diet
      setLoadingProfile(true);
      import('./services/firebase').then(async ({ db }) => {
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserDiet(snap.data().diet || 'none');
        }
        setLoadingProfile(false);
      }).catch(error => {
        console.error("Error fetching user diet:", error);
        setLoadingProfile(false);
      });
    } else {
      setView('login');
      setUserDiet('none'); // Reset diet when logged out
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
          onProfile={() => setView('profile')}
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
          userDiet={userDiet} // Pass the diet preference
        />
      )}

      {view === 'paywall' && (
        <Paywall onSuccess={handlePaymentSuccess} onClose={() => setView('camera')} />
      )}

      {view === 'profile' && (
        <DietaryProfile onClose={() => setView('camera')} />
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
