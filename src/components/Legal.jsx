import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/index.css';

const Legal = ({ onAccept }) => {
    const { t } = useLanguage();
    const [hasAccepted, setHasAccepted] = useState(false);

    useEffect(() => {
        const storedAcceptance = localStorage.getItem('bro_legal_accepted');
        if (storedAcceptance === 'true') {
            onAccept();
        }
    }, [onAccept]);

    const handleAccept = () => {
        localStorage.setItem('bro_legal_accepted', 'true');
        setHasAccepted(true);
        onAccept();
    };

    if (hasAccepted) return null; // Don't render if already accepted

    return (
        <div className="full-screen flex-center" style={{
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            padding: '20px',
            flexDirection: 'column'
        }}>
            <div className="glass-panel" style={{ padding: '30px', maxHeight: '80vh', overflowY: 'auto' }}>
                <h2 style={{ color: 'var(--bro-green)', marginBottom: '20px' }}>{t('legalTitle')}</h2>

                <div style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px', textAlign: 'left' }}>
                    <p><strong>1. Introduction</strong><br />Welcome to BroApp. By using our app, you agree to these terms.</p>
                    <br />
                    <p><strong>2. Privacy</strong><br />We process images locally or via secure API to analyze food. We do not store personal photos without consent.</p>
                    <br />
                    <p><strong>3. Health Disclaimer</strong><br />Generative AI may produce inaccurate results. Consult a doctor for medical advice.</p>
                    <br />
                    <p><strong>4. Intellectual Property</strong><br />All content is owned by BroApp Inc.</p>
                </div>

                <button className="btn-primary" onClick={handleAccept} style={{ width: '100%', justifyContent: 'center' }}>
                    {t('accept')}
                </button>
            </div>
        </div>
    );
};

export default Legal;
