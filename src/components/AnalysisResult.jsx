import React, { useState, useEffect, useRef } from 'react';
import { Flame, Beef, Droplet, Wheat, ArrowLeft, Volume2, Leaf, Instagram, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { analyzeImage } from '../services/ai';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import '../styles/index.css';

const AnalysisResult = ({ image, onClose, userDiet = 'none', isRoastMode = false }) => {
    const { t, language } = useLanguage();
    const { user, decrementScans } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const hasSavedInfo = useRef(false);
    const captureRef = useRef(null);

    useEffect(() => {
        const processImage = async () => {
            try {
                // Pass isRoastMode to ai.js
                const result = await analyzeImage(image, language, userDiet, isRoastMode);
                setData(result);
                setLoading(false);

                // Save to history securely, avoiding duplicate saves in React Strict Mode
                if (!hasSavedInfo.current && result && result.isFood !== false && user) {
                    hasSavedInfo.current = true;
                    decrementScans(); // Consume use immediately upon successful analysis
                    try {
                        await addDoc(collection(db, "scans"), {
                            userId: user.uid,
                            foodName: result.foodName,
                            calories: result.calories,
                            protein: result.protein,
                            carbs: result.carbs,
                            fat: result.fat,
                            healthScore: result.healthScore,
                            createdAt: new Date()
                        });
                    } catch (e) {
                        console.error("Failed to save scan to history", e);
                    }
                }
            } catch (err) {
                console.error("Analysis Error:", err);
                setLoading(false);
            }
        };
        processImage();
    }, [image, language, userDiet, user, decrementScans, isRoastMode]);

    const handleShareInstagram = async () => {
        if (!captureRef.current) return;
        try {
            const canvas = await html2canvas(captureRef.current, { useCORS: true, backgroundColor: '#0a0a0a' });
            const capturedImage = canvas.toDataURL('image/jpeg', 0.9);

            // Try Web Share API (Mobile)
            if (navigator.share) {
                const response = await fetch(capturedImage);
                const blob = await response.blob();
                const file = new File([blob], 'smartcal-analysis.jpg', { type: 'image/jpeg' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'SmartCal AI Analysis',
                        text: `Check out my meal: ${data.foodName} (${data.calories}kcal)!`,
                        files: [file]
                    });
                    return;
                }
            }
            // Fallback: Download image (PC / Unsupported browser)
            const link = document.createElement('a');
            link.href = capturedImage;
            link.download = 'smartcal-analysis.jpg';
            link.click();
            alert("Image saved! You can now share it to Instagram or your friends.");
        } catch (err) {
            console.error("Failed to capture image", err);
            alert("Failed to share image. Try taking a screenshot instead!");
        }
    };

    if (loading) {
        return (
            <div className="full-screen flex-center" style={{ flexDirection: 'column', background: 'rgba(0,0,0,0.9)' }}>
                {isRoastMode ? (
                    <div className="animate-pulse" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #ff4d4d', borderTopColor: 'transparent', animation: 'spin 0.5s linear infinite' }}></div>
                ) : (
                    <div className="animate-pulse" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--bro-green)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                )}
                <h2 className="mt-4" style={{ marginTop: '20px', color: isRoastMode ? '#ff4d4d' : 'var(--bro-green)' }}>
                    {isRoastMode ? 'Preparing a brutal roast...' : t('analyzing')}
                </h2>
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
        <div className="full-screen" ref={captureRef} style={{
            position: 'relative',
            background: '#0a0a0a',
            overflow: 'hidden'
        }}>
            {/* Full Screen Background Image */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0
            }}></div>

            {/* Dark Gradient Overlay for Readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
                zIndex: 1
            }}></div>

            {/* Scrollable Content Container */}
            <div className="no-scrollbar" style={{ position: 'relative', zIndex: 10, padding: '30px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

                {isRoastMode && (
                    <div style={{ alignSelf: 'center', background: 'rgba(255,50,50,0.8)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <AlertTriangle size={16} /> Roast Mode Result
                    </div>
                )}

                <div className="glass-panel" style={{
                    padding: '25px',
                    background: 'rgba(20, 20, 20, 0.6)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    borderRadius: '24px',
                    border: isRoastMode ? '1px solid rgba(255,50,50,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isRoastMode ? '0 10px 40px rgba(255,50,50,0.2)' : '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                    <h1 style={{ fontSize: '2.2rem', marginBottom: '15px', color: isRoastMode ? '#ff4d4d' : 'var(--bro-green)', textShadow: isRoastMode ? '0 2px 10px rgba(255,50,50,0.3)' : '0 2px 10px rgba(0,255,136,0.3)' }}>{data.foodName}</h1>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <NutrientCard icon={<Flame color="#ff4d4d" />} label={t('calories')} value={data.calories} unit="kcal" />
                        <NutrientCard icon={<Beef color="#ffaa00" />} label={t('protein')} value={data.protein} unit="g" />
                        <NutrientCard icon={<Wheat color="#d4d400" />} label={t('carbs')} value={data.carbs} unit="g" />
                        <NutrientCard icon={<Droplet color="#00aaff" />} label={t('fat')} value={data.fat} unit="g" />
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {/* Dietary Warning */}
                        {data.isSafe === false && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                borderRadius: '12px',
                                padding: '12px',
                                marginBottom: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                                <div>
                                    <strong style={{ color: '#ef4444', display: 'block' }}>Dietary Warning</strong>
                                    <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{data.warning}</span>
                                </div>
                            </div>
                        )}

                        {/* Eco-Scan & Health Score */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ color: 'white', fontSize: '1.1rem' }}>{t('healthScore')}</h3>
                            {data.carbonFootprint && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px' }}>
                                    <Leaf size={14} color={data.carbonFootprint === 'Low' ? '#4ade80' : data.carbonFootprint === 'Medium' ? '#facc15' : '#ef4444'} />
                                    <span style={{ fontSize: '0.8rem', color: '#eee', fontWeight: 'bold' }}>Eco: {data.carbonFootprint}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.3)' }}>
                            <div style={{ width: `${data.healthScore}%`, height: '100%', background: 'linear-gradient(90deg, #00b09b, var(--bro-green))', boxShadow: '0 0 10px var(--bro-green)' }}></div>
                        </div>
                        <p style={{ textAlign: 'right', marginTop: '5px', color: 'var(--bro-green)', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.healthScore}/100</p>

                        <p style={{
                            marginTop: '10px',
                            fontSize: '0.95rem',
                            color: isRoastMode ? '#ffb3b3' : '#ddd',
                            fontStyle: 'italic',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            paddingTop: '10px',
                            lineHeight: '1.5',
                            fontWeight: isRoastMode ? 'bold' : 'normal'
                        }}>
                            {isRoastMode ? '🔥 ' : '💡 '}
                            {data.briefTip}
                        </p>
                        {data.sustainabilityTip && <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#aaa', fontStyle: 'italic', lineHeight: '1.4' }}>🌿 {data.sustainabilityTip}</p>}

                        {/* Voice Coach Button */}
                        <button
                            data-html2canvas-ignore // Don't include this in the screenshot
                            onClick={() => {
                                const text = `${data.foodName}. ${data.calories} calories. ${data.briefTip}`;
                                const utterance = new SpeechSynthesisUtterance(text);
                                if (language === 'ko') utterance.lang = 'ko-KR';
                                else if (language === 'ja') utterance.lang = 'ja-JP';
                                else if (language === 'es') utterance.lang = 'es-ES';
                                else if (language === 'fr') utterance.lang = 'fr-FR';
                                else if (language === 'zh') utterance.lang = 'zh-CN';
                                else utterance.lang = 'en-US';

                                window.speechSynthesis.cancel();
                                window.speechSynthesis.speak(utterance);
                            }}
                            style={{
                                marginTop: '20px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                width: '100%',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <Volume2 size={20} /> Listen to {isRoastMode ? 'Roast' : 'Analysis'}
                        </button>
                    </div>
                </div>

                {/* Share and Back Buttons (Not included in screenshot if we wanted, but we might want them. Actually, let's ignore them from canvas) */}
                <div data-html2canvas-ignore style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={handleShareInstagram} style={{
                        flex: 1,
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        color: 'white',
                        fontSize: '1.05rem',
                        fontWeight: 'bold',
                        padding: '16px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(220, 39, 67, 0.4)',
                        cursor: 'pointer'
                    }}>
                        <Instagram size={22} /> Insta Share
                    </button>

                    <button className="btn-primary" onClick={onClose} style={{
                        flex: 1,
                        justifyContent: 'center',
                        background: 'white',
                        color: '#0a0a0a',
                        fontSize: '1.05rem',
                        padding: '16px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 15px rgba(255,255,255,0.2)',
                        border: 'none'
                    }}>
                        <ArrowLeft size={22} /> {t('scanMore')}
                    </button>
                </div>
            </div>
            {/* Added for html2canvas ignoring elements */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

const NutrientCard = ({ icon, label, value, unit }) => (
    <div style={{
        background: 'rgba(0,0,0,0.5)',
        padding: '12px',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid rgba(255,255,255,0.05)'
    }}>
        {icon}
        <span style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'white' }}>{value}<span style={{ fontSize: '0.9rem', color: '#888', marginLeft: '2px' }}>{unit}</span></span>
    </div>
);

export default AnalysisResult;
