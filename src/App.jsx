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
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { user, scansLeft, decrementScans, setPremium } = useAuth();
  const [view, setView] = useState('login'); // Start with login
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanType, setScanType] = useState('ai');
  const [barcodeData, setBarcodeData] = useState(null);

  const [userDiet, setUserDiet] = useState('none');
  const [isRoastMode, setIsRoastMode] = useState(false); // Global Roast Mode Toggle

  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.isGuest) {
        setUserDiet('none');
        setView('dashboard'); // Guests skip legal and onboarding to get straight to action
        return;
      }
      setLoadingProfile(true);
      import('./services/firebase').then(async ({ db }) => {
        const { doc, getDoc, updateDoc } = await import('firebase/firestore');
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        let hasOnboarded = false;

        if (snap.exists()) {
          const data = snap.data();
          setUserDiet(data.diet || 'none');
          hasOnboarded = data.hasCompletedOnboarding === true;
        }

        const storedAcceptance = localStorage.getItem('bro_legal_accepted');

        if (!hasOnboarded) {
          // Brand new user needs to set language and diet
          setView('profile'); // We will use DietaryProfile as the Onboarding screen
        } else if (storedAcceptance !== 'true') {
          setView('legal');
        } else if (scansLeft > 0) {
          setView('dashboard');
        } else {
          setView('paywall');
        }

        setLoadingProfile(false);
      }).catch(error => {
        console.error("Error fetching user profile:", error);
        setLoadingProfile(false);
        setView('dashboard'); // Fallback
      });
    } else {
      setView('login');
      setUserDiet('none');
      setIsRoastMode(false);
    }
  }, [user]);

  const handleProfileComplete = async () => {
    // Mark onboarding complete in Firebase
    if (user) {
      import('./services/firebase').then(async ({ db }) => {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, "users", user.uid), { hasCompletedOnboarding: true });
      });
    }

    const storedAcceptance = localStorage.getItem('bro_legal_accepted');
    if (storedAcceptance === 'true') {
      if (scansLeft > 0) {
        setView('dashboard');
      } else {
        setView('paywall');
      }
    } else {
      setView('legal');
    }
  };

  const handleLegalAccepted = () => {
    if (scansLeft > 0) {
      setView('dashboard'); // Go to dashboard, not camera immediately
    } else {
      setView('paywall');
    }
  };

  const handleCapture = (imageSrc, type = 'ai', data = null) => {
    setCapturedImage(imageSrc);
    setScanType(type);
    setBarcodeData(data);
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
        <Dashboard
          onStartScan={() => setView('camera')}
          onLeaderboard={() => setView('leaderboard')}
        />
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
          scanType={scanType}
          barcodeData={barcodeData}
          onClose={handleAnalysisComplete}
          userDiet={userDiet}
          isRoastMode={isRoastMode}
        />
      )}

      {view === 'paywall' && (
        <Paywall onSuccess={handlePaymentSuccess} onClose={() => setView('camera')} />
      )}

      {view === 'profile' && (
        <DietaryProfile onClose={handleProfileComplete} />
      )}

      {view === 'leaderboard' && (
        <Leaderboard onClose={() => setView('camera')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
