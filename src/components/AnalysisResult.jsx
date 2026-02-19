import React, { useState, useEffect } from 'react';
import { Flame, Beef, Droplet, Wheat, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeImage } from '../services/ai';
import '../styles/index.css';

const AnalysisResult = ({ image, onClose }) => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const processImage = async () => {
            const result = await analyzeImage(image, language);
            setData(result);
            setLoading(false);
        };
        processImage();
    }, [image, language]);

    if (loading) {
        return (
            <div className="full-screen flex-center" style={{ flexDirection: 'column', background: 'rgba(0,0,0,0.9)' }}>
                <div className="animate-pulse" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--bro-green)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                <h2 className="mt-4" style={{ marginTop: '20px', color: 'var(--bro-green)' }}>{t('analyzing')}</h2>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Handle Non-Food output from AI
    if (data && data.isFood === false) {
        return (
            <div className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '30px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤔</div>
                <h2 style={{ color: 'var(--bro-error)', marginBottom: '10px' }}>Not Food?</h2>
                <p style={{ color: '#ccc', marginBottom: '30px' }}>
                    {data.reason || "We couldn't identify this as food. Please try again."}
                </p>
                <button className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
                    <ArrowLeft size={20} /> {t('scanMore')}
                </button>
            </div>
        );
    }

    if (!data) return null; // Should not happen

    return (
        <div className="full-screen" style={{ background: '#0a0a0a', padding: '20px', overflowY: 'auto' }}>
            <img src={image} alt="Captured Food" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '20px', marginBottom: '20px' }} />

            <div className="glass-panel" style={{ padding: '20px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--bro-green)' }}>{data.foodName}</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <NutrientCard icon={<Flame color="#ff4d4d" />} label={t('calories')} value={data.calories} unit="kcal" />
                    <NutrientCard icon={<Beef color="#ffaa00" />} label={t('protein')} value={data.protein} unit="g" />
                    <NutrientCard icon={<Wheat color="#d4d400" />} label={t('carbs')} value={data.carbs} unit="g" />
                    <NutrientCard icon={<Droplet color="#00aaff" />} label={t('fat')} value={data.fat} unit="g" />
                </div>

                <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '15px' }}>
                    <h3>{t('healthScore')}</h3>
                    <div style={{ width: '100%', height: '10px', background: '#333', borderRadius: '5px', marginTop: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${data.healthScore}%`, height: '100%', background: 'var(--bro-green)' }}></div>
                    </div>
                    <p style={{ textAlign: 'right', marginTop: '5px', color: 'var(--bro-green)' }}>{data.healthScore}/100</p>
                    {data.briefTip && <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#ccc', fontStyle: 'italic', borderTop: '1px solid #333', paddingTop: '10px' }}>💡 {data.briefTip}</p>}
                </div>
            </div>

            <button className="btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '30px', justifyContent: 'center' }}>
                <ArrowLeft size={20} /> {t('scanMore')}
            </button>
        </div>
    );
};

const NutrientCard = ({ icon, label, value, unit }) => (
    <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        {icon}
        <span style={{ fontSize: '0.9rem', color: '#888' }}>{label}</span>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}{unit}</span>
    </div>
);

export default AnalysisResult;
