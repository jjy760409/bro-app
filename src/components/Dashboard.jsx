import React, { useState, useEffect } from 'react';
import { Camera, Flame, Beef, Droplet, Wheat, Target, Compass } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const Dashboard = ({ onStartScan }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [todayStats, setTodayStats] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, scanCount: 0 });
    const [loading, setLoading] = useState(true);

    // Hardcoded goals for now. Later can be fetched from User Profile.
    const goals = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

    useEffect(() => {
        const fetchTodayData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Get start of today
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                const q = query(
                    collection(db, 'scans'),
                    where('userId', '==', user.uid),
                    where('createdAt', '>=', startOfToday),
                    orderBy('createdAt', 'desc')
                );

                const snapshot = await getDocs(q);
                let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, scanCount: 0 };

                snapshot.forEach(doc => {
                    const data = doc.data();
                    totals.calories += (data.calories || 0);
                    totals.protein += (data.protein || 0);
                    totals.carbs += (data.carbs || 0);
                    totals.fat += (data.fat || 0);
                    totals.scanCount++;
                });

                setTodayStats(totals);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            }
            setLoading(false);
        };

        fetchTodayData();
    }, [user]);

    const calPercent = Math.min((todayStats.calories / goals.calories) * 100, 100);

    return (
        <div className="full-screen" style={{ background: '#0a0a0a', overflowY: 'auto', padding: '20px', paddingBottom: '100px' }}>
            <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', margin: '0 auto' }}>

                {/* Header */}
                <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}>Hello, {user?.email?.split('@')[0] || 'Bro'}</h1>
                        <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem' }}>Let's crush your goals today.</p>
                    </div>
                </motion.div>

                {/* Main Progress Ring Map */}
                <motion.div variants={itemVariants} style={{
                    background: 'linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(30,30,30,0.8) 100%)',
                    borderRadius: '24px',
                    padding: '30px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--bro-green)', filter: 'blur(100px)', opacity: 0.2 }}></div>

                    <h2 style={{ color: '#ddd', fontSize: '1.1rem', marginBottom: '20px', alignSelf: 'flex-start', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Compass size={18} color="var(--bro-green)" /> Daily Navigator
                    </h2>

                    {/* Circular Progress (Simplified CSS implementation) */}
                    <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg width="180" height="180" viewBox="0 0 180 180">
                            {/* Background Track */}
                            <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                            {/* Progress Track */}
                            <motion.circle
                                cx="90" cy="90" r="80" fill="none"
                                stroke="var(--bro-green)" strokeWidth="12" strokeLinecap="round"
                                strokeDasharray="502" // 2 * pi * r
                                initial={{ strokeDashoffset: 502 }}
                                animate={{ strokeDashoffset: 502 - (502 * calPercent) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Flame size={24} color={calPercent > 100 ? '#ff4d4d' : 'white'} style={{ marginBottom: '5px' }} />
                            <span style={{ fontSize: '2rem', fontWeight: '900', color: 'white', lineHeight: '1' }}>
                                {todayStats.calories}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>/ {goals.calories} kcal</span>
                        </div>
                    </div>
                </motion.div>

                {/* Macro Grid */}
                <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <MacroCard icon={<Beef color="#ffaa00" size={18} />} title="Protein" current={todayStats.protein} target={goals.protein} color="#ffaa00" />
                    <MacroCard icon={<Wheat color="#d4d400" size={18} />} title="Carbs" current={todayStats.carbs} target={goals.carbs} color="#d4d400" />
                    <MacroCard icon={<Droplet color="#00aaff" size={18} />} title="Fat" current={todayStats.fat} target={goals.fat} color="#00aaff" />
                </motion.div>

            </motion.div>

            {/* Floating Action Button (FAB) for Scanning */}
            <motion.button
                initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', delay: 0.8 }}
                onClick={onStartScan}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, var(--bro-green) 0%, #00c060 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '16px 32px',
                    fontSize: '1.2rem',
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 10px 25px rgba(0,255,136,0.4)',
                    cursor: 'pointer',
                    zIndex: 100
                }}
            >
                <Camera size={24} /> {t('scanFood')}
            </motion.button>
        </div>
    );
};

const MacroCard = ({ icon, title, current, target, color }) => {
    const progress = Math.min((current / target) * 100, 100);
    return (
        <div style={{
            background: 'rgba(20,20,20,0.6)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icon}
                <span style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 'bold' }}>{title}</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>
                {current}<span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '2px' }}>/{target}g</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', background: color, borderRadius: '3px' }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
