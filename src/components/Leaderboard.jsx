import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Medal, ChevronLeft, Share2 } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import '../styles/index.css';

const Leaderboard = ({ onClose }) => {
    const { user, streak: currentStreak } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, orderBy('streak', 'desc'), limit(10));
                const snapshot = await getDocs(q);

                const fetchedLeaders = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    fetchedLeaders.push({
                        id: doc.id,
                        email: data.email || 'Anonymous Bro',
                        streak: data.streak || 0,
                    });
                });

                // If there are less than 3, pad with mock data for aesthetic purposes 
                // (Optional, but good for new apps)
                const defaultMock = [
                    { id: 'm1', email: 'ProteinKing', streak: 14 },
                    { id: 'm2', email: 'Chad123', streak: 12 },
                    { id: 'm3', email: 'FlexMaster', streak: 8 }
                ];

                if (fetchedLeaders.length === 0) {
                    setLeaders(defaultMock);
                } else {
                    setLeaders(fetchedLeaders);
                }
            } catch (err) {
                console.error("Error fetching leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    // Inject Tailwind CDN just for this component if it's not present, to ensure the Stitch design works flawlessly.
    useEffect(() => {
        if (!document.getElementById('tailwind-cdn')) {
            const script = document.createElement('script');
            script.id = 'tailwind-cdn';
            script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
            document.head.appendChild(script);

            const config = document.createElement('script');
            config.innerHTML = `
                tailwind.config = {
                    darkMode: "class",
                    theme: {
                        extend: {
                            colors: {
                                "primary": "#00ff88",
                                "background-light": "#f5f8f7",
                                "background-dark": "#0a0a0a",
                                "glass-bg": "rgba(20, 20, 20, 0.7)",
                            },
                            fontFamily: {
                                "display": ["Inter", "sans-serif"]
                            }
                        }
                    }
                }
            `;
            document.head.appendChild(config);
        }
    }, []);

    return (
        <div className="font-display text-slate-100 antialiased" style={{ backgroundColor: '#0a0a0a', minHeight: '100%', width: '100%' }}>
            <div className="relative flex min-h-screen w-full flex-col bg-background-dark overflow-x-hidden max-w-[430px] mx-auto shadow-2xl border-x border-white/5">
                {/* Header */}
                <header className="flex items-center justify-between px-6 pt-12 pb-6 sticky top-0 bg-background-dark/80 backdrop-blur-md z-50">
                    <button onClick={onClose} className="flex items-center justify-center size-10 rounded-full hover:bg-white/5 transition-colors">
                        <ChevronLeft className="text-white" />
                    </button>
                    <h1 className="text-white text-lg font-bold tracking-widest uppercase">Global Rank</h1>
                    <div className="size-10 flex items-center justify-end">
                        <Share2 className="text-primary" size={20} />
                    </div>
                </header>

                {/* User Rank Hero Section */}
                <section className="px-6 mb-8">
                    <div className="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative" style={{ borderRadius: '15px' }}>
                        <div className="relative z-10">
                            <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">Your Streak</p>
                            <h2 className="text-4xl font-bold text-white tracking-tight">{currentStreak} <span className="text-xl">Days</span></h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-primary text-sm font-bold leading-none" style={{ color: 'var(--bro-green)' }}>Keep pushing!</span>
                                <TrendingUp className="text-primary text-sm" size={16} color="#00ff88" />
                            </div>
                        </div>
                        <div className="relative z-10 size-16 bg-primary/20 rounded-full flex items-center justify-center">
                            <Trophy className="text-primary text-4xl" size={32} color="#00ff88" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 size-32 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(0,255,136,0.1)' }}></div>
                    </div>
                </section>

                {/* Leaderboard List */}
                <main className="flex-1 px-6 space-y-3 pb-32">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-sm font-bold tracking-wider uppercase">Top Performers</h3>
                        <span className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Global • Streak</span>
                    </div>

                    {loading ? (
                        <div className="text-center text-slate-400 py-10">Loading global ranks...</div>
                    ) : (
                        leaders.map((leader, index) => {
                            const isFirst = index === 0;
                            const isMe = user && leader.email === user.email;
                            return (
                                <div key={leader.id} className="glass-panel rounded-xl p-4 flex items-center gap-4 group transition-all" style={{
                                    border: isFirst ? '1px solid rgba(0,255,136,0.5)' : isMe ? '1px solid rgba(255,255,255,0.3)' : 'none',
                                    boxShadow: isFirst ? '0 0 15px rgba(0,255,136,0.2)' : 'none',
                                    borderRadius: '15px'
                                }}>
                                    <div className="flex flex-col items-center justify-center min-w-[24px]">
                                        <span className={`font-bold text-lg leading-none ${isFirst ? 'text-primary' : 'text-slate-300'}`} style={{ color: isFirst ? '#00ff88' : '' }}>
                                            {index + 1}
                                        </span>
                                        {isFirst && <Medal size={16} color="#00ff88" />}
                                    </div>
                                    <div className="size-12 rounded-full p-0.5" style={{ border: isFirst ? '2px solid #00ff88' : '1px solid rgba(255,255,255,0.1)' }}>
                                        <div className="size-full rounded-full bg-cover bg-center grayscale" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.email}')` }}></div>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-white font-bold text-base truncate">
                                            {leader.email.split('@')[0]}
                                            {isMe && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded text-white">YOU</span>}
                                        </p>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: isFirst ? 'rgba(0,255,136,0.7)' : 'rgba(255,255,255,0.4)' }}>
                                            {isFirst ? 'Bro Elite' : leader.streak > 5 ? 'Consistent' : 'Beginner'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl leading-none" style={{ color: isFirst ? '#00ff88' : 'white' }}>{leader.streak}</p>
                                        <p className="text-slate-500 text-[10px] uppercase font-medium">Streak</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </main>

                {/* Bottom Panel Information */}
                <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[382px] z-40">
                    <div className="glass-panel rounded-xl p-4 text-center" style={{ borderRadius: '15px' }}>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                            Global Rank is calculated based on consecutive daily streaks using the app. Keep logging your food to climb the ranks!
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Leaderboard;
