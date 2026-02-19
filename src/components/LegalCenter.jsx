import React, { useState, useEffect } from 'react';
import { Share2, ArrowLeft, Shield, FileText, DollarSign, Lock } from 'lucide-react';
import '../styles/index.css';

const LegalCenter = ({ onClose, initialTab = 'terms' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [hasAccepted, setHasAccepted] = useState(false);

    useEffect(() => {
        const storedAcceptance = localStorage.getItem('bro_legal_accepted');
        if (storedAcceptance === 'true') {
            setHasAccepted(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('bro_legal_accepted', 'true');
        setHasAccepted(true);
        if (onClose) onClose();
    };

    const tabs = [
        { id: 'terms', label: 'Terms of Service', icon: <FileText size={18} /> },
        { id: 'privacy', label: 'Privacy Policy', icon: <Lock size={18} /> },
        { id: 'refund', label: 'Refund Policy', icon: <DollarSign size={18} /> },
    ];

    return (
        <div className="full-screen flex-center" style={{
            background: '#0a0a0a',
            zIndex: 9999,
            padding: '0',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                width: '100%',
                padding: '20px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(20, 20, 20, 0.95)'
            }}>
                {onClose && (
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                )}
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Legal Center</h2>
                <div style={{ width: '24px' }}></div>
            </div>

            {/* Tabs */}
            <div style={{ width: '100%', display: 'flex', borderBottom: '1px solid #333', background: '#111' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === tab.id ? '#1a1a1a' : 'transparent',
                            color: activeTab === tab.id ? 'var(--bro-green)' : '#888',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--bro-green)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal'
                        }}
                    >
                        {tab.icon}
                        <span className="mobile-hide">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                width: '100%',
                overflowY: 'auto',
                padding: '20px',
                color: '#ccc',
                lineHeight: '1.6',
                textAlign: 'left'
            }}>
                {activeTab === 'terms' && <TermsContent />}
                {activeTab === 'privacy' && <PrivacyContent />}
                {activeTab === 'refund' && <RefundContent />}
            </div>

            {/* Footer Action */}
            {!hasAccepted && (
                <div style={{ width: '100%', padding: '20px', background: '#111', borderTop: '1px solid #333' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px', textAlign: 'center' }}>
                        By continuing, you agree to our Terms, Privacy Policy, and Refund Policy.
                    </p>
                    <button className="btn-primary" onClick={handleAccept} style={{ width: '100%', justifyContent: 'center' }}>
                        I Agree & Continue
                    </button>
                </div>
            )}
        </div>
    );
};

const TermsContent = () => (
    <div>
        <h3 style={{ color: 'white' }}>Terms of Service</h3>
        <p><strong>Last Updated: 2026-02-19</strong></p>
        <p>Welcome to BroApp. By accessing or using our mobile application, you agree to be bound by these Terms of Service.</p>

        <h4>1. Use of Service</h4>
        <p>You must be at least 13 years old to use this App. You are responsible for any activity that occurs under your account.</p>

        <h4>2. Medical Disclaimer</h4>
        <p>BroApp is for informational purposes only. The AI-generated nutritional analysis and health tips are estimates and should NOT be considered medical advice. Always consult a physician before making significant dietary changes.</p>

        <h4>3. Intellectual Property</h4>
        <p>All content, features, and functionality are the exclusive property of BroApp Inc.</p>

        <h4>4. Termination</h4>
        <p>We reserve the right to terminate or suspend your account immediately, without prior notice, for any breach of these Terms.</p>
    </div>
);

const PrivacyContent = () => (
    <div>
        <h3 style={{ color: 'white' }}>Privacy Policy</h3>
        <p><strong>Your privacy is our priority.</strong></p>

        <h4>1. Data Collection</h4>
        <p>We collect minimal data necessary for the service:
            <ul>
                <li>Email address (for authentication)</li>
                <li>Usage data (scan counts)</li>
                <li>Uploaded images (processed temporarily for analysis)</li>
            </ul>
        </p>

        <h4>2. Image Processing</h4>
        <p>Images uploaded for food analysis are processed by Google Gemini API. We do not permanently store your personal photos on our servers unless you explicitly save them to your history.</p>

        <h4>3. Third-Party Services</h4>
        <p>We use Firebase for authentication and database services, and PayPal for payment processing. These parties have their own privacy policies.</p>

        <h4>4. Data Deletion</h4>
        <p>You may request deletion of your account and all associated data at any time by contacting support@broapp.com.</p>
    </div>
);

const RefundContent = () => (
    <div>
        <h3 style={{ color: 'white' }}>Refund & Cancellation Policy</h3>

        <h4>1. Subscription Cancellation</h4>
        <p>You may cancel your subscription at any time.
            <br />- If you cancel, your premium access will continue until the end of your current billing period.
            <br />- Recurring payments will stop immediately.</p>

        <h4>2. Refunds</h4>
        <p>We offer a <strong>7-day money-back guarantee</strong> for the initial subscription payment if you are not satisfied with the service.</p>
        <p>To request a refund, go to the "Settings" or "Paywall" section and click "Request Refund", or email support@broapp.com with your transaction ID.</p>

        <h4>3. Automated Processing</h4>
        <p>Refund requests made within the 7-day window through the app are processed automatically. Funds typically return to your account within 5-10 business days.</p>
    </div>
);

export default LegalCenter;
