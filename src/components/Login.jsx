import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Chrome, Zap, Shield, Globe, Award, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/index.css';

// Mock data for the social proof ticker to create global scale perception
const TICKER_ITEMS = [
    { country: '🇺🇸', user: 'Mike', action: 'scanned Chicken Breast', cal: '240kcal' },
    { country: '🇰🇷', user: '지훈', action: 'hit 14-day streak!', cal: '🔥' },
    { country: '🇯🇵', user: 'Ken', action: 'scanned Sushi Roll', cal: '320kcal' },
    { country: '🇬🇧', user: 'Sarah', action: 'unlocked Pro tier', cal: '⭐' },
    { country: '🇪🇸', user: 'Carlos', action: 'scanned Paella', cal: '450kcal' },
    { country: '🇨🇦', user: 'Alex', action: 'climbed to Rank #4', cal: '🏆' },
];

const Login = () => {
    const { login } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [tickerIndex, setTickerIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await login();
        } catch (error) {
            console.error(error);
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="full-screen" style={{
            background: '#050505',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"Inter", sans-serif'
        }}>
            {/* Background Effects */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

            {/* Grid Overlay */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ textAlign: 'center', marginTop: '4vh', maxWidth: '600px' }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', padding: '6px 14px', borderRadius: '30px', marginBottom: '20px' }}
                    >
                        <Zap size={16} color="#00ff88" />
                        <span style={{ color: '#00ff88', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>The Future of Health is Here</span>
                    </motion.div>

                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 4.5rem)',
                        fontWeight: '900',
                        color: 'white',
                        lineHeight: '1.1',
                        letterSpacing: '-1.5px',
                        marginBottom: '20px',
                        textShadow: '0 0 40px rgba(0,255,136,0.3)'
                    }}>
                        Stop Guessing.<br />
                        <span style={{ color: 'var(--bro-green)' }}>Start Knowing.</span>
                    </h1>

                    <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px', padding: '0 10px' }}>
                        The world's most advanced AI Nutrition Navigator. Scan your food in 1 second, get proactive health routing, and climb the global ranks.
                    </p>

                    {/* Primary CTA */}
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,136,0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        style={{
                            background: 'white',
                            color: '#050505',
                            border: 'none',
                            padding: '18px 36px',
                            borderRadius: '30px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            cursor: isLoggingIn ? 'wait' : 'pointer',
                            width: '100%',
                            maxWidth: '320px',
                            boxShadow: '0 10px 30px rgba(255,255,255,0.2)',
                            transition: 'all 0.3s'
                        }}
                    >
                        {isLoggingIn ? (
                            <Activity className="animate-spin" size={24} />
                        ) : (
                            <>
                                <Chrome size={24} />
                                Continue with Google
                            </>
                        )}
                    </motion.button>
                </motion.div>

                {/* Live Social Proof Ticker */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
                    style={{ marginTop: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(10px)', maxWidth: '400px', width: '100%' }}
                >
                    <div style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }}>
                        <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#00ff88', opacity: 0.4, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '20px' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tickerIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#ccc' }}
                            >
                                <span>{TICKER_ITEMS[tickerIndex].country} <strong>{TICKER_ITEMS[tickerIndex].user}</strong> {TICKER_ITEMS[tickerIndex].action}</span>
                                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{TICKER_ITEMS[tickerIndex].cal}</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Core Values Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '60px', width: '100%', maxWidth: '800px', marginBottom: '40px' }}
                >
                    <FeatureCard
                        icon={<Activity color="#00ff88" size={28} />}
                        title="Instant AI Analysis"
                        desc="Point, snap, and get millimeter-perfect macro tracking in under 2 seconds. No manual entry."
                    />
                    <FeatureCard
                        icon={<Globe color="#00aaff" size={28} />}
                        title="Proactive Routing"
                        desc="The AI doesn't just track; it tells you exactly what to do next to hit your goals."
                    />
                    <FeatureCard
                        icon={<Award color="#ffaa00" size={28} />}
                        title="Global Leaderboard"
                        desc="Join thousands of users worldwide. Build your streak, level up, and dominate the ranks."
                    />
                </motion.div>

                <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5, fontSize: '0.8rem', color: 'white' }}>
                    <Shield size={14} /> <span>Secured by Google Firebase Architecture</span>
                </div>
            </div>

            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div style={{
        background: 'linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        padding: '30px',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '15px',
        cursor: 'default'
    }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,255,136,0.1)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '16px' }}>
            {icon}
        </div>
        <h3 style={{ color: 'white', fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>{title}</h3>
        <p style={{ color: '#888', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>{desc}</p>
    </div>
);

export default Login;
