import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/index.css';

const Paywall = ({ onSuccess, onClose }) => {
    const { t } = useLanguage();
    const { user, setPremium, cancelSubscription, requestRefund } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, active, none
    const [subDetails, setSubDetails] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            if (user) {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.isPremium) {
                        setStatus('active');
                        setSubDetails(data);
                    } else {
                        setStatus('none');
                    }
                }
            } else {
                setStatus('none');
            }
        };
        checkStatus();
    }, [user]);

    const initialOptions = {
        "client-id": "test",
        currency: "USD",
        intent: "subscription",
        vault: true,
    };

    const handleCancel = async () => {
        if (confirm("Are you sure? You will lose access at the end of this billing period.")) {
            await cancelSubscription();
            alert("Subscription cancelled. No further charges will be made.");
            onClose();
        }
    };

    const handleRefund = async () => {
        if (confirm("Refunds are only available within 7 days of purchase. Proceed?")) {
            await requestRefund();
            alert("Refund processed successfully. Access revoked.");
            setStatus('none');
            onClose();
        }
    };

    if (status === 'active') { // Show Manage Subscription View
        return (
            <div className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '30px' }}>
                <ShieldCheck size={64} color="var(--bro-green)" style={{ marginBottom: '20px' }} />
                <h1 style={{ color: 'white', marginBottom: '10px' }}>Premium Active</h1>
                <p style={{ color: '#ccc', marginBottom: '30px' }}>You are a Pro member.</p>

                <div className="glass-panel" style={{ width: '100%', padding: '20px', marginBottom: '20px' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Status</p>
                    <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {subDetails?.subscriptionStatus?.toUpperCase() || 'ACTIVE'}
                    </p>
                    {subDetails?.currentPeriodEnd && (
                        <>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '10px' }}>Renews / Expires</p>
                            <p style={{ color: 'white' }}>{subDetails.currentPeriodEnd.toDate().toDateString()}</p>
                        </>
                    )}
                </div>

                <button onClick={handleCancel} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '10px' }}>
                    Cancel Subscription
                </button>

                <button onClick={handleRefund} style={{ background: 'transparent', border: 'none', color: '#888', textDecoration: 'underline', fontSize: '0.9rem' }}>
                    Request Refund
                </button>

                <button onClick={onClose} style={{ marginTop: '30px', background: 'transparent', border: 'none', color: 'white' }}>
                    Close
                </button>
            </div>
        );
    }

    // Default Paywall View
    return (
        <div className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '30px', overflowY: 'auto' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--bro-green)', marginBottom: '10px' }}>{t('paywallTitle')}</h1>
            <p style={{ color: '#888', marginBottom: '30px', textAlign: 'center' }}>{t('paywallDesc')}</p>

            <div className="glass-panel" style={{ padding: '20px', width: '100%', marginBottom: '30px' }}>
                <Benefit text={t('benefit1')} />
                <Benefit text={t('benefit2')} />
                <Benefit text={t('benefit3')} />
                <Benefit text={t('benefit4')} />
            </div>

            <div style={{ width: '100%', zIndex: 100 }}>
                <PayPalScriptProvider options={initialOptions}>
                    <PayPalButtons
                        style={{ layout: "vertical", color: "blue", shape: "pill", label: "subscribe" }}
                        createSubscription={(data, actions) => {
                            return actions.subscription.create({
                                'plan_id': 'P-MOCK_PLAN_ID'
                            });
                        }}
                        onApprove={(data, actions) => {
                            // alert(t('subscribeSuccess') + data.subscriptionID);
                            setPremium(data.subscriptionID);
                            onSuccess();
                        }}
                    />
                </PayPalScriptProvider>
            </div>

            <div style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#666', fontSize: '0.8rem', marginBottom: '10px' }}>
                    <AlertCircle size={16} />
                    <span>Automated Cancellation & Refund Available</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: '1.4' }}>
                    By subscribing, you agree to our Terms. You can cancel anytime in the app settings.
                    Refunds are automatically processed if requested within 7 days.
                </p>
            </div>

            {onClose && (
                <button onClick={onClose} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#666' }}>
                    Maybe Later
                </button>
            )}
        </div>
    );
};

const Benefit = ({ text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ background: 'rgba(0,255,136,0.2)', padding: '5px', borderRadius: '50%' }}>
            <Check size={16} color="var(--bro-green)" />
        </div>
        <span>{text}</span>
    </div>
);

export default Paywall;
