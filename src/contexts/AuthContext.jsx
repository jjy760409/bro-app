import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scansLeft, setScansLeft] = useState(3);
    const [streak, setStreak] = useState(0);
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        // Check if Firebase is configured
        try {
            if (!auth || !auth.app.options.apiKey || auth.app.options.apiKey === "YOUR_FIREBASE_API_KEY") {
                console.warn("Firebase not configured. Using Demo Mode.");
                setIsDemoMode(true);
                setLoading(false);
                return;
            }

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                setUser(currentUser);
                setLoading(false); // Unblock rendering immediately

                if (currentUser) {
                    // Sync with Firestore asynchronously
                    const userRef = doc(db, "users", currentUser.uid);
                    try {
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const data = userSnap.data();
                            setScansLeft(data.scansLeft);

                            // Streak Logic
                            const today = new Date().toDateString();
                            const lastVisit = data.lastVisit || new Date(0).toDateString();

                            if (today !== lastVisit) {
                                const yesterday = new Date();
                                yesterday.setDate(yesterday.getDate() - 1);

                                let newStreak = data.streak || 0;
                                if (yesterday.toDateString() === lastVisit) {
                                    newStreak += 1;
                                } else {
                                    newStreak = 1; // Broken streak
                                }

                                await updateDoc(userRef, {
                                    lastVisit: today,
                                    streak: newStreak
                                });
                                setStreak(newStreak);
                            } else {
                                setStreak(data.streak || 1);
                            }
                        } else {
                            // New User
                            await setDoc(userRef, {
                                email: currentUser.email,
                                scansLeft: 3,
                                isPremium: false,
                                createdAt: new Date(),
                                streak: 1,
                                lastVisit: new Date().toDateString()
                            });
                            setScansLeft(3);
                            setStreak(1);
                        }
                    } catch (e) {
                        console.error("Firestore Error:", e);
                        // Fallback if Firestore fails (e.g. permission rules)
                        setScansLeft(3);
                    }
                }
            });
            return unsubscribe;
        } catch (err) {
            console.error("Auth Init Error:", err);
            setIsDemoMode(true);
            setLoading(false);
        }
    }, []);

    const login = async () => {
        if (isDemoMode) {
            // Mock Login
            const mockUser = { uid: "demo-user", email: "demo@broapp.com", displayName: "Demo Bro" };
            setUser(mockUser);
            setScansLeft(3); // Reset local scans for demo
            alert("Running in DEMO MODE. No real authentication used.");
            return;
        }

        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed: " + error.message + "\n\n(Tip: Check console for full error. If you haven't set up Firebase, this is expected!)");
            // Optional: Ask if they want to switch to demo mode?
        }
    };

    const logout = async () => {
        if (isDemoMode) {
            setUser(null);
            return;
        }
        await signOut(auth);
    };

    const decrementScans = async () => {
        setScansLeft(prev => prev - 1); // Optimistic update

        if (isDemoMode || !user) return;

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                scansLeft: increment(-1)
            });
        } catch (e) {
            console.error("Failed to sync scans:", e);
        }
    };

    const setPremium = async (subscriptionId = 'demo-sub') => {
        setScansLeft(999999);

        if (isDemoMode || !user) return;

        try {
            const userRef = doc(db, "users", user.uid);
            // Set expiry to 30 days from now
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            await updateDoc(userRef, {
                isPremium: true,
                scansLeft: 999999,
                subscriptionStatus: 'active',
                subscriptionId: subscriptionId,
                currentPeriodEnd: expiryDate
            });
        } catch (e) {
            console.error("Failed to set premium:", e);
        }
    };

    const cancelSubscription = async () => {
        if (isDemoMode) {
            alert("Demo subscription cancelled. Access remains until end of period.");
            return;
        }
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                subscriptionStatus: 'cancelled'
            });
        } catch (e) {
            console.error("Cancellation failed:", e);
            throw e;
        }
    };

    const requestRefund = async () => {
        if (isDemoMode) {
            alert("Demo refund processed. Premier status revoked.");
            setScansLeft(0);
            return;
        }
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            // Simulate automated refund check (within 7 days)
            await updateDoc(userRef, {
                subscriptionStatus: 'refunded',
                isPremium: false,
                scansLeft: 0
            });
            setScansLeft(0);
        } catch (e) {
            console.error("Refund failed:", e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, scansLeft, streak, decrementScans, setPremium, cancelSubscription, requestRefund, loading, isDemoMode }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
