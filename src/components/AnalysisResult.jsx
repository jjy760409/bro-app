import React, { useState, useEffect, useRef } from 'react';
import { Flame, Beef, Droplet, Wheat, ArrowLeft, Volume2, Leaf, Instagram, AlertTriangle, ScanLine } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { analyzeImage } from '../services/ai';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import '../styles/index.css';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 12 } }
};

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
                // Slight artificial delay just to show off the cool scanning animation for at least 1.5 seconds minimum
                setTimeout(() => setLoading(false), 1500);

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
            <div className="full-screen" style={{ position: 'relative', background: '#000', overflow: 'hidden' }}>
                {/* Background Image Blurred for context */}
                <motion.div
                    initial={{ scale: 1.1, filter: 'blur(0px) brightness(1)' }}
                    animate={{ scale: 1, filter: 'blur(8px) brightness(0.4)' }}
                    transition={{ duration: 1 }}
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center',
                        zIndex: 0
                    }}
                />

                {/* AI Scanning overlay text */}
                <div style={{ position: 'absolute', top: '15%', width: '100%', textAlign: 'center', zIndex: 10 }}>
                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ScanLine size={48} color={isRoastMode ? '#ff4d4d' : '#00ff88'} style={{ margin: '0 auto 15px auto' }} />
                        <h2 style={{
                            color: isRoastMode ? '#ff4d4d' : '#00ff88',
                            letterSpacing: '4px',
                            textTransform: 'uppercase',
                            textShadow: isRoastMode ? '0 0 20px rgba(255,77,77,0.8)' : '0 0 20px rgba(0,255,136,0.8)'
                        }}>
                            {isRoastMode ? 'AI ROASTING...' : 'AI ANALYZING...'}
                        </h2>
                        <p style={{ color: '#fff', fontSize: '1rem', marginTop: '10px', fontFamily: 'monospace', opacity: 0.8 }}>
                            Extracting real-time nutritional matrix
                        </p>
                    </motion.div>
                </div>

                {/* Laser scan line with glow */}
                <motion.div
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: '20vh',
                        background: isRoastMode
                            ? 'linear-gradient(to bottom, transparent, rgba(255,77,77,0.1), rgba(255,77,77,0.6), transparent)'
                            : 'linear-gradient(to bottom, transparent, rgba(0,255,136,0.1), rgba(0,255,136,0.6), transparent)',
                        borderBottom: isRoastMode ? '2px solid #ff4d4d' : '2px solid #00ff88',
                        boxShadow: isRoastMode ? '0 10px 30px #ff4d4d' : '0 10px 30px #00ff88',
                        zIndex: 5
                    }}
                />

                {/* Tech grid overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}></div>
            </div>
        );
    }

    // Handle Non-Food output from AI
    if (data && data.isFood === false) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '30px', textAlign: 'center' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }} style={{ fontSize: '4rem', marginBottom: '20px' }}>🤔</motion.div>
                <h2 style={{ color: 'var(--bro-error)', marginBottom: '10px' }}>Not Food?</h2>
                <p style={{ color: '#ccc', marginBottom: '30px' }}>
                    {data.reason || "We couldn't identify this as food. Please try it again from a better angle."}
                </p>
                <button className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
                    <ArrowLeft size={20} /> {t('scanMore')}
                </button>
            </motion.div>
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
            <motion.div
                initial={{ transform: 'scale(1.1)', filter: 'brightness(0.5) blur(10px)' }}
                animate={{ transform: 'scale(1)', filter: 'brightness(0.3) blur(0px)' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}
            />

            {/* Dark Gradient Overlay for Readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.95) 90%, #000 100%)',
                zIndex: 1
            }}></div>

            {/* Scrollable Content Container */}
            <div className="no-scrollbar" style={{ position: 'relative', zIndex: 10, padding: '30px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

                <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ width: '100%' }}>
                    {isRoastMode && (
                        <motion.div variants={itemVariants} style={{ alignSelf: 'center', background: 'rgba(255,50,50,0.8)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <AlertTriangle size={16} /> Roast Mode Result
                        </motion.div>
                    )}

                    <div className="glass-panel" style={{
                        padding: '25px',
                        background: 'rgba(10, 10, 10, 0.65)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '28px',
                        border: isRoastMode ? '1px solid rgba(255,50,50,0.4)' : '1px solid rgba(255,255,255,0.15)',
                        boxShadow: isRoastMode ? '0 20px 50px rgba(255,50,50,0.3)' : '0 20px 50px rgba(0,0,0,0.6)'
                    }}>
                        <motion.h1 variants={itemVariants} style={{ fontSize: '2.4rem', marginBottom: '20px', color: isRoastMode ? '#ff4d4d' : '#00ff88', textShadow: isRoastMode ? '0 2px 15px rgba(255,50,50,0.5)' : '0 2px 15px rgba(0,255,136,0.4)', fontWeight: '900', letterSpacing: '-0.5px' }}>
                            {data.foodName}
                        </motion.h1>

                        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                            <NutrientCard icon={<Flame color="#ff4d4d" />} label={t('calories')} value={data.calories} unit="kcal" delay={0.1} />
                            <NutrientCard icon={<Beef color="#ffaa00" />} label={t('protein')} value={data.protein} unit="g" delay={0.2} />
                            <NutrientCard icon={<Wheat color="#d4d400" />} label={t('carbs')} value={data.carbs} unit="g" delay={0.3} />
                            <NutrientCard icon={<Droplet color="#00aaff" />} label={t('fat')} value={data.fat} unit="g" delay={0.4} />
                        </motion.div>

                        <motion.div variants={itemVariants} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {/* Dietary Warning */}
                            {data.isSafe === false && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring' }}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.6)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                                    }}>
                                    <span style={{ fontSize: '1.8rem' }}>⚠️</span>
                                    <div>
                                        <strong style={{ color: '#ef4444', display: 'block', fontSize: '1.1rem' }}>Dietary Warning</strong>
                                        <span style={{ color: '#fca5a5', fontSize: '0.95rem' }}>{data.warning}</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Eco-Scan & Health Score */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>{t('healthScore')}</h3>
                                {data.carbonFootprint && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <Leaf size={16} color={data.carbonFootprint === 'Low' ? '#4ade80' : data.carbonFootprint === 'Medium' ? '#facc15' : '#ef4444'} />
                                        <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', letterSpacing: '0.5px' }}>Eco: {data.carbonFootprint}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ width: '100%', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.5)', position: 'relative' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: \`\${data.healthScore}%\` }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                style={{
                                    height: '100%',
                                    background: isRoastMode ? 'linear-gradient(90deg, #880000, #ff4d4d)' : 'linear-gradient(90deg, #005544, #00ff88)',
                                    boxShadow: isRoastMode ? '0 0 15px #ff4d4d' : '0 0 15px #00ff88'
                                }}
                                />
                            </div>
                            <p style={{ textAlign: 'right', marginTop: '8px', color: isRoastMode ? '#ff4d4d' : '#00ff88', fontWeight: '900', fontSize: '1.3rem' }}>{data.healthScore}<span style={{ fontSize: '0.9rem', color: '#888' }}>/100</span></p>

                            <motion.p
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
                                style={{
                                    marginTop: '15px',
                                    fontSize: '1.05rem',
                                    color: isRoastMode ? '#ffcccc' : '#f0f0f0',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    paddingTop: '15px',
                                    lineHeight: '1.6',
                                    fontWeight: isRoastMode ? 'bold' : '500'
                                }}>
                                {isRoastMode ? '🔥 ' : '💡 '}
                                {data.briefTip}
                            </motion.p>
                            {data.sustainabilityTip && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} style={{ marginTop: '10px', fontSize: '0.95rem', color: '#aaa', fontStyle: 'italic', lineHeight: '1.5' }}>🌿 {data.sustainabilityTip}</motion.p>}

                            {/* Voice Coach Button */}
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.2)' }}
                                whileTap={{ scale: 0.98 }}
                                data-html2canvas-ignore
                                onClick={() => {
                                    const text = \`\${data.foodName}. \${data.calories} calories. \${data.briefTip}\`;
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
                                marginTop: '25px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '16px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                width: '100%',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                            }}
                            >
                            <Volume2 size={22} /> Listen to {isRoastMode ? 'Roast' : 'Analysis'}
                        </motion.button>
                </motion.div>
            </div>

            {/* Share and Back Buttons */}
            <motion.div variants={itemVariants} data-html2canvas-ignore style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                <button onClick={handleShareInstagram} style={{
                    flex: 1,
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    padding: '18px',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    border: 'none',
                    boxShadow: '0 8px 25px rgba(220, 39, 67, 0.4)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Instagram size={24} /> Insta Share
                </button>

                <button onClick={onClose} style={{
                    flex: 1,
                    background: 'white',
                    color: '#0a0a0a',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    padding: '18px',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    border: 'none',
                    boxShadow: '0 8px 25px rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <ArrowLeft size={24} /> {t('scanMore')}
                </button>
            </motion.div>
        </motion.div>
            </div >
    <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div >
    );
};

const NutrientCard = ({ icon, label, value, unit, delay }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        style={{
            background: 'rgba(0,0,0,0.6)',
            padding: '16px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
        }}
    >
        {icon}
        <span style={{ fontSize: '0.9rem', color: '#bbb', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
        <span style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white' }}>
            {value}<span style={{ fontSize: '1rem', color: '#888', marginLeft: '3px', fontWeight: '600' }}>{unit}</span>
        </span>
    </motion.div>
);

export default AnalysisResult;
