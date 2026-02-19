import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/index.css';

const Share = ({ onClose }) => {
    const { t } = useLanguage();
    const appUrl = "https://smartcal-ai.com"; // User's domain

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Bro App',
                    text: 'Check out this AI food scanner!',
                    url: appUrl,
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            alert("Sharing not supported on this device. Copy the URL: " + appUrl);
        }
    };

    return (
        <div className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '30px', overflowY: 'auto' }}>
            <div className="flex items-center gap-4 mb-6" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.2rem', color: 'white', margin: 0 }}>Spread the Health</h1>
                <div style={{ width: '24px' }}></div> {/* Spacer */}
            </div>

            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '30px', width: '100%' }}>
                <div style={{ background: 'white', padding: '15px', borderRadius: '15px' }}>
                    <QRCodeSVG value={appUrl} size={200} />
                </div>
                <p style={{ color: 'var(--bro-green)', fontWeight: 'bold', fontSize: '1.2rem' }}>smartcal-ai.com</p>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button className="btn-primary" onClick={handleShare} style={{ width: '100%', justifyContent: 'center', gap: '10px' }}>
                    <Share2 size={20} /> Share Link
                </button>

                <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <h3 style={{ color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Download size={20} /> How to Install
                    </h3>
                    <ol style={{ color: '#ccc', paddingLeft: '20px', lineHeight: '1.6' }}>
                        <li>Open <b>Chrome</b> (Android) or <b>Safari</b> (iOS).</li>
                        <li>Tap the <b>Share</b> or <b>Menu</b> button.</li>
                        <li>Select <b>"Add to Home Screen"</b>.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default Share;
