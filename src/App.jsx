import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import AnalysisResult from './components/AnalysisResult';
import Paywall from './components/Paywall';
import LegalCenter from './components/LegalCenter';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // NEW Home Screen
import History from './components/History';
import Share from './components/Share';
import DietaryProfile from './components/DietaryProfile';
import Leaderboard from './components/Leaderboard';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, scansLeft, decrementScans, setPremium } = useAuth();
  const [view, setView] = useState('login'); // Start with login
  const [capturedImage, setCapturedImage] = useState(null);
  const [userDiet, setUserDiet] = useState('none');
  const [isRoastMode, setIsRoastMode] = useState(false); // Global Roast Mode Toggle

  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      const storedAcceptance = localStorage.getItem('bro_legal_accepted');
      if (storedAcceptance === 'true') {
        if (scansLeft > 0) {
          setView('dashboard'); // Route to Dashboard instead of camera
        } else {
          setView('paywall');
        }
      } else {
        setView('legal'); // After login, check legal
      }

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
      setUserDiet('none');
      setIsRoastMode(false);
    }
  }, [user]);

  const handleLegalAccepted = () => {
    if (scansLeft > 0) {
      setView('camera');
    } else {
      setView('paywall');
    }
  };

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    // Remove artificial delay to show AnalysisResult and its loading spinner instantly
    setView('analysis');
  };

  const handleAnalysisComplete = () => {
    if (scansLeft > 0) {
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

      {view === 'legal' && <LegalCenter onClose={handleLegalAccepted} />}

      {view === 'dashboard' && (
        <Dashboard onStartScan={() => setView('camera')} />
      )}

      {view === 'camera' && (
        <CameraView
          onCapture={handleCapture}
          onHistory={() => setView('history')}
          onShare={() => setView('share')}
          onProfile={() => setView('profile')}
          onLeaderboard={() => setView('leaderboard')}
          isRoastMode={isRoastMode}
          setIsRoastMode={setIsRoastMode}
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
          userDiet={userDiet}
          isRoastMode={isRoastMode}
        />
      )}

      {view === 'paywall' && (
        <Paywall onSuccess={handlePaymentSuccess} onClose={() => setView('camera')} />
      )}

      {view === 'profile' && (
        <DietaryProfile onClose={() => setView('camera')} />
      )}

      {view === 'leaderboard' && (
        <Leaderboard onClose={() => setView('camera')} />
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
